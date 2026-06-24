<template>
  <div class="title-screen">
    <!-- 浮遊する炎の粒子 -->
    <div class="embers" aria-hidden="true">
      <span v-for="i in 28" :key="i" class="ember" :style="emberStyle(i)" />
    </div>

    <!-- 剣の紋章 -->
    <div class="crest" aria-hidden="true">
      <span class="crest-line" /><span class="crest-icon">⚔</span><span class="crest-line" />
    </div>

    <!-- タイトルブロック（コーナー装飾付き） -->
    <header class="title-block">
      <span class="corner corner-tl" aria-hidden="true" />
      <span class="corner corner-tr" aria-hidden="true" />
      <span class="corner corner-bl" aria-hidden="true" />
      <span class="corner corner-br" aria-hidden="true" />
      <p class="subtitle-en">Typing Chronicle</p>
      <h1 class="main-title">領国つかさ</h1>
      <p class="subtitle-jp">ローマ字タイピングバトル</p>
    </header>

    <!-- 装飾区切り線 -->
    <div class="divider" aria-hidden="true">
      <span class="div-line" /><span class="div-gem">❖</span><span class="div-line" />
    </div>

    <!-- 難易度選択 -->
    <section class="difficulty-section">
      <p class="section-label">試練の難度を選べ</p>
      <div class="difficulty-buttons">
        <button
          v-for="d in difficulties"
          :key="d.value"
          :class="['diff-btn', { active: selectedDiff === d.value }]"
          :style="{ '--d-color': d.color }"
          @click="selectedDiff = d.value"
        >
          <span class="corner corner-tl" aria-hidden="true" />
          <span class="corner corner-tr" aria-hidden="true" />
          <span class="corner corner-bl" aria-hidden="true" />
          <span class="corner corner-br" aria-hidden="true" />
          <span class="diff-icon" aria-hidden="true">{{ d.icon }}</span>
          <span class="diff-name">{{ d.label }}</span>
          <span class="diff-detail">{{ d.detail }}</span>
        </button>
      </div>
    </section>

    <!-- スタートボタン -->
    <button class="start-btn" @click="startGame">
      <span aria-hidden="true">⚔</span>
      冒険を始める
      <kbd class="start-key">Enter</kbd>
    </button>

    <!-- 遊び方 -->
    <ul class="how-to-list">
      <li>ローマ字でタイピング → つかさが攻撃</li>
      <li>ミスすると敵の反撃を受ける</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false })

const store = useGameStore()

const selectedDiff = ref<'easy' | 'normal' | 'hard'>('normal')

const difficulties = [
  { value: 'easy'   as const, label: 'かんたん',   detail: '70秒 / やさしい言葉', color: '#48a068', icon: '🌿' },
  { value: 'normal' as const, label: 'ふつう',     detail: '60秒 / 普通の言葉',   color: '#c8a028', icon: '⚔' },
  { value: 'hard'   as const, label: 'むずかしい', detail: '50秒 / 強力な言葉',   color: '#c44030', icon: '💀' },
]

function startGame() {
  store.setDifficulty(selectedDiff.value)
  store.startGame()
  navigateTo('/game')
}

function emberStyle(i: number) {
  const seed  = i * 137.508
  const x     = (seed * 13 % 100).toFixed(1)
  const delay = (seed * 7  % 10).toFixed(2)
  const dur   = (5 + seed * 3 % 8).toFixed(1)
  const size  = (2 + seed * 2 % 4).toFixed(1)
  const warm  = Math.floor(seed * 11 % 3)
  const colors = ['rgba(200,160,40,0.7)', 'rgba(220,100,20,0.6)', 'rgba(255,180,50,0.5)']
  return {
    left:              `${x}%`,
    animationDelay:    `${delay}s`,
    animationDuration: `${dur}s`,
    width:             `${size}px`,
    height:            `${size}px`,
    background:        colors[warm],
  }
}

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
  gap: 1.1rem;
  overflow: hidden;
}

