<template>
  <div class="result-screen">
    <!-- コーナー装飾 -->
    <span class="corner corner-tl" aria-hidden="true" />
    <span class="corner corner-tr" aria-hidden="true" />
    <span class="corner corner-bl" aria-hidden="true" />
    <span class="corner corner-br" aria-hidden="true" />

    <!-- 背景グロー -->
    <div class="bg-glow" aria-hidden="true" />

    <!-- 結果ヘッダー -->
    <header class="result-header">
      <p class="result-label">{{ t('result.label') }}</p>
      <h1 class="result-title" :class="resultClass">{{ resultText }}</h1>
      <p class="result-sub">{{ resultSub }}</p>
    </header>

    <!-- 装飾区切り線 -->
    <div class="divider" aria-hidden="true">
      <span class="div-line" /><span class="div-gem">❖</span><span class="div-line" />
    </div>

    <!-- スコア -->
    <div class="score-display">
      <div class="score-num">{{ store.score.toLocaleString() }}</div>
      <div class="score-label">{{ t('result.scoreLabel') }}</div>
    </div>

    <!-- 統計 -->
    <div class="stats-grid">
      <div class="stat-card">
        <span class="corner corner-tl" aria-hidden="true" />
        <span class="corner corner-br" aria-hidden="true" />
        <div class="stat-value">{{ store.wordsCompleted }}</div>
        <div class="stat-label">{{ t('result.stats.spellsCast') }}</div>
      </div>
      <div class="stat-card">
        <span class="corner corner-tl" aria-hidden="true" />
        <span class="corner corner-br" aria-hidden="true" />
        <div class="stat-value">{{ store.maxCombo }}</div>
        <div class="stat-label">{{ t('result.stats.maxChain') }}</div>
      </div>
      <div class="stat-card" :class="{ danger: store.accuracy < 70 }">
        <span class="corner corner-tl" aria-hidden="true" />
        <span class="corner corner-br" aria-hidden="true" />
        <div class="stat-value">{{ store.accuracy }}<span class="stat-unit">%</span></div>
        <div class="stat-label">{{ t('result.stats.accuracy') }}</div>
      </div>
      <div class="stat-card">
        <span class="corner corner-tl" aria-hidden="true" />
        <span class="corner corner-br" aria-hidden="true" />
        <div class="stat-value">{{ store.kps }}<span class="stat-unit">kps</span></div>
        <div class="stat-label">{{ t('result.stats.keysPerSec') }}</div>
      </div>
      <div class="stat-card">
        <span class="corner corner-tl" aria-hidden="true" />
        <span class="corner corner-br" aria-hidden="true" />
        <div class="stat-value">{{ store.correctKeystrokes }}</div>
        <div class="stat-label">{{ t('result.stats.keysTyped') }}</div>
      </div>
      <div class="stat-card" :class="{ danger: store.missCount > 0 }">
        <span class="corner corner-tl" aria-hidden="true" />
        <span class="corner corner-br" aria-hidden="true" />
        <div class="stat-value">{{ store.missCount }}</div>
        <div class="stat-label">{{ t('result.stats.miss') }}</div>
      </div>
    </div>

    <!-- ランキング送信状態 -->
    <div class="ranking-status" :class="rankingStatusClass">
      <span v-if="store.submitStatus === 'pending'">{{ t('result.ranking.pending') }}</span>
      <template v-else-if="store.submitStatus === 'accepted'">
        <span v-if="store.publishStatus === 'published'">
          {{ t('result.ranking.published', { rank: store.serverRank }) }}
        </span>
        <span v-else-if="store.publishStatus === 'pending'">{{ t('result.ranking.publishing') }}</span>
        <span v-else-if="store.publishStatus === 'error'">
          {{ t('result.ranking.publishError', { reason: store.publishReason }) }}
        </span>
        <span v-else>
          {{ t('result.ranking.unpublished', { score: store.serverScore, rank: store.serverRank }) }}
        </span>
      </template>
      <span v-else-if="store.submitStatus === 'rejected'">{{ t('result.ranking.rejected', { reason: store.submitReason }) }}</span>
      <span v-else-if="store.submitReason === 'NO_SESSION'">{{ t('result.ranking.noSession') }}</span>
      <span v-else-if="store.submitStatus === 'error'">{{ t('result.ranking.error') }}</span>
    </div>

    <!-- ボタン -->
    <div class="result-actions">
      <button
        v-if="canPublish"
        class="btn-publish"
        :disabled="store.publishStatus === 'pending'"
        @click="publish"
      >
        {{ store.publishStatus === 'pending' ? t('result.publishingButton') : t('result.publishButton') }}
      </button>
      <button class="btn-retry" @click="retry">{{ t('result.retryButton') }}</button>
      <button class="btn-title" @click="goTitle">{{ t('result.titleButton') }}</button>
    </div>

    <!-- 難易度バッジ -->
    <div class="diff-badge" :style="{ color: diffColor }">
      {{ t('result.diffBadge', { diff: diffLabel }) }}
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false })

