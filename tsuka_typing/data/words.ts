import wordsData from './words.json'

export interface Word {
  kanji: string
  hiragana: string
  romaji: string
  difficulty: 1 | 2 | 3
}

export interface Enemy {
  id: string
  emoji: string
  maxHp: number
  attackPower: number
  color: string
}

// 実データは shared-data/words.json（単一の情報源。バックエンドと共有）。
// 追加・修正する場合は shared-data/words.json を編集し、`node shared-data/sync.mjs` で同期すること。
// difficulty: 1 = <= 10 chars, 2 = 11-20 chars, 3 = 21+ chars
export const WORDS: Word[] = wordsData as Word[]

// 表示名・説明文は i18n/locales/*.json の enemies.<id> を参照する（EnemySprite.vue）
export const ENEMIES: Enemy[] = [
  {
    id: 'tsukasa',
    emoji: '🐱',
    maxHp: 150,
    attackPower: 0,
    color: '#44ff88',
  },
]
