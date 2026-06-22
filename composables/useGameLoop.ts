/** ゲームタイマーを管理するコンポーザブル。コンポーネントの setup 内で呼ぶこと。 */
export function useGameLoop() {
  const store = useGameStore()
  let timerInterval: ReturnType<typeof setInterval> | null = null

  function start() {
    if (timerInterval) clearInterval(timerInterval)
    timerInterval = setInterval(() => {
      store.tick()
    }, 1000)
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
