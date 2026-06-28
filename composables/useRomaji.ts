/**
 * ひらがな → ローマ字トークン変換
 * 各かなに複数の入力パターンを対応付ける（例：つ → tsu / tu）
 */

export interface KanaToken {
  kana: string      // ひらがな文字（表示用）
  primary: string   // 主ローマ字表記（画面に表示する文字列）
  patterns: string[] // 有効な入力パターン一覧（primary が先頭）
}

/** 拗音を構成する小書き仮名（っ を除く） */
const SMALL_KANA = new Set(['ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'ゃ', 'ゅ', 'ょ', 'ゎ'])

/** かな → ローマ字パターン対応表（先頭が primary / 表示用） */
const KANA_MAP: Record<string, string[]> = {
  // ─── あ行 ────────────────────────────
  'あ': ['a'],
  'い': ['i'],
  'う': ['u'],
  'え': ['e'],
  'お': ['o'],
  // ─── か行 ────────────────────────────
  'か': ['ka'],
  'き': ['ki'],
  'く': ['ku'],
  'け': ['ke'],
  'こ': ['ko'],
  // ─── さ行 ────────────────────────────
  'さ': ['sa'],
  'し': ['shi', 'si'],
  'す': ['su'],
  'せ': ['se'],
  'そ': ['so'],
  // ─── た行 ────────────────────────────
  'た': ['ta'],
  'ち': ['chi', 'ti'],
  'つ': ['tsu', 'tu'],   // ← tu でも入力可
  'て': ['te'],
  'と': ['to'],
  // ─── な行 ────────────────────────────
  'な': ['na'],
  'に': ['ni'],
  'ぬ': ['nu'],
  'ね': ['ne'],
  'の': ['no'],
  // ─── は行 ────────────────────────────
  'は': ['ha'],
  'ひ': ['hi'],
  'ふ': ['fu', 'hu'],    // ← hu でも入力可
  'へ': ['he'],
  'ほ': ['ho'],
  // ─── ま行 ────────────────────────────
  'ま': ['ma'],
  'み': ['mi'],
  'む': ['mu'],
  'め': ['me'],
  'も': ['mo'],
  // ─── や行 ────────────────────────────
  'や': ['ya'],
  'ゆ': ['yu'],
  'よ': ['yo'],
  // ─── ら行 ────────────────────────────
  'ら': ['ra', 'na'],
  'り': ['ri', 'ni'],
  'る': ['ru', 'nu'],
  'れ': ['re', 'ne'],
  'ろ': ['ro', 'no'],
  // ─── わ行・ん ─────────────────────────
  'わ': ['wa'],
  'を': ['wo'],
  'ん': ['n', 'nn'],      // n でも nn でも確定可
  // ─── が行 ────────────────────────────
  'が': ['ga'],
  'ぎ': ['gi'],
  'ぐ': ['gu'],
  'げ': ['ge'],
  'ご': ['go'],
  // ─── ざ行 ────────────────────────────
  'ざ': ['za'],
  'じ': ['ji', 'zi'],
  'ず': ['zu'],
  'ぜ': ['ze'],
  'ぞ': ['zo'],
  // ─── だ行 ────────────────────────────
  'だ': ['da'],
  'ぢ': ['di'],
  'づ': ['du'],
  'で': ['de'],
  'ど': ['do'],
  // ─── ば行 ────────────────────────────
  'ば': ['ba'],
  'び': ['bi'],
  'ぶ': ['bu'],
  'べ': ['be'],
  'ぼ': ['bo'],
  // ─── ぱ行 ────────────────────────────
  'ぱ': ['pa'],
  'ぴ': ['pi'],
  'ぷ': ['pu'],
  'ぺ': ['pe'],
  'ぽ': ['po'],
  // ─── 記号・長音符 ─────────────────────
  'ー': ['-'],
  '！': ['!'],
  '？': ['?'],
  '、': [','],
  '。': ['.'],
  '・': ['/'],
  '～': ['-'],
  // ─── 拗音（単独かな + ゃゅょ） ────────
  // て行・で行 + 小書き母音
  'てぃ': ['teli', 'texi', 'thi'],
  'てゅ': ['tyu'],
  'でぃ': ['deli', 'dexi', 'dhi'],
  'でゅ': ['dyu'],
  // ふ + 小書き母音
  'ふぁ': ['fa', 'fwa', 'fula', 'fuxa'],
  'ふぃ': ['fi', 'fwi', 'fyi', 'fuli', 'fuxi'],
  'ふぇ': ['fe', 'fwe', 'fye', 'fule', 'fuxe'],
  'ふぉ': ['fo', 'fwo', 'fulo', 'fuxo'],
  // つ + 小書き母音
  'つぁ': ['tsa'],
  'つぃ': ['tsi'],
  'つぇ': ['tse'],
  'つぉ': ['tso'],
  // う + 小書き母音（ヴ行）
  'うぁ': ['wha'],
  'うぃ': ['wi', 'whi'],
  'うぇ': ['we', 'whe'],
  'うぉ': ['who'],
  'きゃ': ['kya'],
  'きゅ': ['kyu'],
  'きょ': ['kyo'],
  'しゃ': ['sha', 'sya'],
  'しゅ': ['shu', 'syu'],
  'しょ': ['sho', 'syo'],
  'ちゃ': ['cha', 'tya'],
  'ちゅ': ['chu', 'tyu'],
  'ちょ': ['cho', 'tyo'],
  'にゃ': ['nya'],
  'にゅ': ['nyu'],
  'にょ': ['nyo'],
  'ひゃ': ['hya'],
  'ひゅ': ['hyu'],
  'ひょ': ['hyo'],
  'みゃ': ['mya'],
  'みゅ': ['myu'],
  'みょ': ['myo'],
  'りゃ': ['rya', 'nya'],
  'りゅ': ['ryu', 'nyu'],
  'りょ': ['ryo', 'nyo'],
  'ぎゃ': ['gya'],
  'ぎゅ': ['gyu'],
  'ぎょ': ['gyo'],
  'じゃ': ['ja', 'zya'],
  'じゅ': ['ju', 'zyu'],
  'じょ': ['jo', 'zyo'],
  'びゃ': ['bya'],
  'びゅ': ['byu'],
  'びょ': ['byo'],
  'ぴゃ': ['pya'],
  'ぴゅ': ['pyu'],
  'ぴょ': ['pyo'],
  // ─── 小書き仮名（単独）─────────────────
  'ぁ': ['la', 'xa'],
  'ぃ': ['li', 'xi'],
  'ぅ': ['lu', 'xu'],
  'ぇ': ['le', 'xe'],
  'ぉ': ['lo', 'xo'],
  'ゃ': ['lya', 'xya'],
  'ゅ': ['lyu', 'xyu'],
  'ょ': ['lyo', 'xyo'],
  'ゎ': ['lwa', 'xwa'],
}

/**
 * 小書き仮名の単独入力パターン（l / x プレフィックス）
 * 拗音トークンを分割する際に、2文字目（小書き仮名）のパターンとして使用する。
 */
/**
 * ら行→な行モード用オーバーライドマップ
 * このモードではら行の入力パターンがな行のみになる
 */
export const RA_NA_OVERRIDES: Record<string, string[]> = {
  'ら': ['na'],
  'り': ['ni'],
  'る': ['nu'],
  'れ': ['ne'],
  'ろ': ['no'],
  'りゃ': ['nya'],
  'りゅ': ['nyu'],
  'りょ': ['nyo'],
}

export const SMALL_KANA_STANDALONE: Record<string, string[]> = {
  'ぁ': ['la', 'xa'],
  'ぃ': ['li', 'xi'],
  'ぅ': ['lu', 'xu'],
  'ぇ': ['le', 'xe'],
  'ぉ': ['lo', 'xo'],
  'ゃ': ['lya', 'xya'],
  'ゅ': ['lyu', 'xyu'],
  'ょ': ['lyo', 'xyo'],
  'ゎ': ['lwa', 'xwa'],
}

/**
 * 拗音トークンを2つに分割する。
 * typed が digraph の1文字目の完全なローマ字パターンである場合のみ分割を行う。
 *
 * 例: しょ + typed='si'  → [し(primary='si'), ょ(primary='lyo')]
 *     しょ + typed='shi' → [し(primary='shi'), ょ(primary='lyo')]
 *
 * @returns 分割後のトークン配列、または null（分割不可・対象外）
 */
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
    { kana: firstKana,  primary: typed,           patterns: firstPatterns  },
    { kana: secondKana, primary: secondPatterns[0], patterns: secondPatterns },
  ]
}

