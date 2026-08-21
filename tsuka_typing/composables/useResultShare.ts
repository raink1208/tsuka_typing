import type { Difficulty } from '~/utils/wordShuffle'
import type { GameMode } from '~/stores/game'

/** 共有先SNS */
export type ShareTarget = 'x' | 'bluesky' | 'misskey'

/** 共有ボタン押下後にリザルト画面へ出すフィードバック */
export type ShareFeedback = 'idle' | 'copied' | 'copyError' | 'shareError'

/** 共有テキストに載せるリザルト情報 */
export interface ShareResult {
  score: number
  wordsCompleted: number
  maxCombo: number
  accuracy: number
  kps: number
  difficulty: Difficulty
  gameMode: GameMode
  /** ランキング掲載済みのときだけ順位を載せる（未掲載なら null） */
  rank: number | null
}

/**
 * 各SNSの共有インテントURL。
 * X / Misskey は本文とURLを別パラメータで受け取るが、Bluesky の compose インテントは
 * url パラメータを持たないため本文末尾にURLを連結する。
 */
const SHARE_INTENT: Record<ShareTarget, (text: string, url: string) => string> = {
  x:       (text, url) => `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  bluesky: (text, url) => `https://bsky.app/intent/compose?text=${encodeURIComponent(url ? `${text}\n${url}` : text)}`,
  misskey: (text, url) => `https://misskey.io/share?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
}

/** フィードバック文を表示し続ける時間 (ms) */
const FEEDBACK_DURATION_MS = 2400

/**
 * リザルトをSNSへ共有する。
 * - 共有テキストは i18n（result.share.*）から組み立てるので、文言変更はロケールだけで済む
 * - 共有するURLは runtimeConfig.public.siteUrl（環境変数 NUXT_PUBLIC_SITE_URL）。
 *   未設定の場合は実行中のオリジンにフォールバックする
 */
export function useResultShare() {
  const { t } = useI18n()
  const config = useRuntimeConfig()

  const feedback = ref<ShareFeedback>('idle')
  /** navigator.share が使える環境（主にモバイル）でだけ OS 標準の共有ボタンを出す */
  const canNativeShare = ref(false)

  let feedbackTimer: ReturnType<typeof setTimeout> | null = null

  onMounted(() => {
    canNativeShare.value = typeof navigator !== 'undefined' && typeof navigator.share === 'function'
  })

  onUnmounted(() => {
    if (feedbackTimer !== null) clearTimeout(feedbackTimer)
  })

  function setFeedback(next: ShareFeedback) {
    feedback.value = next
    if (feedbackTimer !== null) clearTimeout(feedbackTimer)
    if (next === 'idle') return
    feedbackTimer = setTimeout(() => {
      feedback.value = 'idle'
      feedbackTimer = null
    }, FEEDBACK_DURATION_MS)
  }

  /** 共有するページのURL（末尾スラッシュは落とす） */
  const shareUrl = computed(() => {
    const configured = String(config.public.siteUrl ?? '').trim().replace(/\/+$/, '')
    if (configured) return configured
    return import.meta.client ? window.location.origin : ''
  })

  /** SNSの本文（URLは含まない。URLは各インテントのパラメータ側で渡す） */
  function buildShareText(r: ShareResult): string {
    const diffLabel = t(`difficulty.${r.difficulty}.label`)
    const lines = [
      t('result.share.textScore', { score: r.score.toLocaleString() }),
      r.gameMode === 'ra-na'
        ? t('result.share.textDiffMode', { diff: diffLabel, mode: t('title.raNaModeName') })
        : t('result.share.textDiff', { diff: diffLabel }),
    ]
    if (r.rank !== null) lines.push(t('result.share.textRank', { rank: r.rank }))
    lines.push(t('result.share.textStats', {
      words:    r.wordsCompleted,
      combo:    r.maxCombo,
      accuracy: r.accuracy,
      kps:      r.kps,
    }))
    return lines.join('\n')
  }

  /** コピー・OS共有用の全文（本文＋URL） */
  function buildShareBody(r: ShareResult): string {
    const text = buildShareText(r)
    return shareUrl.value ? `${text}\n${shareUrl.value}` : text
  }

  /** 指定SNSの投稿画面を別タブで開く */
  function shareTo(target: ShareTarget, r: ShareResult) {
    const url = SHARE_INTENT[target](buildShareText(r), shareUrl.value)
    const opened = window.open(url, '_blank', 'noopener,noreferrer')
    // ポップアップブロック時は無言で失敗するため、コピーを促すフィードバックを出す
    if (!opened) setFeedback('shareError')
  }

  /** OS標準の共有シート（navigator.share）を開く */
  async function shareNative(r: ShareResult) {
    try {
      await navigator.share({
        title: t('meta.title'),
        text:  buildShareText(r),
        url:   shareUrl.value || undefined,
      })
    } catch (e) {
      // ユーザーが共有シートを閉じただけの場合はエラー表示しない
      if ((e as DOMException)?.name !== 'AbortError') setFeedback('shareError')
    }
  }

  /** 共有テキストをクリップボードへコピーする */
  async function copyShareText(r: ShareResult) {
    const body = buildShareBody(r)
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(body)
      } else if (!copyByExecCommand(body)) {
        throw new Error('COPY_UNSUPPORTED')
      }
      setFeedback('copied')
    } catch {
      setFeedback('copyError')
    }
  }

  return {
    feedback,
    canNativeShare,
    shareUrl,
    buildShareText,
    buildShareBody,
    shareTo,
    shareNative,
    copyShareText,
  }
}

/**
 * navigator.clipboard が使えない環境（非セキュアコンテキストの古いブラウザ等）向けの
 * 旧APIによるコピー。成功したら true。
 */
function copyByExecCommand(text: string): boolean {
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.top = '-1000px'
  area.style.opacity = '0'
  document.body.appendChild(area)
  try {
    area.select()
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    document.body.removeChild(area)
  }
}
