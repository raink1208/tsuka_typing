import crypto from 'crypto'
import type { Difficulty, GameMode } from '../shared/types'

export interface SessionPayload {
  sessionId: string
  difficulty: Difficulty
  gameMode: GameMode
  wordSeed: number
  startedAt: number
}

/**
 * ペイロードを HMAC-SHA256 で署名したトークンを生成する。
 * 形式: base64url(JSON) . hex(HMAC-SHA256)
 */
export function createToken(payload: SessionPayload, secret: string): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const hmac = crypto.createHmac('sha256', secret).update(encoded).digest('hex')
  return `${encoded}.${hmac}`
}

/**
 * トークンを検証してペイロードを返す。改ざん・形式不正の場合は null。
 * タイミング攻撃対策として timingSafeEqual を使用。
 */
export function verifyToken(token: string, secret: string): SessionPayload | null {
  const dotIdx = token.indexOf('.')
  if (dotIdx === -1) return null

  const encoded = token.slice(0, dotIdx)
  const supplied = token.slice(dotIdx + 1)

  const expected = crypto.createHmac('sha256', secret).update(encoded).digest('hex')

  const expBuf = Buffer.from(expected, 'hex')
  const supBuf = Buffer.from(supplied, 'hex')
  if (expBuf.length !== supBuf.length) return null
  if (!crypto.timingSafeEqual(expBuf, supBuf)) return null

  try {
    return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8')) as SessionPayload
  } catch {
    return null
  }
}

/** 使用済みセッション検出用にトークン本体を SHA256 ハッシュ化して保存する */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}