/**
 * ひらがな文字列を KanaToken 配列に変換する。
 * 拗音・促音（っ）も正しく処理する。
 */
export function tokenizeHiragana(
  hiragana: string,
  overrides?: Record<string, string[]>,
): KanaToken[] {
  const tokens: KanaToken[] = []
  let i = 0

  const map = overrides ? { ...KANA_MAP, ...overrides } : KANA_MAP

  // ── Step 1: ひらがなをトークン分割 ─────────────────────────────
  while (i < hiragana.length) {
    const ch   = hiragana[i]
    const next = hiragana[i + 1] ?? ''

    // 促音（っ）: 次のかなの子音を重ねるプレースホルダーとして追加
    if (ch === 'っ') {
      tokens.push({ kana: 'っ', primary: '', patterns: [] })
      i++
      continue
    }

    // 拗音: 現在のかな + 小書き仮名（っ 以外）
    if (SMALL_KANA.has(next)) {
      const digraph = ch + next
      if (map[digraph]) {
        tokens.push({
          kana:     digraph,
          primary:  map[digraph][0],
          patterns: map[digraph],
        })
        i += 2
        continue
      }
    }

    // 単独かな
    const patterns = map[ch]
    if (patterns) {
      tokens.push({ kana: ch, primary: patterns[0], patterns })
    } else {
      // 未知文字: そのまま通過
      tokens.push({ kana: ch, primary: ch, patterns: [ch] })
    }
    i++
  }

  // ── Step 2: 促音（っ）トークンを解決 ───────────────────────────
  for (let j = 0; j < tokens.length; j++) {
    if (tokens[j].kana !== 'っ') continue

    const nextTok = tokens[j + 1]
    if (!nextTok) {
      // 末尾の っ は削除（通常起こらない）
      tokens.splice(j, 1)
      j--
      continue
    }

    // 次のかなの各パターンの先頭子音を収集（重複除去）
    const consSet = [...new Set(nextTok.patterns.map(p => p[0]))]
    const primary = nextTok.primary[0]  // 主パターンの先頭子音

    tokens[j] = {
      kana:     'っ',
      primary,
      // 先頭子音ごとのパターン + xtu / ltu（代替）
      patterns: [...consSet, 'xtu', 'ltu'],
    }
  }

  return tokens
}