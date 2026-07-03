/**
 * キーストロークログをサーバー側でリプレイしてスコアを再計算する。
 * フロントエンドの stores/game.ts の onKeyPress / _onWordComplete / _onMiss と
 * 完全同一のロジックを実装する。
 */
import { tokenizeHiragana, trySplitToken, RA_NA_OVERRIDES, type KanaToken } from '../shared/romaji'
import type { Word } from '../shared/words'
import type { KeystrokeEvent, GameMode } from '../shared/types'

export interface ReplayResult {
  score: number
  correctKeystrokes: number
  totalKeystrokes: number
  missCount: number
  maxCombo: number
  wordsCompleted: number
  kps: number
  accuracy: number
}

interface StepOutcome {
  correct: boolean
  wordComplete: boolean
  miss: boolean
  newKanaIndex: number
  newKanaTyped: string
  newTypedSoFar: string
  newTokens: KanaToken[]
}

/**
 * 1 キー入力をゲームの onKeyPress と同じロジックで処理する。
 * ん の保留確定など再帰処理も含む。
 */
function processKey(
  key: string,
  tokens: KanaToken[],
  kanaIndex: number,
  kanaTyped: string,
  typedSoFar: string,
  overrides?: Record<string, string[]>,
): StepOutcome {
  if (kanaIndex >= tokens.length) {
    return { correct: false, wordComplete: false, miss: false, newKanaIndex: kanaIndex, newKanaTyped: kanaTyped, newTypedSoFar: typedSoFar, newTokens: tokens }
  }

  const token    = tokens[kanaIndex]
  const newTyped = kanaTyped + key

  // ── 完全一致 ──────────────────────────────────────────────────────
  if (token.patterns.includes(newTyped)) {
    // より長いパターンへの前方一致がある場合は確定を保留
    if (token.patterns.some(p => p.length > newTyped.length && p.startsWith(newTyped))) {
      return { correct: true, wordComplete: false, miss: false, newKanaIndex: kanaIndex, newKanaTyped: newTyped, newTypedSoFar: typedSoFar, newTokens: tokens }
    }
    const nextIdx = kanaIndex + 1
    const wordComplete = nextIdx >= tokens.length
    return { correct: true, wordComplete, miss: false, newKanaIndex: nextIdx, newKanaTyped: '', newTypedSoFar: typedSoFar + newTyped, newTokens: tokens }
  }

  // ── 前方一致: 入力継続 ─────────────────────────────────────────────
  if (token.patterns.some(p => p.startsWith(newTyped))) {
    return { correct: true, wordComplete: false, miss: false, newKanaIndex: kanaIndex, newKanaTyped: newTyped, newTypedSoFar: typedSoFar, newTokens: tokens }
  }

  // ── 保留中の完全一致を確定して今回のキーを次トークンへ ────────────
  if (kanaTyped && token.patterns.includes(kanaTyped)) {
    const nextIdx = kanaIndex + 1
    const confirmedSoFar = typedSoFar + kanaTyped

    if (nextIdx >= tokens.length) {
      // 単語完了。現在のキーは「ロスト」（totalKeystrokes には含まれるが correctKeystrokes には含まれない）
      return { correct: false, wordComplete: true, miss: false, newKanaIndex: nextIdx, newKanaTyped: '', newTypedSoFar: confirmedSoFar, newTokens: tokens }
    }

    // 現在のキーを次トークンで再処理（totalKeystrokes の二重計上なし）
    return processKey(key, tokens, nextIdx, '', confirmedSoFar, overrides)
  }

  // ── 拗音トークン分割 ───────────────────────────────────────────────
  const split = trySplitToken(token, newTyped, overrides)
  if (split) {
    const newTokens = [...tokens]
    newTokens.splice(kanaIndex, 1, ...split)
    return { correct: true, wordComplete: false, miss: false, newKanaIndex: kanaIndex + 1, newKanaTyped: '', newTypedSoFar: typedSoFar + newTyped, newTokens }
  }

  // ── ミス ──────────────────────────────────────────────────────────
  return { correct: false, wordComplete: false, miss: true, newKanaIndex: kanaIndex, newKanaTyped: kanaTyped, newTypedSoFar: typedSoFar, newTokens: tokens }
}

