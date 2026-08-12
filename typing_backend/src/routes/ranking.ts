import { Hono } from 'hono'
import type { Bindings } from '../bindings'
import type { Difficulty, GameMode } from '../shared/types'

const VALID_DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard']
const VALID_GAME_MODES:   GameMode[]   = ['normal', 'ra-na']
const MAX_LIMIT = 100

const ranking = new Hono<{ Bindings: Bindings }>()

// GET /api/ranking?difficulty=normal&gameMode=normal&limit=100
ranking.get('/', async (c) => {
  const difficulty = c.req.query('difficulty') as Difficulty
  const gameMode   = (c.req.query('gameMode') ?? 'normal') as GameMode
  const limitStr   = c.req.query('limit')
  const limit      = Math.min(MAX_LIMIT, Math.max(1, parseInt(limitStr ?? '100', 10) || 100))

  if (!VALID_DIFFICULTIES.includes(difficulty)) {
    return c.json({ error: 'INVALID_DIFFICULTY' }, 400)
  }
  if (!VALID_GAME_MODES.includes(gameMode)) {
    return c.json({ error: 'INVALID_GAME_MODE' }, 400)
  }

  const { results } = await c.env.DB.prepare(`
    SELECT player_name, score, kps, accuracy, difficulty, game_mode, played_at
    FROM rankings
    WHERE difficulty = ? AND game_mode = ? AND verified = 1 AND published = 1
    ORDER BY score DESC
    LIMIT ?
  `).bind(difficulty, gameMode, limit).all<{
    player_name: string
    score: number
    kps: number
    accuracy: number
    difficulty: string
    game_mode: string
    played_at: string
  }>()

  const rankings = results.map((row, i) => ({
    rank:       i + 1,
    playerName: row.player_name,
    score:      row.score,
    kps:        row.kps,
    accuracy:   row.accuracy,
    difficulty: row.difficulty,
    gameMode:   row.game_mode,
    playedAt:   row.played_at,
  }))

  return c.json({ rankings })
})

export default ranking