const { t } = useI18n()
const store = useGameStore()

// タイトルを経由していない場合はリダイレクト
onMounted(() => {
  if (store.phase !== 'result') navigateTo('/')
})

const resultText = computed(() => {
  if (store.tsukasaHp <= 0)  return t('result.defeatTitle')
  return t('result.clearTitle')
})

const resultClass = computed(() => {
  if (store.tsukasaHp <= 0) return 'defeat'
  return 'timeout'
})

const resultSub = computed(() => {
  if (store.tsukasaHp <= 0) return t('result.defeatSub')
  return t('result.clearSub', { count: store.wordsCompleted })
})

const DIFF_COLORS  = { easy: '#44ff88', normal: '#ffd700', hard: '#ff4444' }
const diffColor    = computed(() => DIFF_COLORS[store.difficulty])
const diffLabel    = computed(() => t(`difficulty.${store.difficulty}.label`))

const rankingStatusClass = computed(() => ({
  accepted: store.submitStatus === 'accepted' && store.publishStatus === 'published',
  rejected: store.submitStatus === 'rejected' || store.publishStatus === 'error',
  error:    store.submitStatus === 'error' || store.submitStatus === 'pending',
}))

/** 検証済みかつ未登録のときだけランキング登録ボタンを出す */
const canPublish = computed(() =>
  store.submitStatus === 'accepted' && store.publishStatus !== 'published',
)

function publish() {
  store.publishRanking()
}

function retry() {
  store.startGame()
  navigateTo('/game')
}
function goTitle() {
  store.resetToTitle()
  navigateTo('/')
}
</script>