/* ── 炎の粒子 ─────────────────────────── */
.embers {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.ember {
  position: absolute;
  bottom: -10px;
  border-radius: 50%;
  animation: ember-rise linear infinite;
}
@keyframes ember-rise {
  from { transform: translateY(0) scale(1);       opacity: 0.9; }
  80%  { opacity: 0.5; }
  to   { transform: translateY(-105vh) scale(0.2); opacity: 0; }
}

/* ── 剣の紋章 ─────────────────────────── */
.crest {
  display: flex;
  align-items: center;
  gap: 14px;
  z-index: 1;
}
.crest-line {
  display: block;
  width: 64px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #7a5c28, transparent);
}
.crest-icon {
  color: #c8a028;
  font-size: 1.3rem;
  text-shadow: 0 0 14px rgba(200,160,40,0.8);
  animation: crest-pulse 3s ease-in-out infinite;
}
@keyframes crest-pulse {
  0%, 100% { text-shadow: 0 0 14px rgba(200,160,40,0.8); }
  50%       { text-shadow: 0 0 28px rgba(200,160,40,1.0), 0 0 48px rgba(200,160,40,0.4); }
}

/* ── コーナー装飾（共通） ──────────────── */
.corner {
  position: absolute;
  width: 14px;
  height: 14px;
  display: block;
}
.corner-tl { top: -1px;    left: -1px;   border-top: 2px solid #c8a028; border-left: 2px solid #c8a028; }
.corner-tr { top: -1px;    right: -1px;  border-top: 2px solid #c8a028; border-right: 2px solid #c8a028; }
.corner-bl { bottom: -1px; left: -1px;   border-bottom: 2px solid #c8a028; border-left: 2px solid #c8a028; }
.corner-br { bottom: -1px; right: -1px;  border-bottom: 2px solid #c8a028; border-right: 2px solid #c8a028; }

/* ── タイトルブロック ──────────────────── */
.title-block {
  position: relative;
  text-align: center;
  padding: 28px 52px;
  background: rgba(14, 10, 4, 0.74);
  border: 1px solid #5a3c14;
  z-index: 1;
}
.subtitle-en {
  font-family: 'Cinzel', 'Times New Roman', serif;
  font-size: 0.68rem;
  letter-spacing: 0.55em;
  color: #7a6018;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.main-title {
  font-family: 'Noto Serif JP', 'Hiragino Mincho Pro', serif;
  font-size: 3.6rem;
  font-weight: 900;
  color: #e8c85a;
  text-shadow:
    0 0 24px rgba(200,160,40,0.9),
    0 0 56px rgba(200,160,40,0.3),
    3px 3px 0 rgba(0,0,0,0.9),
    -1px -1px 0 rgba(0,0,0,0.5);
  letter-spacing: 0.12em;
  line-height: 1.15;
}
.subtitle-jp {
  font-family: 'Noto Serif JP', serif;
  font-size: 0.72rem;
  color: #7a6a48;
  letter-spacing: 0.24em;
  margin-top: 8px;
}

/* ── 区切り線 ─────────────────────────── */
.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1;
  width: min(380px, 80vw);
}
.div-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, #5a3c14, transparent);
  display: block;
}
.div-gem {
  color: #c8a028;
  font-size: 0.75rem;
  text-shadow: 0 0 8px rgba(200,160,40,0.5);
}

/* ── 難易度セクション ──────────────────── */
.difficulty-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  z-index: 1;
}
.section-label {
  font-family: 'Cinzel', serif;
  font-size: 0.62rem;
  letter-spacing: 0.38em;
  color: #6a5a38;
  text-transform: uppercase;
}
.difficulty-buttons {
  display: flex;
  gap: 10px;
}
.diff-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 16px;
  background: #1a1208;
  border: 1px solid #4a3218;
  color: #6a5a38;
  min-width: 108px;
  transition: background 0.2s, border-color 0.2s, color 0.2s, box-shadow 0.2s;
  cursor: pointer;
}
.diff-btn .corner { width: 8px; height: 8px; }
.diff-btn .corner-tl,
.diff-btn .corner-tr,
.diff-btn .corner-bl,
.diff-btn .corner-br { border-color: #5a3c14; }
.diff-btn:hover {
  background: #221a0a;
  border-color: #7a5c28;
  color: #d8cda0;
}
.diff-btn:hover .corner-tl,
.diff-btn:hover .corner-tr,
.diff-btn:hover .corner-bl,
.diff-btn:hover .corner-br { border-color: #c8a028; }
.diff-btn.active {
  background: #201808;
  border-color: var(--d-color);
  color: var(--d-color);
  box-shadow: 0 0 16px rgba(0,0,0,0.6);
}
.diff-btn.active .corner-tl,
.diff-btn.active .corner-tr,
.diff-btn.active .corner-bl,
.diff-btn.active .corner-br { border-color: var(--d-color); }
.diff-icon {
  font-size: 1.25rem;
  margin-bottom: 2px;
}
.diff-name {
  font-family: 'Noto Serif JP', serif;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.06em;
}
.diff-detail {
  font-family: 'Cinzel', serif;
  font-size: 0.58rem;
  color: #5a4a28;
  letter-spacing: 0.04em;
  white-space: nowrap;
}
.diff-btn.active .diff-detail {
  color: var(--d-color);
  opacity: 0.72;
}

/* ── スタートボタン ─────────────────────── */
.start-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 38px;
  background: linear-gradient(145deg, #2a1e0a 0%, #1a1208 100%);
  border: 1px solid #c8a028;
  color: #e8c85a;
  font-family: 'Cinzel', serif;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  z-index: 1;
  transition: background 0.2s, box-shadow 0.2s, color 0.2s;
  box-shadow: 0 0 24px rgba(200,160,40,0.12), inset 0 1px 0 rgba(200,160,40,0.08);
}
.start-btn::before {
  content: '';
  position: absolute;
  top: -1px; left: -1px;
  width: 14px; height: 14px;
  border-top: 2px solid #e8c85a;
  border-left: 2px solid #e8c85a;
}
.start-btn::after {
  content: '';
  position: absolute;
  bottom: -1px; right: -1px;
  width: 14px; height: 14px;
  border-bottom: 2px solid #e8c85a;
  border-right: 2px solid #e8c85a;
}
.start-btn:hover {
  background: linear-gradient(145deg, #382810 0%, #261a0a 100%);
  box-shadow: 0 0 36px rgba(200,160,40,0.35), inset 0 1px 0 rgba(200,160,40,0.15);
  color: #fff8d8;
}
.start-key {
  font-family: 'Cinzel', serif;
  font-size: 0.55rem;
  color: #7a6018;
  letter-spacing: 0.08em;
  background: none;
  border: none;
  padding: 0;
  margin-left: 2px;
}

/* ── 遊び方リスト ───────────────────────── */
.how-to-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  z-index: 1;
}
.how-to-list li {
  font-size: 0.68rem;
  color: #5a4a28;
  letter-spacing: 0.06em;
}
.how-to-list li::before {
  content: '— ';
  color: #7a5c28;
}
</style>
