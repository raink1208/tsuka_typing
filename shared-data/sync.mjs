#!/usr/bin/env node
/**
 * shared-data 配下を単一の情報源として、フロントエンド（tsuka_typing）と
 * バックエンド（typing_backend）へ単語データ／かなマップを同期するスクリプト。
 *
 * ■ 編集対象（人が書くファイル）
 *   - shared-data/words/*.json  … カテゴリごとの単語ファイル
 *       1件の形式: { "kanji": "表示文字列", "hiragana": "よみ", "difficulty": 1|2|3 }
 *       ※ romaji は書かない。hiragana と kana-map.json から自動生成される。
 *   - shared-data/kana-map.json … かな→ローマ字パターン対応表
 *
 * ■ 生成物（直接編集しない）
 *   - tsuka_typing/data/words.json         / kana-map.json
 *   - typing_backend/src/shared/words.json / kana-map.json
 *
 * ■ 実行方法
 *   - `node shared-data/sync.mjs`
 *   - 各パッケージで `npm run dev` / `npm run build`（predev/prebuild で自動実行）
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { dirname, join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const WORDS_DIR = join(__dirname, 'words')
const KANA_MAP_FILE = join(__dirname, 'kana-map.json')

const TARGET_DIRS = [
  join(__dirname, '../tsuka_typing/data'),
  join(__dirname, '../typing_backend/src/shared'),
]

const kanaMapData = JSON.parse(readFileSync(KANA_MAP_FILE, 'utf-8'))
const KANA_MAP = kanaMapData.kanaMap
const SMALL_KANA = new Set(kanaMapData.smallKana)

/**
 * ひらがな文字列を主ローマ字表記へ変換する。
 * tsuka_typing/composables/useRomaji.ts の tokenizeHiragana と同じ規則で処理する
 * （拗音・促音・語末の「ん」・未知文字のそのまま通過）。
 *
 * @returns {{ romaji: string, unknown: string[] }} 変換結果と、かなマップに無い文字の一覧
 */
function toRomaji(hiragana) {
  const tokens = []
  const unknown = []
  let i = 0

  while (i < hiragana.length) {
    const ch = hiragana[i]
    const next = hiragana[i + 1] ?? ''

    // 促音（っ）: 後段で次のかなの先頭子音に解決する
    if (ch === 'っ') {
      tokens.push({ kana: 'っ', primary: '' })
      i++
      continue
    }

    // 拗音（かな + 小書き仮名）
    if (SMALL_KANA.has(next) && KANA_MAP[ch + next]) {
      tokens.push({ kana: ch + next, primary: KANA_MAP[ch + next][0] })
      i += 2
      continue
    }

    const patterns = KANA_MAP[ch]
    if (patterns) {
      // 語末の「ん」は nn と2回入力しないと確定しないため primary も nn にする
      const isTrailingN = ch === 'ん' && i === hiragana.length - 1
      tokens.push({ kana: ch, primary: isTrailingN ? (patterns[1] ?? patterns[0]) : patterns[0] })
    } else {
      unknown.push(ch)
      tokens.push({ kana: ch, primary: ch })
    }
    i++
  }

  // 促音を次のかなの先頭子音に解決する
  for (let j = 0; j < tokens.length; j++) {
    if (tokens[j].kana !== 'っ') continue
    const nextTok = tokens[j + 1]
    if (!nextTok || !nextTok.primary) {
      tokens.splice(j, 1)
      j--
      continue
    }
    tokens[j].primary = nextTok.primary[0]
  }

  return { romaji: tokens.map(t => t.primary).join(''), unknown }
}

