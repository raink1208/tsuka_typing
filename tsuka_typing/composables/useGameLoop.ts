/** ゲームループの tick 間隔 (ms)。ここだけ変更すれば全体に反映される。 */
export const TICK_MS = 200

/** ゲームタイマーを管理するコンポーザブル。コンポーネントの setup 内で呼ぶこと。 */
export function useGameLoop() {
  const store = useGameStore()
  let timerInterval: ReturnType<typeof setInterval> | null = null
  let lastTickAt = 0

  function start() {
    if (timerInterval) clearInterval(timerInterval)
    lastTickAt = Date.now()
    timerInterval = setInterval(() => {
      // setInterval は必ず TICK_MS どおりに発火するとは限らない
      // （メインスレッド負荷・バックグラウンドタブでのスロットリング等）。
      // 固定値ではなく実際の経過時間を渡すことで、keystrokeLog の実時間(t)と
      // playTime(elapsedTime) のズレを防ぎ、KEYSTROKE_AFTER_GAME_END の誤検知を防止する。
      const now = Date.now()
      const delta = now - lastTickAt
      lastTickAt = now
      store.tick(delta)
    }, TICK_MS)
  }

  function stop() {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  onUnmounted(stop)

  return { start, stop }
}