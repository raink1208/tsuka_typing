export type Difficulty = 'easy' | 'normal' | 'hard'
export type GameMode = 'normal' | 'ra-na'

export interface DiffConfig {
  time: number
  tsukasaMaxHp: number
  dmgPerMiss: number
}

export const DIFF_CONFIG: Record<Difficulty, DiffConfig> = {
  // 難易度の違いは出題ワードのみ。時間 / HP / ミスダメージは全難易度で共通。
  easy:   { time: 100, tsukasaMaxHp: 300, dmgPerMiss: 10 },
  normal: { time: 100, tsukasaMaxHp: 300, dmgPerMiss: 10 },
  hard:   { time: 100, tsukasaMaxHp: 300, dmgPerMiss: 10 },
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

/** 検証済みリザルトをランキングへ掲載するリクエスト */
export interface PublishRequest {
  sessionId: string
  token: string
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