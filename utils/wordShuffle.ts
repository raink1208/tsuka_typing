import { WORDS, type Word } from '~/data/words'

export type Difficulty = 'easy' | 'normal' | 'hard'

/** 難易度ごとに出題する単語プールのフィルタ（difficulty 値の許可リスト） */
export const DIFF_WORD_FILTER: Record<Difficulty, (1 | 2 | 3)[]> = {
  easy:   [1],
  normal: [1, 2],
  hard:   [1, 2, 3],
}

/** 直近何件の単語との重複を避けるか */
const AVOID_REPEAT_WITHIN = 9

/** ゲーム開始時に生成する単語列の長さ（十分な余裕を持たせる） */
export const WORD_SEQUENCE_LENGTH = 400

/**
 * シードから決定論的な擬似乱数列を生成する Mulberry32 PRNG。
 * 同一のシードを与えれば、クライアント・サーバーで常に同じ乱数列が得られる。
 * （将来的にサーバー側でキーストロークログを再生検証する際、
 * 出題単語列を独立に再現するために使用する）
 */
export function createSeededRng(seed: number): () => number {
  let s = seed | 0
  return function next() {
    s = (s + 0x6D2B79F5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 難易度に応じた出題プールを取得する */
export function getWordPool(difficulty: Difficulty): Word[] {
  return WORDS.filter(w => DIFF_WORD_FILTER[difficulty].includes(w.difficulty))
}

/**
 * シード値から決定論的に単語列を生成する。
 * 同じ seed + difficulty + count であれば常に同じ単語列になるため、
 * サーバー側でも同一ロジックで単語列を再構築してリプレイ検証に利用できる。
 */
export function generateWordSequence(
  seed: number,
  difficulty: Difficulty,
  count: number = WORD_SEQUENCE_LENGTH,
): Word[] {
  const pool = getWordPool(difficulty)
  const rng = createSeededRng(seed)
  const result: Word[] = []
  const recentRomaji: string[] = []

  for (let i = 0; i < count; i++) {
    const available = pool.filter(w => !recentRomaji.includes(w.romaji))
    const candidates = available.length > 0 ? available : pool
    const idx = Math.floor(rng() * candidates.length)
    const word = candidates[idx]
    result.push(word)
    recentRomaji.push(word.romaji)
    if (recentRomaji.length > AVOID_REPEAT_WITHIN) recentRomaji.shift()
  }
  return result
}

/**
 * 新規ゲーム開始用のシード値を生成する。
 * 現状はクライアント側で暫定発行しているが、
 * バックエンド実装後は `POST /api/game/start` のレスポンスで
 * サーバーが発行した値に置き換える想定（docs/ranking-system-design.md 参照）。
 */
export function generateWordSeed(): number {
  return Math.floor(Math.random() * 0xffffffff)
}