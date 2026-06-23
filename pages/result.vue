<template>
  <div class="result-screen">
    <!-- 背景グロー -->
    <div class="bg-glow" aria-hidden="true" />

    <!-- 結果ヘッダー -->
    <header class="result-header">
      <p class="result-label">GAME RESULT</p>
      <h1 class="result-title" :class="resultClass">{{ resultText }}</h1>
      <p class="result-sub">{{ resultSub }}</p>
    </header>

    <!-- スコア -->
    <div class="score-display">
      <div class="score-num">{{ store.score.toLocaleString() }}</div>
      <div class="score-label">SCORE</div>
    </div>

    <!-- 統計 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ store.wordsCompleted }}</div>
        <div class="stat-label">撃破単語数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ store.maxCombo }}</div>
        <div class="stat-label">最大コンボ</div>
      </div>
      <div class="stat-card" :class="{ danger: store.accuracy < 70 }">
        <div class="stat-value">{{ store.accuracy }}<span class="stat-unit">%</span></div>
        <div class="stat-label">正確率</div>
      </div>
    </div>

    <!-- ボタン -->
    <div class="result-actions">
      <button class="btn-retry" @click="retry">
        もう一度（同じ難易度）
      </button>
      <button class="btn-title" @click="goTitle">
        タイトルへ戻る
      </button>
    </div>

    <!-- 難易度バッジ -->
    <div class="diff-badge" :style="{ color: diffColor }">
      {{ diffLabel }} でプレイ
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false })

const store = useGameStore()

// タイトルを経由していない場合はリダイレクト
onMounted(() => {
  if (store.phase !== 'result') navigateTo('/')
})

const resultText = computed(() => {
  if (store.tsukasaHp <= 0)  return '😢 GAME OVER'
  return '✨ 時間切れ'
})

const resultClass = computed(() => {
  if (store.tsukasaHp <= 0) return 'defeat'
  return 'timeout'
})

const resultSub = computed(() => {
  if (store.tsukasaHp <= 0) return 'つかさは倒れてしまった...'
  return `${store.wordsCompleted} 単語を入力した！`
})

const DIFF_COLORS  = { easy: '#44ff88', normal: '#ffd700', hard: '#ff4444' }
const DIFF_LABELS  = { easy: 'かんたん', normal: 'ふつう', hard: 'むずかしい' }
const diffColor    = computed(() => DIFF_COLORS[store.difficulty])
const diffLabel    = computed(() => DIFF_LABELS[store.difficulty])

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
.result-screen {
  position: relative;
  width: min(600px, 100vw);
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  background: rgba(12, 0, 28, 0.95);
  border: 1px solid rgba(160, 80, 255, 0.3);
  border-radius: 16px;
  overflow: hidden;
}
.bg-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 0%, rgba(120, 0, 200, 0.18) 0%, transparent 65%);
  pointer-events: none;
}

/* ── ヘッダー ─────────────────────────── */
.result-header {
  text-align: center;
  z-index: 1;
}
.result-label {
  font-size: 0.65rem;
  letter-spacing: 0.3em;
  color: #888;
  margin-bottom: 6px;
}
.result-title {
  font-size: 2.4rem;
  font-weight: 900;
  margin-bottom: 6px;
}
.result-title.defeat  { color: #ff4444; text-shadow: 0 0 20px #ff4444; }
.result-title.perfect { color: #ffd700; text-shadow: 0 0 20px #ffd700; animation: perfect-pulse 1.5s ease-in-out infinite; }
.result-title.timeout { color: #fff;    text-shadow: 0 0 12px rgba(255,255,255,0.5); }
.result-sub {
  font-size: 0.85rem;
  color: #aaa;
  letter-spacing: 0.05em;
}
@keyframes perfect-pulse {
  0%, 100% { text-shadow: 0 0 20px #ffd700; }
  50%       { text-shadow: 0 0 40px #ffd700, 0 0 60px #ffd70055; }
}

/* ── スコア ─────────────────────────── */
.score-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}
.score-num {
  font-family: 'Share Tech Mono', monospace;
  font-size: 3.5rem;
  font-weight: 700;
  color: #ffd700;
  text-shadow: 0 0 16px #ffd70088;
  letter-spacing: 0.05em;
  line-height: 1;
}
.score-label {
  font-size: 0.65rem;
  letter-spacing: 0.3em;
  color: #888;
  margin-top: 4px;
}

/* ── 統計グリッド ─────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  width: 100%;
  z-index: 1;
}
.stat-card {
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 12px 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stat-card.danger .stat-value { color: #ff4444; }
.stat-value {
  font-family: 'Share Tech Mono', monospace;
  font-size: 1.7rem;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}
.stat-unit {
  font-size: 1rem;
  color: #aaa;
}
.stat-label {
  font-size: 0.62rem;
  color: #888;
  letter-spacing: 0.05em;
}

/* ── ボタン ──────────────────────────── */
.result-actions {
  display: flex;
  gap: 12px;
  z-index: 1;
}
.btn-retry {
  padding: 12px 28px;
  background: linear-gradient(135deg, #4a0080, #800040);
  border: 2px solid #ffd700;
  border-radius: 10px;
  color: #ffd700;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  transition: all 0.2s;
  box-shadow: 0 0 12px rgba(255,215,0,0.25);
}
.btn-retry:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(255,215,0,0.4);
}
.btn-title {
  padding: 12px 24px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 10px;
  color: #aaa;
  font-size: 0.9rem;
  font-weight: 700;
  transition: all 0.2s;
}
.btn-title:hover {
  border-color: rgba(255,255,255,0.5);
  color: #fff;
}

/* ── 難易度バッジ ─────────────────────── */
.diff-badge {
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  opacity: 0.7;
  z-index: 1;
}
</style>