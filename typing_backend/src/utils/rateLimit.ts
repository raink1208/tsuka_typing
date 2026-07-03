/**
 * スライディングウィンドウ方式のインメモリレートリミッター。
 * Cloudflare Workers の isolate 内でのみ有効なベストエフォート実装
 * （isolate はリクエストの合間にエビクトされうるため恒久的な保証はない）。
 * より厳密なレート制御が必要な場合は Durable Objects への置き換えを推奨。
 */

interface WindowEntry {
  timestamps: number[]
}

const store = new Map<string, WindowEntry>()

let lastSweepAt = 0
const SWEEP_INTERVAL_MS = 300_000  // 5分ごとに間引きを検討
const STALE_AFTER_MS    = 3_600_000 // 1時間操作がないキーは削除

/**
 * 古いエントリを間引く。Workers はリクエスト外でのタイマー実行を保証しないため、
 * setInterval の代わりにリクエスト処理中（checkRateLimit 呼び出し時）に実行する。
 */
function sweepIfNeeded(now: number): void {
  if (now - lastSweepAt < SWEEP_INTERVAL_MS) return
  lastSweepAt = now

  const cutoff = now - STALE_AFTER_MS
  for (const [key, entry] of store) {
    const last = entry.timestamps[entry.timestamps.length - 1]
    if (last === undefined || last < cutoff) {
      store.delete(key)
    }
  }
}

/**
 * レートリミットを確認し、許可される場合はカウントを増やす。
 * @returns true = リクエスト許可, false = 制限超過
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now()
  sweepIfNeeded(now)

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

