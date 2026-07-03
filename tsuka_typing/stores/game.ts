import { defineStore } from 'pinia'
import { ENEMIES, type Word, type Enemy } from '~/data/words'
import { tokenizeHiragana, trySplitToken, RA_NA_OVERRIDES, type KanaToken } from '~/composables/useRomaji'

export type GameMode = 'normal' | 'ra-na'
export type AnimState = 'idle' | 'attack' | 'damage' | 'dead'

export interface GameRecord {
  score: number
  playTime: number        // 実プレイ秒数
  totalKeystrokes: number // 入力文字数
  correctKeystrokes: number // 正解文字数
  missCount: number
  accuracy: number        // %
  kps: number             // 秒間タイプ数
  maxCombo: number
  difficulty: Difficulty
  wordsCompleted: number
  playedAt: string        // ISO 8601
}

/** typing_backend へ送信するキーストロークログ（サーバー側リプレイ検証用） */
export interface KeystrokeEvent {
  /** ゲーム開始からの経過時間 (ms) */
  t: number
  /** 押されたキー */
  k: string
  /** 単語インデックス */
  w: number
}

type SubmitStatus = 'idle' | 'pending' | 'accepted' | 'rejected' | 'error'

interface DiffConfig {
  time: number
  tsukasaMaxHp: number
  dmgPerMiss: number
}

const DIFF_CONFIG: Record<Difficulty, DiffConfig> = {
  easy:   { time: 70, tsukasaMaxHp: 500, dmgPerMiss: 5  },
  normal: { time: 60,  tsukasaMaxHp: 300, dmgPerMiss: 10 },
  hard:   { time: 50,  tsukasaMaxHp: 200, dmgPerMiss: 20 },
}

/** 演出用ディレイ (ms) */
const ENEMY_DEFEATED_DELAY_MS = 1600
const WORD_TRANSITION_DELAY_MS = 600
const MISS_FLASH_DURATION_MS = 500
const MISS_GAMEOVER_DELAY_MS = 600

