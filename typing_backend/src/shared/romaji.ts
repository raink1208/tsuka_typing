/**
 * ひらがな → ローマ字トークン変換
 * フロントエンドの composables/useRomaji.ts と完全同一ロジック
 * キーストロークリプレイ検証に使用する
 */

export interface KanaToken {
  kana: string
  primary: string
  patterns: string[]
}

const SMALL_KANA = new Set(['ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'ゃ', 'ゅ', 'ょ', 'ゎ'])

const KANA_MAP: Record<string, string[]> = {
  'あ': ['a'],  'い': ['i'],  'う': ['u'],  'え': ['e'],  'お': ['o'],
  'か': ['ka'], 'き': ['ki'], 'く': ['ku'], 'け': ['ke'], 'こ': ['ko'],
  'さ': ['sa'], 'し': ['shi', 'si'], 'す': ['su'], 'せ': ['se'], 'そ': ['so'],
  'た': ['ta'], 'ち': ['chi', 'ti'], 'つ': ['tsu', 'tu'], 'て': ['te'], 'と': ['to'],
  'な': ['na'], 'に': ['ni'], 'ぬ': ['nu'], 'ね': ['ne'], 'の': ['no'],
  'は': ['ha'], 'ひ': ['hi'], 'ふ': ['fu', 'hu'], 'へ': ['he'], 'ほ': ['ho'],
  'ま': ['ma'], 'み': ['mi'], 'む': ['mu'], 'め': ['me'], 'も': ['mo'],
  'や': ['ya'], 'ゆ': ['yu'], 'よ': ['yo'],
  'ら': ['ra', 'na'], 'り': ['ri', 'ni'], 'る': ['ru', 'nu'], 'れ': ['re', 'ne'], 'ろ': ['ro', 'no'],
  'わ': ['wa'], 'を': ['wo'],
  'ん': ['n', 'nn'],
  'が': ['ga'], 'ぎ': ['gi'], 'ぐ': ['gu'], 'げ': ['ge'], 'ご': ['go'],
  'ざ': ['za'], 'じ': ['ji', 'zi'], 'ず': ['zu'], 'ぜ': ['ze'], 'ぞ': ['zo'],
  'だ': ['da'], 'ぢ': ['di'], 'づ': ['du'], 'で': ['de'], 'ど': ['do'],
  'ば': ['ba'], 'び': ['bi'], 'ぶ': ['bu'], 'べ': ['be'], 'ぼ': ['bo'],
  'ぱ': ['pa'], 'ぴ': ['pi'], 'ぷ': ['pu'], 'ぺ': ['pe'], 'ぽ': ['po'],
  '０': ['0'], '１': ['1'], '２': ['2'], '３': ['3'], '４': ['4'],
  '５': ['5'], '６': ['6'], '７': ['7'], '８': ['8'], '９': ['9'],
  'ー': ['-'], '！': ['!'], '？': ['?'], '、': [','], '。': ['.'], '・': ['/'], '～': ['-'],
  'てぃ': ['teli', 'texi', 'thi'], 'てゅ': ['tyu'],
  'でぃ': ['deli', 'dexi', 'dhi'], 'でゅ': ['dyu'],
  'ふぁ': ['fa', 'fwa', 'fula', 'fuxa'],
  'ふぃ': ['fi', 'fwi', 'fyi', 'fuli', 'fuxi'],
  'ふぇ': ['fe', 'fwe', 'fye', 'fule', 'fuxe'],
  'ふぉ': ['fo', 'fwo', 'fulo', 'fuxo'],
  'つぁ': ['tsa'], 'つぃ': ['tsi'], 'つぇ': ['tse'], 'つぉ': ['tso'],
  'うぁ': ['wha'], 'うぃ': ['wi', 'whi'], 'うぇ': ['we', 'whe'], 'うぉ': ['who'],
  'きゃ': ['kya'], 'きゅ': ['kyu'], 'きょ': ['kyo'],
  'しゃ': ['sha', 'sya'], 'しゅ': ['shu', 'syu'], 'しょ': ['sho', 'syo'],
  'ちゃ': ['cha', 'tya'], 'ちゅ': ['chu', 'tyu'], 'ちょ': ['cho', 'tyo'],
  'にゃ': ['nya'], 'にゅ': ['nyu'], 'にょ': ['nyo'],
  'ひゃ': ['hya'], 'ひゅ': ['hyu'], 'ひょ': ['hyo'],
  'みゃ': ['mya'], 'みゅ': ['myu'], 'みょ': ['myo'],
  'りゃ': ['rya', 'nya'], 'りゅ': ['ryu', 'nyu'], 'りょ': ['ryo', 'nyo'],
  'ぎゃ': ['gya'], 'ぎゅ': ['gyu'], 'ぎょ': ['gyo'],
  'じゃ': ['ja', 'zya'], 'じゅ': ['ju', 'zyu'], 'じょ': ['jo', 'zyo'],
  'びゃ': ['bya'], 'びゅ': ['byu'], 'びょ': ['byo'],
  'ぴゃ': ['pya'], 'ぴゅ': ['pyu'], 'ぴょ': ['pyo'],
  'ぁ': ['la', 'xa'], 'ぃ': ['li', 'xi'], 'ぅ': ['lu', 'xu'],
  'ぇ': ['le', 'xe'], 'ぉ': ['lo', 'xo'],
  'ゃ': ['lya', 'xya'], 'ゅ': ['lyu', 'xyu'], 'ょ': ['lyo', 'xyo'],
  'ゎ': ['lwa', 'xwa'],
}

export const RA_NA_OVERRIDES: Record<string, string[]> = {
  'ら': ['na'], 'り': ['ni'], 'る': ['nu'], 'れ': ['ne'], 'ろ': ['no'],
  'りゃ': ['nya'], 'りゅ': ['nyu'], 'りょ': ['nyo'],
}

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
      tokens.push({ kana: ch, primary: patterns[0], patterns })
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
