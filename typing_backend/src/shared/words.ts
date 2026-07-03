import wordsData from './words.json'

export interface Word {
  kanji: string
  hiragana: string
  romaji: string
  difficulty: 1 | 2 | 3
}

// 実データは shared-data/words.json（単一の情報源）。
// 追加・修正する場合は shared-data/words.json を編集し、`node shared-data/sync.mjs` で同期すること。
// difficulty: 1 = <= 10 chars, 2 = 11-20 chars, 3 = 21+ chars
export const WORDS: Word[] = wordsData as Word[]

