export type Difficulty = 'easy' | 'normal' | 'hard'
export type GameMode = 'normal' | 'ra-na'

export interface DiffConfig {
  time: number
  tsukasaMaxHp: number
  dmgPerMiss: number
}

export const DIFF_CONFIG: Record<Difficulty, DiffConfig> = {
  easy:   { time: 70, tsukasaMaxHp: 500, dmgPerMiss: 5  },
  normal: { time: 60, tsukasaMaxHp: 300, dmgPerMiss: 10 },
  hard:   { time: 50, tsukasaMaxHp: 200, dmgPerMiss: 20 },
}

export interface GameRecord {
  score: number
  playTime: number
  totalKeystrokes: number
  correctKeystrokes: number
  missCount: number
  accuracy: number
  kps: number
  maxCombo: number
  difficulty: Difficulty
  wordsCompleted: number
  playedAt: string
}

export interface KeystrokeEvent {
  /** ゲーム開始からの経過時間 (ms) */
  t: number
  /** 押されたキー */
  k: string
  /** 単語インデックス */
  w: number
}

export interface SubmitRequest {
  sessionId: string
  token: string
  playerName?: string
  result: GameRecord
  keystrokeLog: KeystrokeEvent[]
}

export interface RankingEntry {
  rank: number
  playerName: string
  score: number
  kps: number
  accuracy: number
  difficulty: Difficulty
  gameMode: GameMode
  playedAt: string
}
