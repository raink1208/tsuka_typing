import wordsData from './words.json'

export interface Word {
  kanji: string
  hiragana: string
  romaji: string
  difficulty: 1 | 2 | 3
}

export interface Enemy {
  id: string
  name: string
  emoji: string
  maxHp: number
  attackPower: number
  color: string
  description: string
}

// 実データは shared-data/words.json（単一の情報源。バックエンドと共有）。
// 追加・修正する場合は shared-data/words.json を編集し、`node shared-data/sync.mjs` で同期すること。
// difficulty: 1 = <= 10 chars, 2 = 11-20 chars, 3 = 21+ chars
export const WORDS: Word[] = wordsData as Word[]

export const ENEMIES: Enemy[] = [
  {
    id: 'tsukasa',
    name: '領国つかさ',
    emoji: '🐱',
    maxHp: 150,
    attackPower: 0,
    color: '#44ff88',
    description: 'よわよわの敵',
  },
]
