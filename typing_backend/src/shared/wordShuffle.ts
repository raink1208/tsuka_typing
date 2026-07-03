/**
 * 単語列のシード制御 (フロントエンドの utils/wordShuffle.ts と完全同一ロジック)
 * 同じ seed + difficulty + count であれば常に同じ単語列が生成される。
 */
import { WORDS, type Word } from './words'
import type { Difficulty } from './types'

export const DIFF_WORD_FILTER: Record<Difficulty, (1 | 2 | 3)[]> = {
  easy:   [1],
  normal: [1, 2],
  hard:   [1, 2, 3],
}

const AVOID_REPEAT_WITHIN = 9
export const WORD_SEQUENCE_LENGTH = 400

/**
 * Mulberry32 PRNG — フロントエンドと完全一致必須
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

export function getWordPool(difficulty: Difficulty): Word[] {
  return WORDS.filter(w => DIFF_WORD_FILTER[difficulty].includes(w.difficulty))
}

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
