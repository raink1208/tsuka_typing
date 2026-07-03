import { Hono } from 'hono'
import type { Bindings } from '../bindings'
import { createToken, verifyToken, hashToken } from '../utils/token'
import { simulateGame, checkAnomalies } from '../utils/replay'
import { generateWordSequence } from '../shared/wordShuffle'
import { checkRateLimit } from '../utils/rateLimit'
import { DIFF_CONFIG } from '../shared/types'
import type { Difficulty, GameMode, SubmitRequest } from '../shared/types'

const VALID_DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard']
const VALID_GAME_MODES:   GameMode[]   = ['normal', 'ra-na']
const MAX_KEYSTROKE_LOG   = 10_000
const MAX_PLAYER_NAME_LEN = 30

function getIp(c: { req: { header: (name: string) => string | undefined } }): string {
  return (
    c.req.header('cf-connecting-ip') ??
    c.req.header('x-forwarded-for')?.split(',')[0].trim() ??
    'unknown'
  )
}

const game = new Hono<{ Bindings: Bindings }>()

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/game/start
// ─────────────────────────────────────────────────────────────────────────────
game.post('/start', async (c) => {
  const ip = getIp(c)

  // レートリミット: 同一 IP から 10 分間に最大 10 回
  if (!checkRateLimit(`start:${ip}`, 10, 600_000)) {
    return c.json({ error: 'RATE_LIMITED' }, 429)
  }

  let body: { difficulty?: unknown; gameMode?: unknown }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'INVALID_JSON' }, 400)
  }

  const { difficulty, gameMode } = body

  if (!VALID_DIFFICULTIES.includes(difficulty as Difficulty)) {
    return c.json({ error: 'INVALID_DIFFICULTY' }, 400)
  }
  if (!VALID_GAME_MODES.includes(gameMode as GameMode)) {
    return c.json({ error: 'INVALID_GAME_MODE' }, 400)
  }

  const SECRET = c.env.SERVER_SECRET ?? ''
  if (!SECRET) {
    console.error('SERVER_SECRET is not set')
    return c.json({ error: 'SERVER_MISCONFIGURED' }, 500)
  }

  const sessionId  = crypto.randomUUID()
  const wordSeed   = Math.floor(Math.random() * 0xffffffff)
  const startedAt  = Date.now()

  const payload = {
    sessionId,
    difficulty: difficulty as Difficulty,
    gameMode:   gameMode   as GameMode,
    wordSeed,
    startedAt,
  }

  const token     = await createToken(payload, SECRET)
  const tokenHash = await hashToken(token)

  await c.env.DB.prepare(`
    INSERT INTO game_sessions (id, difficulty, game_mode, word_seed, token_hash, started_at, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(sessionId, difficulty, gameMode, wordSeed, tokenHash, startedAt, ip).run()

  return c.json({ sessionId, wordSeed, token, serverTime: startedAt })
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/game/submit
// ─────────────────────────────────────────────────────────────────────────────
game.post('/submit', async (c) => {
  const ip = getIp(c)

  // レートリミット: 同一 IP から 1 時間に最大 30 回
  if (!checkRateLimit(`submit:${ip}`, 30, 3_600_000)) {
    return c.json({ accepted: false, reason: 'RATE_LIMITED' }, 429)
  }

  let body: Partial<SubmitRequest>
  try {
    body = await c.req.json()
  } catch {
    return c.json({ accepted: false, reason: 'INVALID_JSON' }, 400)
  }

  const { sessionId, token, result, keystrokeLog } = body
  const playerName = sanitizePlayerName(body.playerName)

  // ── 基本的な入力検証 ──────────────────────────────────────────────
  if (typeof sessionId !== 'string' || typeof token !== 'string') {
    return c.json({ accepted: false, reason: 'MISSING_FIELDS' }, 400)
  }
  if (!result || typeof result !== 'object') {
    return c.json({ accepted: false, reason: 'MISSING_RESULT' }, 400)
  }
  if (!Array.isArray(keystrokeLog)) {
    return c.json({ accepted: false, reason: 'MISSING_KEYSTROKE_LOG' }, 400)
  }
  if (keystrokeLog.length > MAX_KEYSTROKE_LOG) {
    return c.json({ accepted: false, reason: 'KEYSTROKE_LOG_TOO_LARGE' }, 400)
  }

  // キーストロークログの形式チェック
  for (const evt of keystrokeLog) {
    if (typeof evt.t !== 'number' || typeof evt.k !== 'string' || typeof evt.w !== 'number') {
      return c.json({ accepted: false, reason: 'INVALID_KEYSTROKE_FORMAT' }, 400)
    }
    if (evt.k.length !== 1) {
      return c.json({ accepted: false, reason: 'INVALID_KEY_VALUE' }, 400)
    }
  }

  // キーストロークのタイムスタンプは単調増加であること
  for (let i = 1; i < keystrokeLog.length; i++) {
    if (keystrokeLog[i].t < keystrokeLog[i - 1].t) {
      return c.json({ accepted: false, reason: 'KEYSTROKE_TIMESTAMP_NOT_MONOTONIC' }, 400)
    }
  }

  const SECRET = c.env.SERVER_SECRET ?? ''
  if (!SECRET) {
    return c.json({ accepted: false, reason: 'SERVER_MISCONFIGURED' }, 500)
  }

  // ── セッショントークン検証 ────────────────────────────────────────
  const payload = await verifyToken(token, SECRET)
  if (!payload) {
    return c.json({ accepted: false, reason: 'INVALID_TOKEN' }, 400)
  }
  if (payload.sessionId !== sessionId) {
    return c.json({ accepted: false, reason: 'SESSION_ID_MISMATCH' }, 400)
  }

  // ── DB からセッション取得 ─────────────────────────────────────────
  const session = await c.env.DB.prepare('SELECT * FROM game_sessions WHERE id = ?')
    .bind(sessionId)
    .first<{ id: string; difficulty: string; game_mode: string; word_seed: number; token_hash: string; started_at: number; submitted: number }>()

  if (!session) {
    return c.json({ accepted: false, reason: 'SESSION_NOT_FOUND' }, 400)
  }

  // ── ワンタイム制御: 再送信拒否 ────────────────────────────────────
  if (session.submitted) {
    return c.json({ accepted: false, reason: 'ALREADY_SUBMITTED' }, 400)
  }

  // ── トークンハッシュ一致確認 ──────────────────────────────────────
  const suppliedHash = await hashToken(token)
  if (session.token_hash !== suppliedHash) {
    return c.json({ accepted: false, reason: 'TOKEN_HASH_MISMATCH' }, 400)
  }

  // ── トークン有効期限チェック ──────────────────────────────────────
  const diffCfg = DIFF_CONFIG[payload.difficulty]
  const maxAgeMs = diffCfg.time * 1000 + 10_000 // difficulty time + 10s バッファ
  if (Date.now() > payload.startedAt + maxAgeMs) {
    return c.json({ accepted: false, reason: 'TOKEN_EXPIRED' }, 400)
  }

  // ── クロスバリデーション (基本整合性) ─────────────────────────────
  if (result.totalKeystrokes !== keystrokeLog.length) {
    return c.json({ accepted: false, reason: 'KEYSTROKE_COUNT_MISMATCH' }, 400)
  }
  if (result.correctKeystrokes + result.missCount !== result.totalKeystrokes) {
    return c.json({ accepted: false, reason: 'CORRECT_MISS_SUM_MISMATCH' }, 400)
  }
  if (result.playTime > diffCfg.time + 1) {
    return c.json({ accepted: false, reason: 'PLAY_TIME_TOO_LONG' }, 400)
  }
  if (keystrokeLog.length > 0) {
    const lastKeystrokeT = keystrokeLog[keystrokeLog.length - 1].t
    if (lastKeystrokeT / 1000 > result.playTime + 2) {
      return c.json({ accepted: false, reason: 'KEYSTROKE_AFTER_GAME_END' }, 400)
    }
  }

  // ── サーバー側リプレイ検証 ────────────────────────────────────────
  const wordSequence  = generateWordSequence(payload.wordSeed, payload.difficulty)
  const replayResult  = simulateGame(wordSequence, keystrokeLog, payload.gameMode)

  if (replayResult.score !== result.score) {
    return c.json({ accepted: false, reason: 'SCORE_MISMATCH' }, 400)
  }
  if (replayResult.wordsCompleted !== result.wordsCompleted) {
    return c.json({ accepted: false, reason: 'WORDS_COMPLETED_MISMATCH' }, 400)
  }

  // ── 統計的異常検知 ────────────────────────────────────────────────
  const anomaly = checkAnomalies(keystrokeLog, replayResult)
  if (!anomaly.ok) {
    return c.json({ accepted: false, reason: anomaly.reason }, 400)
  }

  // レートリミット: 同一 IP からの短時間バースト送信を抑止する（粗いスパム対策）。
  // セッションは sessionId 単位で一回限りの使用・リプレイ検証・異常検知により
  // 既に保護されているため、ここは「同一IPからの連続大量送信」を防ぐのが目的。
  // limit=1 だと NAT/学校や職場の共有Wi-Fi等、同一IPを複数人が使う環境で
  // 別々の正規プレイヤーの送信が同時期に重なっただけで誤ってブロックされるため、
  // ある程度のバーストを許容する値にしている。
  if (!checkRateLimit(`submit_interval:${ip}`, 5, 30_000)) {
    return c.json({ accepted: false, reason: 'SUBMIT_INTERVAL_TOO_SHORT' }, 429)
  }

  // ── DB 登録 ───────────────────────────────────────────────────────
  const rankingId  = crypto.randomUUID()
  const accuracy   = result.totalKeystrokes === 0
    ? 100
    : Math.round((result.correctKeystrokes / result.totalKeystrokes) * 100)
  const kps        = result.playTime > 0
    ? Math.round((result.correctKeystrokes / result.playTime) * 10) / 10
    : 0

  // D1 では複数ステートメントの原子的実行に batch() を使用する
  await c.env.DB.batch([
    c.env.DB.prepare('UPDATE game_sessions SET submitted = 1 WHERE id = ?').bind(sessionId),
    c.env.DB.prepare(`
      INSERT INTO rankings
        (id, session_id, player_name, score, play_time, total_keystrokes, correct_keystrokes,
         miss_count, accuracy, kps, max_combo, words_completed, difficulty, game_mode, verified, played_at, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).bind(
      rankingId,
      sessionId,
      playerName,
      replayResult.score,
      result.playTime,
      result.totalKeystrokes,
      result.correctKeystrokes,
      result.missCount,
      accuracy,
      kps,
      result.maxCombo,
      replayResult.wordsCompleted,
      payload.difficulty,
      payload.gameMode,
      new Date().toISOString(),
      ip,
    ),
  ])

  // ── ランク取得 ─────────────────────────────────────────────────────
  const rankRow = await c.env.DB.prepare(`
    SELECT COUNT(*) + 1 AS rank
    FROM rankings
    WHERE difficulty = ? AND game_mode = ? AND score > ? AND verified = 1
  `).bind(payload.difficulty, payload.gameMode, replayResult.score).first<{ rank: number }>()

  return c.json({
    accepted:    true,
    rank:        rankRow?.rank ?? 1,
    serverScore: replayResult.score,
  })
})

function sanitizePlayerName(name: unknown): string {
  if (typeof name !== 'string' || name.trim() === '') return 'anonymous'
  // 許可: 英数字, 日本語, 一部記号
  const sanitized = name.trim().replace(/[<>&"']/g, '').slice(0, MAX_PLAYER_NAME_LEN)
  return sanitized || 'anonymous'
}

export default game