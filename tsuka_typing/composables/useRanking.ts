import type { Difficulty } from '~/utils/wordShuffle'
import type { GameMode } from '~/stores/game'

/** ランキングに表示する順位の上限（typing_backend の MAX_LIMIT = 100 以内） */
export const RANKING_LIMIT = 50

/** GET /api/ranking のレスポンス 1件（typing_backend の RankingEntry と対応） */
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

export type RankingStatus = 'idle' | 'pending' | 'loaded' | 'error'

/**
 * 難易度＋モードごとのランキングを typing_backend から取得する。
 * 取得済みの組み合わせはキャッシュし、タブを行き来するだけでは再取得しない
 * （最新の記録を取り直したい場合は force = true で呼ぶ）。
 */
export function useRanking() {
  const config = useRuntimeConfig()

  const entries = ref<RankingEntry[]>([])
  const status  = ref<RankingStatus>('idle')

  const cache = new Map<string, RankingEntry[]>()
  /**
   * 遅れて届いた古いリクエストの結果で表示を上書きしないための世代カウンタ。
   * タブを高速に切り替えると複数のリクエストが並行するため、
   * 最後に開始したリクエスト以外の応答は破棄する。
   */
  let requestId = 0

  async function load(difficulty: Difficulty, gameMode: GameMode, force = false) {
    const key = `${difficulty}:${gameMode}`
    const cached = cache.get(key)
    if (cached && !force) {
      requestId++          // 進行中のリクエストの応答を無効化する
      entries.value = cached
      status.value  = 'loaded'
      return
    }

    const id = ++requestId
    status.value = 'pending'
    try {
      const res = await $fetch<{ rankings: RankingEntry[] }>(
        `${config.public.apiBase}/api/ranking`,
        { query: { difficulty, gameMode, limit: RANKING_LIMIT } },
      )
      if (id !== requestId) return
      const rankings = res.rankings ?? []
      cache.set(key, rankings)
      entries.value = rankings
      status.value  = 'loaded'
    } catch {
      if (id !== requestId) return
      entries.value = []
      status.value  = 'error'
    }
  }

  return { entries, status, load }
}