export const useGameStore = defineStore('game', {
  state: () => ({
    phase: 'title' as 'title' | 'battle' | 'result',
    difficulty: 'normal' as Difficulty,
    gameMode: 'normal' as GameMode,

    score: 0,
    combo: 0,
    maxCombo: 0,
    timeLeft: 90,
    wordsCompleted: 0,
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    elapsedTime: 0,

    tsukasaHp: 300,
    tsukasaMaxHp: 300,
    enemyHp: 0,
    enemyMaxHp: 0,
    currentEnemy: null as Enemy | null,

    tsukasaAnim: 'idle' as AnimState,
    enemyAnim: 'idle' as AnimState,

    currentWord:       null as Word | null,
    currentTokens:     [] as KanaToken[],
    currentKanaIndex:  0,
    currentKanaTyped:  '',
    currentDisplayRomaji: '',  // スポーン時に確定（未入力トークンの表示用）
    typedSoFar: '',            // 確定済みトークンの実際に打ったキー累積

    transitioning: false,
    showMissFlash: false,
    showScorePopup: false,
    lastEarnedScore: 0,
    /** HP0到達などでゲーム終了処理(endGame)が確定した後、追加の入力/多重endGame呼び出しを防ぐフラグ */
    gameEnding: false,

    /** 出題単語列を決定するシード値（typing_backend が発行する。オフライン時はローカル生成） */
    wordSeed: 0,
    /** シードから決定論的に生成された出題単語列 */
    wordSequence: [] as Word[],
    /** wordSequence 内の現在位置 */
    wordIndex: 0,

    lastRecord: null as GameRecord | null,

    /** typing_backend との連携用状態 */
    sessionId: null as string | null,
    sessionToken: null as string | null,
    /** performance.now() 基準（KeyboardEvent.timeStamp と同じ時間軸）のゲーム開始時刻 */
    gameStartTime: 0,
    /** Date.now() 基準のゲーム開始時刻（timeStamp が取得できない場合のフォールバック用） */
    gameStartTimeWall: 0,
    keystrokeLog: [] as KeystrokeEvent[],
    playerName: 'anonymous',
    submitStatus: 'idle' as SubmitStatus,
    submitReason: null as string | null,
    serverRank: null as number | null,
    serverScore: null as number | null,
  }),

  getters: {
    config: (s): DiffConfig => DIFF_CONFIG[s.difficulty],
    tsukasaHpPct: (s) =>
      s.tsukasaMaxHp > 0 ? Math.max(0, (s.tsukasaHp / s.tsukasaMaxHp) * 100) : 0,
    enemyHpPct: (s) =>
      s.enemyMaxHp > 0 ? Math.max(0, (s.enemyHp / s.enemyMaxHp) * 100) : 0,
    /**
     * 表示用ローマ字:
     * - 確定済み部分: 実際に打ったキー (typedSoFar)
     * - 入力中トークン: 打ちかけ + アクティブパターンの残り
     * - 未入力トークン: primary（スポーン時に固定）
     */
    displayRomaji: (s): string => {
      let display = s.typedSoFar
      const idx = s.currentKanaIndex
      if (idx < s.currentTokens.length) {
        const cur = s.currentTokens[idx]
        if (s.currentKanaTyped) {
          const active = cur.patterns.find(p => p.startsWith(s.currentKanaTyped)) ?? cur.primary
          display += active
        } else {
          display += cur.primary
        }
        for (let i = idx + 1; i < s.currentTokens.length; i++) {
          display += s.currentTokens[i].primary
        }
      }
      return display
    },

    /** 入力済み文字数（表示ハイライト用） */
    matchedDisplayLength: (s): number =>
      s.typedSoFar.length + s.currentKanaTyped.length,

    accuracy: (s) =>
      s.totalKeystrokes === 0
        ? 100
        : Math.round((s.correctKeystrokes / s.totalKeystrokes) * 100),

    kps: (s) =>
      s.elapsedTime > 0
        ? Math.round((s.correctKeystrokes / s.elapsedTime) * 10) / 10
        : 0,

    missCount: (s) => s.totalKeystrokes - s.correctKeystrokes,
  },

  actions: {
    setDifficulty(d: Difficulty) {
      this.difficulty = d
    },

    setGameMode(m: GameMode) {
      this.gameMode = m
    },

    setPlayerName(name: string) {
      this.playerName = name.trim() || 'anonymous'
    },

    async startGame() {
      const cfg = this.config
      this.phase = 'battle'
      this.score = 0
      this.combo = 0
      this.maxCombo = 0
      this.timeLeft = cfg.time
      this.wordsCompleted = 0
      this.totalKeystrokes = 0
      this.correctKeystrokes = 0
      this.elapsedTime = 0
      this.tsukasaHp = cfg.tsukasaMaxHp
      this.tsukasaMaxHp = cfg.tsukasaMaxHp
      this.transitioning = false
      this.tsukasaAnim = 'idle'

      this.sessionId = null
      this.sessionToken = null
      this.keystrokeLog = []
      this.submitStatus = 'idle'
      this.submitReason = null
      this.serverRank = null
      this.serverScore = null
      this.gameStartTime = performance.now()
      this.gameStartTimeWall = Date.now()
      this.gameEnding = false

      // typing_backend にセッション発行を依頼し、サーバー発行の wordSeed を採用する。
      // サーバーに接続できない場合はローカルでシードを生成し、オフラインでもプレイを継続する
      // （その場合スコアはランキングに送信されない）。
      try {
        const config = useRuntimeConfig()
        const res = await $fetch<{ sessionId: string; wordSeed: number; token: string; serverTime: number }>(
          `${config.public.apiBase}/api/game/start`,
          {
            method: 'POST',
            body: { difficulty: this.difficulty, gameMode: this.gameMode },
          },
        )
        this.sessionId = res.sessionId
        this.sessionToken = res.token
        this.wordSeed = res.wordSeed
        this.gameStartTime = performance.now()
        this.gameStartTimeWall = Date.now()
      } catch {
        this.wordSeed = generateWordSeed()
      }

      // シード値から出題単語列を決定論的に生成する
      // （同一シードであればサーバー側でも同じ単語列を再構築できる）
      this.wordSequence = generateWordSequence(this.wordSeed, this.difficulty)
      this.wordIndex = 0
      this._spawnEnemy()
      this._spawnWord()
    },

    _spawnWord() {
      if (this.wordIndex >= this.wordSequence.length) {
        // 想定外の長時間プレイに備えたフォールバック（通常到達しない）
        this.wordIndex = 0
      }
      const word = this.wordSequence[this.wordIndex]
      this.wordIndex++
      this.currentWord          = word
      this.currentTokens        = tokenizeHiragana(word.hiragana, this.gameMode === 'ra-na' ? RA_NA_OVERRIDES : undefined)
      this.currentDisplayRomaji = this.currentTokens.map(t => t.primary).join('')
      this.currentKanaIndex     = 0
      this.currentKanaTyped     = ''
      this.typedSoFar           = ''
    },

    _spawnEnemy() {
      const enemy = ENEMIES[Math.floor(Math.random() * ENEMIES.length)]
      this.currentEnemy = { ...enemy }
      this.enemyHp = enemy.maxHp
      this.enemyMaxHp = enemy.maxHp
      this.enemyAnim = 'idle'
    },

    onKeyPress(key: string, timeStamp?: number) {
      if (this.phase !== 'battle' || !this.currentWord || this.transitioning || this.gameEnding) return
      if (this.currentKanaIndex >= this.currentTokens.length) return

      // サーバー側リプレイ検証用に、実際に発生したキー入力イベントのみを記録する
      // （下の _processKeyPress の再帰呼び出しでは重複記録しない）
      // KeyboardEvent.timeStamp はブラウザがイベント発火時に打刻する高精度・単調増加の
      // 時刻であり、メインスレッドの遅延（GC/レイアウト等でキーイベント処理が一時的に
      // まとめて実行される場合）の影響を受けない。Date.now() をハンドラ内で呼ぶと、
      // 処理が遅延してまとめて走った複数キーの記録時刻がほぼ同一になり、サーバー側の
      // INTERVAL_TOO_SHORT 誤検知を招くため、可能な限り timeStamp を優先する。
      const t = timeStamp !== undefined
        ? Math.max(0, Math.round(timeStamp - this.gameStartTime))
        : Date.now() - this.gameStartTimeWall
      this.keystrokeLog.push({
        t,
        k: key,
        w: Math.max(0, this.wordIndex - 1),
      })

      this._processKeyPress(key)
    },

    _processKeyPress(key: string) {
      if (this.currentKanaIndex >= this.currentTokens.length) return

      const token    = this.currentTokens[this.currentKanaIndex]
      const newTyped = this.currentKanaTyped + key

      this.totalKeystrokes++

      // ── 完全一致: かな確定 ────────────────────────────────────────
      if (token.patterns.includes(newTyped)) {
        // より長いパターンへの前方一致がある場合は確定を保留（例: n → nn の途中）
        if (token.patterns.some(p => p.length > newTyped.length && p.startsWith(newTyped))) {
          this.correctKeystrokes++
          this.currentKanaTyped = newTyped
          return
        }
        this.correctKeystrokes++
        this.typedSoFar += newTyped
        this.currentKanaTyped = ''
        this.currentKanaIndex++
        if (this.currentKanaIndex >= this.currentTokens.length) {
          this._onWordComplete()
        }
        return
      }

      // ── 前方一致: 入力継続 ───────────────────────────────────────
      if (token.patterns.some(p => p.startsWith(newTyped))) {
        this.correctKeystrokes++
        this.currentKanaTyped = newTyped
        return
      }

      // ── 保留中の完全一致を確定して今回のキーを次トークンへ ────────
      // 例: ん(n保留中) の後に母音や別の子音が来た場合、n で ん を確定してから再処理
      if (this.currentKanaTyped && token.patterns.includes(this.currentKanaTyped)) {
        this.typedSoFar += this.currentKanaTyped
        this.currentKanaTyped = ''
        this.currentKanaIndex++
        if (this.currentKanaIndex >= this.currentTokens.length) {
          this._onWordComplete()
          return
        }
        // 今回のキーを次のトークンで再処理（totalKeystrokes の二重計上を防ぐ）
        this.totalKeystrokes--
        this._processKeyPress(key)
        return
      }

      const split = trySplitToken(token, newTyped, this.gameMode === 'ra-na' ? RA_NA_OVERRIDES : undefined)
      if (split) {
        this.correctKeystrokes++
        this.typedSoFar += newTyped  // 1文字目（分割前トークンの先頭かな）を確定
        this.currentTokens.splice(this.currentKanaIndex, 1, ...split)
        this.currentKanaIndex++  // 1文字目完了 → 2文字目（小書き仮名）へ
        this.currentKanaTyped = ''
        return
      }

      // ── 不一致: ミス ─────────────────────────────────────────────
      this._onMiss()
    },

    _onWordComplete() {
      if (!this.currentWord) return
      this.transitioning = true

      this.combo++
      if (this.combo > this.maxCombo) this.maxCombo = this.combo
      this.wordsCompleted++

      const romajiLength = this.currentWord.romaji.length
      const comboMult = 1 + Math.floor(this.combo / 5) * 0.5
      const earned = Math.floor(romajiLength * comboMult)
      this.score += earned
      this.lastEarnedScore = earned
      this.showScorePopup = true
      this.tsukasaAnim = 'attack'

      const dmg = romajiLength
      this.enemyHp = Math.max(0, this.enemyHp - dmg)

      if (this.enemyHp <= 0) {
        this.enemyAnim = 'dead'
        setTimeout(() => {
          this._spawnEnemy()
          this.showScorePopup = false
          this.tsukasaAnim = 'idle'
          this._spawnWord()
          this.transitioning = false
        }, ENEMY_DEFEATED_DELAY_MS)
      } else {
        this.enemyAnim = 'damage'
        setTimeout(() => {
          this.enemyAnim = 'idle'
          this.tsukasaAnim = 'idle'
          this.showScorePopup = false
          this._spawnWord()
          this.transitioning = false
        }, WORD_TRANSITION_DELAY_MS)
      }
    },

    _onMiss() {
      this.combo = 0
      this.showMissFlash = true

      const cfg = this.config
      const dmg = cfg.dmgPerMiss + (this.currentEnemy?.attackPower ?? 0)
      this.tsukasaHp = Math.max(0, this.tsukasaHp - dmg)
      this.tsukasaAnim = 'damage'
      this.enemyAnim = 'attack'

      setTimeout(() => {
        this.tsukasaAnim = 'idle'
        this.enemyAnim = 'idle'
        this.showMissFlash = false
      }, MISS_FLASH_DURATION_MS)

      // gameEnding は endGame() が実際に実行される(600ms後)までの猶予期間に
      // 追加のミスが発生して setTimeout が多重にスケジュールされ、
      // endGame()（ひいては submit）が複数回呼ばれてしまうのを防ぐガード。
      // これがないと同一セッションで submit が短時間に連続送信され、
      // サーバー側の SUBMIT_INTERVAL_TOO_SHORT / ALREADY_SUBMITTED を誘発する。
      if (this.tsukasaHp <= 0 && !this.gameEnding) {
        this.gameEnding = true
        setTimeout(() => this.endGame(), MISS_GAMEOVER_DELAY_MS)
      }
    },

    tick(deltaMs: number) {
      if (this.phase !== 'battle') return
      if (this.timeLeft <= 0) {
        if (this.gameEnding) return
        this.gameEnding = true
        this.endGame()
        return
      }
      this.timeLeft = Math.max(0, this.timeLeft - deltaMs / 1000)
    },

    async endGame() {
      this.elapsedTime = this.config.time - this.timeLeft
      this.phase = 'result'

      this.lastRecord = {
        score:             this.score,
        playTime:          this.elapsedTime,
        totalKeystrokes:   this.totalKeystrokes,
        correctKeystrokes: this.correctKeystrokes,
        missCount:         this.missCount,
        accuracy:          this.accuracy,
        kps:               this.kps,
        maxCombo:          this.maxCombo,
        difficulty:        this.difficulty,
        wordsCompleted:    this.wordsCompleted,
        playedAt:          new Date().toISOString(),
      }

      // typing_backend にリザルトを送信し、サーバー検証済みの順位を取得する
      // （ゲーム開始時にセッションが発行できていた場合のみ）
      if (!this.sessionId || !this.sessionToken) {
        this.submitStatus = 'error'
        this.submitReason = 'NO_SESSION'
        return
      }

      this.submitStatus = 'pending'
      try {
        const config = useRuntimeConfig()
        const res = await $fetch<{ accepted: boolean; rank?: number; serverScore?: number; reason?: string }>(
          `${config.public.apiBase}/api/game/submit`,
          {
            method: 'POST',
            body: {
              sessionId:    this.sessionId,
              token:        this.sessionToken,
              playerName:   this.playerName,
              result:       this.lastRecord,
              keystrokeLog: this.keystrokeLog,
            },
          },
        )

        if (res.accepted) {
          this.submitStatus = 'accepted'
          this.serverRank = res.rank ?? null
          this.serverScore = res.serverScore ?? null
        } else {
          this.submitStatus = 'rejected'
          this.submitReason = res.reason ?? 'REJECTED'
        }
      } catch {
        this.submitStatus = 'error'
        this.submitReason = 'NETWORK_ERROR'
      }
    },

    resetToTitle() {
      this.phase = 'title'
    },
  },
})