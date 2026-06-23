import { defineStore } from 'pinia'
import { WORDS, ENEMIES, type Word, type Enemy } from '~/data/words'
import { tokenizeHiragana, trySplitToken, type KanaToken } from '~/composables/useRomaji'

export type Difficulty = 'easy' | 'normal' | 'hard'
export type AnimState = 'idle' | 'attack' | 'damage' | 'dead'

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

export const useGameStore = defineStore('game', {
  state: () => ({
    phase: 'title' as 'title' | 'battle' | 'result',
    difficulty: 'normal' as Difficulty,

    score: 0,
    combo: 0,
    maxCombo: 0,
    timeLeft: 90,
    wordsCompleted: 0,
    totalKeystrokes: 0,
    correctKeystrokes: 0,

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

    usedRomaji: [] as string[],
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
  },

  actions: {
    setDifficulty(d: Difficulty) {
      this.difficulty = d
    },

    startGame() {
      const cfg = DIFF_CONFIG[this.difficulty]
      this.phase = 'battle'
      this.score = 0
      this.combo = 0
      this.maxCombo = 0
      this.timeLeft = cfg.time
      this.wordsCompleted = 0
      this.totalKeystrokes = 0
      this.correctKeystrokes = 0
      this.tsukasaHp = cfg.tsukasaMaxHp
      this.tsukasaMaxHp = cfg.tsukasaMaxHp
      this.usedRomaji = []
      this.transitioning = false
      this.tsukasaAnim = 'idle'
      this._spawnEnemy()
      this._spawnWord()
    },

    /** 難易度に応じた単語プールを返す */
    _getWordPool(): Word[] {
      const diffFilter: Record<Difficulty, (1 | 2 | 3)[]> = {
        easy:   [1],
        normal: [1, 2],
        hard:   [1, 2, 3],
      }
      return WORDS.filter(w => diffFilter[this.difficulty].includes(w.difficulty))
    },

    _spawnWord() {
      const pool = this._getWordPool()
      const available = pool.filter(w => !this.usedRomaji.includes(w.romaji))
      const candidates = available.length > 0 ? available : pool
      const word = candidates[Math.floor(Math.random() * candidates.length)]
      this.currentWord          = word
      this.currentTokens        = tokenizeHiragana(word.hiragana)
      this.currentDisplayRomaji = this.currentTokens.map(t => t.primary).join('')
      this.currentKanaIndex     = 0
      this.currentKanaTyped     = ''
      this.typedSoFar           = ''
      // 直近10単語を記憶して重複回避
      this.usedRomaji = [...this.usedRomaji.slice(-9), word.romaji]
    },

    _spawnEnemy() {
      const enemy = ENEMIES[Math.floor(Math.random() * ENEMIES.length)]
      this.currentEnemy = { ...enemy }
      this.enemyHp = enemy.maxHp
      this.enemyMaxHp = enemy.maxHp
      this.enemyAnim = 'idle'
    },

    onKeyPress(key: string) {
      if (this.phase !== 'battle' || !this.currentWord || this.transitioning) return
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
        this.onKeyPress(key)
        return
      }

      const split = trySplitToken(token, newTyped)
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

      const comboMult = 1 + Math.floor(this.combo / 5) * 0.5
      const earned = Math.floor(this.currentWord.points * comboMult)
      this.score += earned
      this.lastEarnedScore = earned
      this.showScorePopup = true
      this.tsukasaAnim = 'attack'

      const dmg = Math.floor(this.currentWord.points * 0.6)
      this.enemyHp = Math.max(0, this.enemyHp - dmg)

      if (this.enemyHp <= 0) {
        this.enemyAnim = 'dead'
        setTimeout(() => {
          this._spawnEnemy()
          this.showScorePopup = false
          this.tsukasaAnim = 'idle'
          this._spawnWord()
          this.transitioning = false
        }, 1600)
      } else {
        this.enemyAnim = 'damage'
        setTimeout(() => {
          this.enemyAnim = 'idle'
          this.tsukasaAnim = 'idle'
          this.showScorePopup = false
          this._spawnWord()
          this.transitioning = false
        }, 600)
      }
    },

    _onMiss() {
      this.combo = 0
      this.showMissFlash = true

      const cfg = DIFF_CONFIG[this.difficulty]
      const dmg = cfg.dmgPerMiss + (this.currentEnemy?.attackPower ?? 0)
      this.tsukasaHp = Math.max(0, this.tsukasaHp - dmg)
      this.tsukasaAnim = 'damage'
      this.enemyAnim = 'attack'

      setTimeout(() => {
        this.tsukasaAnim = 'idle'
        this.enemyAnim = 'idle'
        this.showMissFlash = false
      }, 500)

      if (this.tsukasaHp <= 0) {
        setTimeout(() => this.endGame(), 600)
      }
    },

    tick() {
      if (this.phase !== 'battle') return
      if (this.timeLeft <= 0) {
        this.endGame()
        return
      }
      this.timeLeft--
    },

    endGame() {
      this.phase = 'result'
    },

    resetToTitle() {
      this.phase = 'title'
    },
  },
})