/** shared-data/words/*.json を読み込み、検証しつつ1つの配列へマージする */
function buildWords() {
  const errors = []
  const warnings = []
  const words = []
  const seenHiragana = new Map()
  const seenRomaji = new Map()

  const files = readdirSync(WORDS_DIR)
    .filter(f => f.endsWith('.json'))
    .sort()

  if (files.length === 0) {
    errors.push(`${WORDS_DIR} に .json ファイルがありません`)
  }

  for (const file of files) {
    const category = basename(file, '.json')
    let entries
    try {
      // エディタによっては BOM 付きで保存されるため取り除く
      entries = JSON.parse(readFileSync(join(WORDS_DIR, file), 'utf-8').replace(/^\uFEFF/, ''))
    } catch (e) {
      errors.push(`words/${file}: JSON として読み込めません (${e.message})`)
      continue
    }
    if (!Array.isArray(entries)) {
      errors.push(`words/${file}: トップレベルは配列である必要があります`)
      continue
    }

    for (const [idx, entry] of entries.entries()) {
      const where = `words/${file}[${idx}]`

      if (typeof entry?.kanji !== 'string' || entry.kanji.length === 0) {
        errors.push(`${where}: kanji が空、または文字列ではありません`)
        continue
      }
      if (typeof entry.hiragana !== 'string' || entry.hiragana.length === 0) {
        errors.push(`${where} (${entry.kanji}): hiragana が空、または文字列ではありません`)
        continue
      }
      if (![1, 2, 3].includes(entry.difficulty)) {
        errors.push(`${where} (${entry.kanji}): difficulty は 1 / 2 / 3 のいずれかにしてください`)
        continue
      }
      if ('romaji' in entry) {
        errors.push(`${where} (${entry.kanji}): romaji は自動生成されるため記述しないでください`)
        continue
      }

      const { romaji, unknown } = toRomaji(entry.hiragana)

      // かなマップに無い文字。半角英数字・記号は意図的な通過なので警告しない
      const unexpected = [...new Set(unknown.filter(c => !/[\x20-\x7E]/.test(c)))]
      if (unexpected.length > 0) {
        warnings.push(
          `${where} (${entry.kanji}): かなマップに無い文字 ${unexpected.map(c => `"${c}"`).join(', ')} が `
          + `hiragana に含まれています（カタカナ・漢字の混入かもしれません）`,
        )
      }

      const dupHiragana = seenHiragana.get(entry.hiragana)
      if (dupHiragana) {
        errors.push(`${where} (${entry.kanji}): hiragana "${entry.hiragana}" が ${dupHiragana} と重複しています`)
        continue
      }
      seenHiragana.set(entry.hiragana, `${where} (${entry.kanji})`)

      const dupRomaji = seenRomaji.get(romaji)
      if (dupRomaji) {
        errors.push(`${where} (${entry.kanji}): 生成ローマ字 "${romaji}" が ${dupRomaji} と重複しています`)
        continue
      }
      seenRomaji.set(romaji, `${where} (${entry.kanji})`)

      words.push({ kanji: entry.kanji, hiragana: entry.hiragana, romaji, difficulty: entry.difficulty })
    }

    console.log(`loaded shared-data/words/${file} (${category}: ${entries.length} words)`)
  }

  return { words, errors, warnings }
}

/** 1行1単語の読みやすい JSON 文字列にする */
function formatWordsJson(words) {
  return `[\n${words.map(w => `  ${JSON.stringify(w)}`).join(',\n')}\n]\n`
}

const { words, errors, warnings } = buildWords()

for (const w of warnings) console.warn(`warn: ${w}`)

if (errors.length > 0) {
  for (const e of errors) console.error(`error: ${e}`)
  console.error(`\n単語データの検証に失敗しました（${errors.length} 件）。同期を中止します。`)
  process.exit(1)
}

const wordsJson = formatWordsJson(words)
const kanaMapJson = readFileSync(KANA_MAP_FILE, 'utf-8')

for (const targetDir of TARGET_DIRS) {
  mkdirSync(targetDir, { recursive: true })
  writeFileSync(join(targetDir, 'words.json'), wordsJson)
  writeFileSync(join(targetDir, 'kana-map.json'), kanaMapJson)
  console.log(`synced words.json / kana-map.json -> ${targetDir}`)
}

console.log(`\ndone: ${words.length} words (warnings: ${warnings.length})`)
