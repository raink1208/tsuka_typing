<template>
  <div class="title-screen">
    <!-- 背景パーティクル -->
    <div class="bg-particles" aria-hidden="true">
      <span v-for="i in 30" :key="i" class="particle" :style="particleStyle(i)" />
    </div>

    <!-- タイトルヘッダー -->
    <header class="title-header">
      <p class="subtitle">タイピングバトルゲーム</p>
      <h1 class="main-title">
        <span class="title-jp">領国つかさ</span>
        <span class="title-en">TYPING BATTLE</span>
      </h1>
    </header>

    <!-- キャラクター展示 -->
    <div class="showcase">
      <div class="showcase-ring outer" />
      <div class="showcase-ring inner" />
      <div class="showcase-icon">⚔️</div>
      <div class="showcase-name">領国 つかさ</div>
    </div>

    <!-- 難易度選択 -->
    <section class="difficulty-section">
      <p class="section-label">― 難易度を選択 ―</p>
      <div class="difficulty-buttons">
        <button
          v-for="d in difficulties"
          :key="d.value"
          :class="['diff-btn', { active: selectedDiff === d.value }]"
          :style="{ '--d-color': d.color }"
          @click="selectedDiff = d.value"
        >
          <span class="diff-name">{{ d.label }}</span>
          <span class="diff-detail">{{ d.detail }}</span>
        </button>
      </div>
    </section>

    <!-- スタートボタン -->
    <button class="start-btn" @click="startGame">
      <span class="start-main">BATTLE START</span>
      <span class="start-hint">Enter キーでも開始</span>
    </button>

    <!-- 遊び方 -->
    <ul class="how-to">
      <li>⌨️ ローマ字でタイピング → つかさが攻撃</li>
      <li>❌ ミスすると敵の反撃を受ける</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false })

const store = useGameStore()

const selectedDiff = ref<'easy' | 'normal' | 'hard'>('normal')

const difficulties = [
  { value: 'easy'   as const, label: 'かんたん',   detail: '70秒 / やさしい単語',  color: '#44ff88' },
  { value: 'normal' as const, label: 'ふつう',     detail: '60秒 / 普通の単語',    color: '#ffd700' },
  { value: 'hard'   as const, label: 'むずかしい', detail: '50秒 / むずかしい単語', color: '#ff4444' },
]

function startGame() {
  store.setDifficulty(selectedDiff.value)
  store.startGame()
  navigateTo('/game')
}

// パーティクルのランダムスタイル生成
function particleStyle(i: number) {
  const seed  = i * 137.508
  const x     = (seed * 13 % 100).toFixed(1)
  const delay = (seed * 7  % 8).toFixed(2)
  const dur   = (4 + seed * 3 % 6).toFixed(1)
  const size  = (1 + seed * 2 % 3).toFixed(1)
  return {
    left:              `${x}%`,
    animationDelay:    `${delay}s`,
    animationDuration: `${dur}s`,
    width:             `${size}px`,
    height:            `${size}px`,
  }
}

// Enter キーショートカット
onMounted(() => {
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter') startGame() }
  window.addEventListener('keydown', onKey)
  onUnmounted(() => window.removeEventListener('keydown', onKey))
})
</script>

<style scoped>
/* ── レイアウト ─────────────────────────── */
.title-screen {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.4rem;
  overflow: hidden;
}

/* ── 背景パーティクル ─────────────────── */
.bg-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.particle {
  position: absolute;
  bottom: -10px;
  border-radius: 50%;
  background: rgba(180, 100, 255, 0.6);
  animation: float-up linear infinite;
}
@keyframes float-up {
  from { transform: translateY(0) scale(1); opacity: 0.8; }
  to   { transform: translateY(-100vh) scale(0.3); opacity: 0; }
}

/* ── タイトルヘッダー ──────────────────── */
.title-header {
  text-align: center;
  z-index: 1;
}
.subtitle {
  font-size: 0.75rem;
  letter-spacing: 0.3em;
  color: #d4b8ff;
  margin-bottom: 6px;
  text-transform: uppercase;
}
.main-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.1;
}
.title-jp {
  font-size: 2.8rem;
  font-weight: 900;
  color: #ffd700;
  text-shadow: 0 0 20px #ffd70099, 0 0 40px #ffd70044;
  letter-spacing: 0.15em;
}
.title-en {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ff69b4;
  text-shadow: 0 0 14px #ff69b488;
  letter-spacing: 0.4em;
  margin-top: 4px;
}

/* ── キャラクター展示 ─────────────────── */
.showcase {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  z-index: 1;
}
.showcase-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgba(255, 105, 180, 0.5);
  animation: spin 10s linear infinite;
}
.showcase-ring.outer { inset: 0; }
.showcase-ring.inner { inset: 16px; border-color: rgba(255, 215, 0, 0.4); animation-direction: reverse; animation-duration: 7s; }
.showcase-icon {
  font-size: 3.2rem;
  filter: drop-shadow(0 0 12px #ffd700);
  z-index: 1;
}
.showcase-name {
  position: absolute;
  bottom: -22px;
  font-size: 0.75rem;
  color: #ff69b4;
  text-shadow: 0 0 8px #ff69b4;
  white-space: nowrap;
  letter-spacing: 0.1em;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* ── 難易度選択 ───────────────────────── */
.difficulty-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  z-index: 1;
}
.section-label {
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  color: #888;
}
.difficulty-buttons {
  display: flex;
  gap: 10px;
}
.diff-btn {
  padding: 8px 18px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px;
  color: #aaa;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  transition: all 0.2s;
  min-width: 100px;
}
.diff-btn:hover {
  border-color: var(--d-color);
  color: var(--d-color);
  background: rgba(0,0,0,0.7);
}
.diff-btn.active {
  border-color: var(--d-color);
  color: var(--d-color);
  background: rgba(0,0,0,0.75);
  box-shadow: 0 0 12px var(--d-color), inset 0 0 12px rgba(255,255,255,0.04);
}
.diff-name {
  font-weight: 700;
  font-size: 0.95rem;
}
.diff-detail {
  font-size: 0.62rem;
  opacity: 0.65;
  letter-spacing: 0.03em;
}

/* ── スタートボタン ───────────────────── */
.start-btn {
  padding: 14px 48px;
  background: linear-gradient(135deg, #4a0080, #800040);
  border: 2px solid #ffd700;
  border-radius: 12px;
  color: #ffd700;
  font-size: 1.15rem;
  font-weight: 900;
  letter-spacing: 0.2em;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  z-index: 1;
  transition: all 0.2s;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}
.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 28px rgba(255, 215, 0, 0.5);
  background: linear-gradient(135deg, #600090, #990050);
}
.start-main { font-size: 1.1rem; }
.start-hint {
  font-size: 0.62rem;
  color: rgba(255, 215, 0, 0.55);
  letter-spacing: 0.08em;
  font-weight: 400;
}

/* ── 遊び方 ─────────────────────────────── */
.how-to {
  list-style: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  z-index: 1;
}
.how-to li {
  font-size: 0.72rem;
  color: #888;
  letter-spacing: 0.04em;
}
</style>