/**
 * キーストロークログをリプレイしてゲーム結果を再計算する。
 * フロントエンドの startGame → onKeyPress → _onWordComplete /_onMiss の
 * 一連のフローをサーバーで再現する。
 */
export function simulateGame(
  wordSequence: Word[],
  keystrokeLog: KeystrokeEvent[],
  gameMode: GameMode,
): ReplayResult {
  const overrides = gameMode === 'ra-na' ? RA_NA_OVERRIDES : undefined

  let currentWordIdx = 0
  let tokens: KanaToken[] = wordSequence.length > 0
    ? tokenizeHiragana(wordSequence[0].hiragana, overrides)
    : []
  let kanaIndex  = 0
  let kanaTyped  = ''
  let typedSoFar = ''

  let combo          = 0
  let maxCombo       = 0
  let score          = 0
  let correctKs      = 0
  let wordsCompleted = 0

  for (const evt of keystrokeLog) {
    if (currentWordIdx >= wordSequence.length) break

    const result = processKey(evt.k, tokens, kanaIndex, kanaTyped, typedSoFar, overrides)

    if (result.correct) {
      correctKs++
    } else if (result.miss) {
      combo = 0
    }

    kanaIndex  = result.newKanaIndex
    kanaTyped  = result.newKanaTyped
    typedSoFar = result.newTypedSoFar
    tokens     = result.newTokens

    if (result.wordComplete) {
      combo++
      if (combo > maxCombo) maxCombo = combo
      wordsCompleted++

      const romajiLength = wordSequence[currentWordIdx].romaji.length
      const comboMult    = 1 + Math.floor(combo / 5) * 0.5
      score += Math.floor(romajiLength * comboMult)

      currentWordIdx++
      if (currentWordIdx < wordSequence.length) {
        tokens    = tokenizeHiragana(wordSequence[currentWordIdx].hiragana, overrides)
        kanaIndex = 0
        kanaTyped = ''
        typedSoFar = ''
      }
    }
  }

  const totalKeystrokes = keystrokeLog.length
  const missCount = totalKeystrokes - correctKs
  const accuracy  = totalKeystrokes === 0 ? 100 : Math.round((correctKs / totalKeystrokes) * 100)

  // KPS: 最後のキーストロークのタイムスタンプを基準にする
  const lastT = keystrokeLog.length > 0 ? keystrokeLog[keystrokeLog.length - 1].t : 0
  const kps   = lastT > 0 ? Math.round((correctKs / (lastT / 1000)) * 10) / 10 : 0

  return {
    score,
    correctKeystrokes: correctKs,
    totalKeystrokes,
    missCount,
    maxCombo,
    wordsCompleted,
    kps,
    accuracy,
  }
}

/**
 * 統計的異常検知（物理限界チェック）
 * 人間のタイピング速度の物理的上限を超えるものをリジェクトする。
 */
export interface AnomalyCheckResult {
  ok: boolean
  reason?: string
}

export function checkAnomalies(
  keystrokeLog: KeystrokeEvent[],
  result: ReplayResult,
): AnomalyCheckResult {
  // KPS > 15: 世界トップタイパーでも約12-14 kps
  if (result.kps > 15) {
    return { ok: false, reason: 'KPS_TOO_HIGH' }
  }

  // 完璧な正確率 + 高 KPS
  if (result.accuracy === 100 && result.kps > 12) {
    return { ok: false, reason: 'PERFECT_ACCURACY_KPS_TOO_HIGH' }
  }

  if (keystrokeLog.length < 2) return { ok: true }

  // キーストローク間隔の最小値チェック (< 30ms は人間の反応限界以下)
  for (let i = 1; i < keystrokeLog.length; i++) {
    const interval = keystrokeLog[i].t - keystrokeLog[i - 1].t
    if (interval < 30) {
      return { ok: false, reason: 'INTERVAL_TOO_SHORT' }
    }
  }

  // ボット検知: 標準偏差が極めて小さい (等間隔打鍵)
  if (keystrokeLog.length > 10) {
    const intervals = keystrokeLog.slice(1).map((e, i) => e.t - keystrokeLog[i].t)
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const variance = intervals.reduce((a, b) => a + (b - avg) ** 2, 0) / intervals.length
    const stdDev = Math.sqrt(variance)
    if (stdDev < 5) {
      return { ok: false, reason: 'BOT_DETECTED_UNIFORM_INTERVAL' }
    }
  }

  return { ok: true }
}
