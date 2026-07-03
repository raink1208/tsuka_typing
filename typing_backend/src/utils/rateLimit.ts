/**
 * スライディングウィンドウ方式のインメモリレートリミッター。
 * 本番環境では Redis 等の外部ストアへの置き換えを推奨。
 */

interface WindowEntry {
  timestamps: number[]
}

const store = new Map<string, WindowEntry>()

/**
 * レートリミットを確認し、許可される場合はカウントを増やす。
 * @returns true = リクエスト許可, false = 制限超過
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now    = Date.now()
  const cutoff = now - windowMs

  let entry = store.get(key)
  if (!entry) {
    entry = { timestamps: [] }
    store.set(key, entry)
  }

  // 期限切れのタイムスタンプを削除
  entry.timestamps = entry.timestamps.filter(t => t > cutoff)

  if (entry.timestamps.length >= limit) return false
  entry.timestamps.push(now)
  return true
}

// 5 分ごとに古いエントリを掃除してメモリリークを防ぐ
setInterval(() => {
  const cutoff = Date.now() - 3_600_000 // 1 hour
  for (const [key, entry] of store) {
    if (entry.timestamps.length === 0 || entry.timestamps[entry.timestamps.length - 1] < cutoff) {
      store.delete(key)
    }
  }
}, 300_000)
