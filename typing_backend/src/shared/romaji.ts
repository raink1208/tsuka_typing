/**
 * ひらがな → ローマ字トークン変換
 * フロントエンドの composables/useRomaji.ts と完全同一ロジック
 * キーストロークリプレイ検証に使用する
 *
 * かなマップ本体（kanaMap / raNaOverrides / smallKana）は shared-data/kana-map.json
 * （単一の情報源）から読み込む。追加・修正する場合は shared-data/kana-map.json を編集し、
 * `node shared-data/sync.mjs` で同期すること。
 */
import kanaMapData from './kana-map.json'

export interface KanaToken {
  kana: string
  primary: string
  patterns: string[]
}

const SMALL_KANA = new Set<string>(kanaMapData.smallKana)

const KANA_MAP: Record<string, string[]> = kanaMapData.kanaMap

export const RA_NA_OVERRIDES: Record<string, string[]> = kanaMapData.raNaOverrides


const SMALL_KANA_STANDALONE: Record<string, string[]> = Object.fromEntries(
  [...SMALL_KANA].map(kana => [kana, KANA_MAP[kana]]),
)

export function trySplitToken(
  token: KanaToken,
  typed: string,
  overrides?: Record<string, string[]>,
): KanaToken[] | null {
  if (token.kana.length !== 2) return null

  const firstKana  = token.kana[0]
  const secondKana = token.kana[1]

  const map = overrides ? { ...KANA_MAP, ...overrides } : KANA_MAP
  const firstPatterns  = map[firstKana]
  const secondPatterns = SMALL_KANA_STANDALONE[secondKana]

  if (!firstPatterns?.includes(typed)) return null
  if (!secondPatterns) return null

  return [
    { kana: firstKana,  primary: typed,            patterns: firstPatterns  },
    { kana: secondKana, primary: secondPatterns[0], patterns: secondPatterns },
  ]
}

export function tokenizeHiragana(
  hiragana: string,
  overrides?: Record<string, string[]>,
): KanaToken[] {
  const tokens: KanaToken[] = []
  let i = 0
  const map = overrides ? { ...KANA_MAP, ...overrides } : KANA_MAP

  while (i < hiragana.length) {
    const ch   = hiragana[i]
    const next = hiragana[i + 1] ?? ''

    if (ch === 'っ') {
      tokens.push({ kana: 'っ', primary: '', patterns: [] })
      i++
      continue
    }

    if (SMALL_KANA.has(next)) {
      const digraph = ch + next
      if (map[digraph]) {
        tokens.push({ kana: digraph, primary: map[digraph][0], patterns: map[digraph] })
        i += 2
        continue
      }
    }

    const patterns = map[ch]
    if (patterns) {
      // 語末の「ん」は次のかなによる確定ができず、必ず nn と2回入力しないと確定しないため
      // 表示（primary）も nn にして入力必須であることを明示する
      const isTrailingN = ch === 'ん' && i === hiragana.length - 1
      tokens.push({ kana: ch, primary: isTrailingN ? (patterns[1] ?? patterns[0]) : patterns[0], patterns })
    } else {
      tokens.push({ kana: ch, primary: ch, patterns: [ch] })
    }
    i++
  }

  // 促音（っ）解決
  for (let j = 0; j < tokens.length; j++) {
    if (tokens[j].kana !== 'っ') continue

    const nextTok = tokens[j + 1]
    if (!nextTok) {
      tokens.splice(j, 1)
      j--
      continue
    }

    const consSet = [...new Set(nextTok.patterns.map(p => p[0]))]
    const primary = nextTok.primary[0]

    tokens[j] = {
      kana: 'っ',
      primary,
      patterns: [...consSet, 'xtu', 'ltu'],
    }
  }

  return tokens
}
