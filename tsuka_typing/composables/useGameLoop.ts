/** ゲームループの tick 間隔 (ms)。ここだけ変更すれば全体に反映される。 */
export const TICK_MS = 200

/** ゲームタイマーを管理するコンポーザブル。コンポーネントの setup 内で呼ぶこと。 */
export function useGameLoop() {
  const store = useGameStore()
  let timerInterval: ReturnType<typeof setInterval> | null = null

  function start() {
    if (timerInterval) clearInterval(timerInterval)
    timerInterval = setInterval(() => {
      store.tick(TICK_MS)
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