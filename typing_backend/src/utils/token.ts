import type { Difficulty, GameMode } from '../shared/types'

export interface SessionPayload {
  sessionId: string
  difficulty: Difficulty
  gameMode: GameMode
  wordSeed: number
  startedAt: number
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
}

/**
 * ペイロードを HMAC-SHA256 で署名したトークンを生成する。
 * 形式: base64url(JSON) . hex(HMAC-SHA256)
 */
export async function createToken(payload: SessionPayload, secret: string): Promise<string> {
  const encoded = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)))
  const key = await importHmacKey(secret)
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(encoded))
  return `${encoded}.${toHex(new Uint8Array(sig))}`
}

/**
 * トークンを検証してペイロードを返す。改ざん・形式不正の場合は null。
 * タイミング攻撃対策として一定時間での比較を行う。
 */
export async function verifyToken(token: string, secret: string): Promise<SessionPayload | null> {
  const dotIdx = token.indexOf('.')
  if (dotIdx === -1) return null

  const encoded  = token.slice(0, dotIdx)
  const supplied = token.slice(dotIdx + 1)

  const key      = await importHmacKey(secret)
  const sig      = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(encoded))
  const expected = toHex(new Uint8Array(sig))

  if (expected.length !== supplied.length) return null

  // 定数時間比較（早期returnによるタイミング漏洩を避ける）
  let diff = 0
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ supplied.charCodeAt(i)
  }
  if (diff !== 0) return null

  try {
    return JSON.parse(new TextDecoder().decode(fromBase64Url(encoded))) as SessionPayload
  } catch {
    return null
  }
}

/** 使用済みセッション検出用にトークン本体を SHA256 ハッシュ化して保存する */
export async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return toHex(new Uint8Array(digest))
}