<style scoped>
/* ── コーナー装飾（共通） ── */
.corner { position: absolute; display: block; z-index: 2; pointer-events: none; }
.corner-tl { top: -1px;    left: -1px;   border-top: 2px solid #c8a028; border-left: 2px solid #c8a028; }
.corner-tr { top: -1px;    right: -1px;  border-top: 2px solid #c8a028; border-right: 2px solid #c8a028; }
.corner-bl { bottom: -1px; left: -1px;   border-bottom: 2px solid #c8a028; border-left: 2px solid #c8a028; }
.corner-br { bottom: -1px; right: -1px;  border-bottom: 2px solid #c8a028; border-right: 2px solid #c8a028; }
.result-screen > .corner { width: 18px; height: 18px; }
.stat-card > .corner-tl { width: 8px; height: 8px; border-color: #7a5c28; border-right: none; border-bottom: none; }
.stat-card > .corner-br { width: 8px; height: 8px; border-color: #7a5c28; border-top:   none; border-left:   none; }

.result-screen {
  position: relative;
  width: min(540px, 100vw);
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  background: linear-gradient(160deg, #1c1508 0%, #100c06 100%);
  border: 1px solid #5a3c14;
  border-radius: 0;
  overflow: hidden;
}
.bg-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 0%, rgba(120,80,0,0.14) 0%, transparent 60%);
  pointer-events: none;
}

/* ── 区切り線 ── */
.divider { display: flex; align-items: center; gap: 10px; width: 100%; }
.div-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, #5a3c14, transparent); display: block; }
.div-gem  { color: #c8a028; font-size: 0.75rem; text-shadow: 0 0 6px rgba(200,160,40,0.5); }

/* ── ヘッダー ── */
.result-header { text-align: center; z-index: 1; }
.result-label {
  font-family: 'Cinzel', serif;
  font-size: 0.8rem;
  letter-spacing: 0.34em;
  color: #b09a5e;
  margin-bottom: 8px;
  text-transform: uppercase;
}
.result-title {
  font-family: 'Cinzel', serif;
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: 0.1em;
}
.result-title.defeat  { color: #e05a48; text-shadow: 0 0 20px rgba(196,64,48,0.5); }
.result-title.timeout { color: #f2d472; text-shadow: 0 0 16px rgba(200,160,40,0.45); animation: gold-pulse 2s ease-in-out infinite; }
.result-sub {
  font-family: 'Noto Serif JP', serif;
  font-size: 1rem;
  color: #cbbd93;
  letter-spacing: 0.06em;
}
@keyframes gold-pulse {
  0%, 100% { text-shadow: 0 0 16px rgba(200,160,40,0.45); }
  50%       { text-shadow: 0 0 32px rgba(200,160,40,0.75), 0 0 60px rgba(200,160,40,0.2); }
}

/* ── スコア ── */
.score-display { display: flex; flex-direction: column; align-items: center; z-index: 1; }
.score-num {
  font-family: 'Share Tech Mono', monospace;
  font-size: 3.6rem;
  font-weight: 700;
  color: #f2d472;
  text-shadow: 0 0 16px rgba(200,160,40,0.55);
  letter-spacing: 0.05em;
  line-height: 1;
}
.score-label {
  font-family: 'Cinzel', serif;
  font-size: 0.76rem;
  letter-spacing: 0.34em;
  color: #b09a5e;
  margin-top: 6px;
  text-transform: uppercase;
}

/* ── 統計グリッド ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  width: 100%;
  z-index: 1;
}
.stat-card {
  position: relative;
  background: rgba(8, 6, 2, 0.75);
  border: 1px solid #4a3218;
  border-radius: 0;
  padding: 14px 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stat-card.danger .stat-value { color: #e05a48; text-shadow: 0 0 8px rgba(196,64,48,0.4); }
.stat-value {
  font-family: 'Share Tech Mono', monospace;
  font-size: 1.9rem;
  font-weight: 700;
  color: #f0e8c8;
  line-height: 1;
}
.stat-unit { font-size: 1rem; color: #b09a5e; }
.stat-label {
  font-family: 'Cinzel', serif;
  font-size: 0.72rem;
  color: #b09a5e;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* ── ランキング送信状態 ── */
.ranking-status {
  font-family: 'Noto Serif JP', serif;
  font-size: 0.92rem;
  color: #cbbd93;
  letter-spacing: 0.04em;
  text-align: center;
  z-index: 1;
}
.ranking-status.accepted { color: #f2d472; }
.ranking-status.rejected { color: #e05a48; }
.ranking-status.error    { color: #b09a5e; }

/* ── アクション ── */
.result-actions { display: flex; gap: 12px; z-index: 1; }
.btn-publish, .btn-retry, .btn-title {
  padding: 11px 24px;
  font-family: 'Cinzel', serif;
  font-size: 0.94rem;
  letter-spacing: 0.1em;
  border: 1px solid;
  transition: background 0.2s, box-shadow 0.2s;
}
.btn-publish {
  background: linear-gradient(135deg, #0e2418 0%, #0a1a10 100%);
  border-color: #3c8a5c;
  color: #8fe8b4;
}
.btn-publish:hover:not(:disabled) {
  background: linear-gradient(135deg, #123420 0%, #0c2416 100%);
  box-shadow: 0 0 20px rgba(60,138,92,0.25);
}
.btn-publish:disabled { opacity: 0.5; cursor: default; }
.btn-retry {
  background: linear-gradient(135deg, #2a1e0a 0%, #1e1608 100%);
  border-color: #c8a028;
  color: #e8c85a;
}
.btn-retry:hover {
  background: linear-gradient(135deg, #361e06 0%, #281606 100%);
  box-shadow: 0 0 20px rgba(200,160,40,0.25);
}
.btn-title {
  background: linear-gradient(135deg, #1c1008 0%, #140c06 100%);
  border-color: #5a3c14;
  color: #b3a173;
}
.btn-title:hover {
  background: linear-gradient(135deg, #241408 0%, #1a1008 100%);
  border-color: #7a5c28;
  color: #c8a028;
}

/* ── 難易度バッジ ── */
.diff-badge {
  font-family: 'Cinzel', serif;
  font-size: 0.78rem;
  letter-spacing: 0.2em;
  opacity: 0.95;
  text-transform: uppercase;
  z-index: 1;
}
</style>