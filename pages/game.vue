<template>
  <div class="game-screen" :class="{ 'miss-shake': store.showMissFlash }">
    <!-- コーナー装飾 -->
    <span class="corner corner-tl" aria-hidden="true" />
    <span class="corner corner-tr" aria-hidden="true" />
    <span class="corner corner-bl" aria-hidden="true" />
    <span class="corner corner-br" aria-hidden="true" />

    <!-- エフェクトオーバーレイ -->
    <BattleAttackEffect />

    <!-- スタート待機オーバーレイ -->
    <Transition name="ready-fade">
      <div v-if="!isReady" class="ready-overlay">
        <div class="ready-box">
          <p class="ready-title">READY?</p>
          <p class="ready-hint">スペースキーを押してスタート</p>
          <p v-if="showImeWarning" class="ready-ime-warning">⚠ 半角モードに切り替えてください（半角/全角キー）</p>
        </div>
      </div>
    </Transition>

    <!-- ── 上部HUD ─────────────────── -->
    <header class="hud">
      <UiScoreBoard :score="store.score" />
      <div class="hud-center">
        <UiComboDisplay :combo="store.combo" />
      </div>
      <UiTimer :time-left="store.timeLeft" :max-time="store.config.time" />
    </header>

    <!-- ── HPバーエリア ─────────────── -->
    <section class="hp-section">
      <div class="hp-row">
        <span class="hp-char-label player">つかさ</span>
        <BattleHpBar
          name=""
          :current="store.tsukasaHp"
          :max="store.tsukasaMaxHp"
          side="player"
        />
      </div>
      <div class="hp-row">
        <span class="hp-char-label enemy">{{ store.currentEnemy?.name ?? '???' }}</span>
        <BattleHpBar
          name=""
          :current="store.enemyHp"
          :max="store.enemyMaxHp"
          side="enemy"
        />
      </div>
    </section>

    <!-- ── バトルエリア ─────────────── -->
    <section class="battle-area">
      <BattleCharacterSprite :state="store.tsukasaAnim" />

      <div class="vs-area">
        <span class="vs-text">VS</span>
        <div class="lightning" aria-hidden="true">⚡</div>
      </div>

      <BattleEnemySprite
        :enemy="store.currentEnemy"
        :state="store.enemyAnim"
      />
    </section>

    <!-- ── タイピングエリア ─────────── -->
    <section class="typing-section" :class="{ transitioning: store.transitioning }">
      <span class="corner corner-tl" aria-hidden="true" />
      <span class="corner corner-tr" aria-hidden="true" />
      <span class="corner corner-bl" aria-hidden="true" />
      <span class="corner corner-br" aria-hidden="true" />

      <!-- 入力キャプチャ（非表示） -->
      <TypingInputField ref="inputFieldRef" @char="store.onKeyPress" />

      <TypingWordDisplay :word="store.currentWord" />

      <div class="romaji-wrap">
        <TypingRomajiProgress
          :romaji="store.displayRomaji"
          :matched="store.matchedDisplayLength"
        />
      </div>

      <div class="input-hint">クリックして呪文を詠唱</div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false })

const store = useGameStore()
const { start, stop } = useGameLoop()

const inputFieldRef = ref()
const isReady = ref(false)
const showImeWarning = ref(false)

function beginGame() {
  if (isReady.value) return
  isReady.value = true
  start()
  nextTick(() => inputFieldRef.value?.focus())
}

function onKeydown(e: KeyboardEvent) {
  if (!isReady.value && e.code === 'Space') {
    // IMEが全角モードだと key が 'Process' になるか isComposing が true になる
    if (e.key === 'Process' || e.isComposing) {
      e.preventDefault()
      showImeWarning.value = true
      return
    }
    e.preventDefault()
    showImeWarning.value = false
    beginGame()
  }
}

// タイトルを経由していない場合はリダイレクト
onMounted(() => {
  if (store.phase !== 'battle') {
    navigateTo('/')
    return
  }
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  stop()
  window.removeEventListener('keydown', onKeydown)
})

// ゲーム終了 → リザルト画面へ
watch(() => store.phase, (p) => {
  if (p === 'result') navigateTo('/result')
})
</script>

<style scoped>
/* ── コーナー装飾（共通） ──────────────── */
.corner {
  position: absolute;
  display: block;
  width: 16px;
  height: 16px;
  z-index: 2;
  pointer-events: none;
}
.corner-tl { top: -1px;    left: -1px;   border-top: 2px solid #c8a028; border-left: 2px solid #c8a028; }
.corner-tr { top: -1px;    right: -1px;  border-top: 2px solid #c8a028; border-right: 2px solid #c8a028; }
.corner-bl { bottom: -1px; left: -1px;   border-bottom: 2px solid #c8a028; border-left: 2px solid #c8a028; }
.corner-br { bottom: -1px; right: -1px;  border-bottom: 2px solid #c8a028; border-right: 2px solid #c8a028; }

/* ── 全体レイアウト ─────────────────────── */
.game-screen {
  position: relative;
  width: min(860px, 100vw);
  height: 100vh;
  max-height: 680px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 14px 12px;
  background: linear-gradient(180deg, #1c1508 0%, #100c06 100%);
  border: 1px solid #5a3c14;
  border-radius: 0;
  overflow: hidden;
}
.game-screen::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% -5%, rgba(100,60,0,0.14) 0%, transparent 55%);
  pointer-events: none;
  z-index: 0;
}

/* ── HUD ───────────────────────────────── */
.hud {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(10, 8, 4, 0.72);
  border-radius: 0;
  border: 1px solid #4a3218;
  padding: 8px 16px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}
.hud-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

/* ── HPバーセクション ──────────────────── */
.hp-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(10, 8, 4, 0.62);
  border-radius: 0;
  border: 1px solid #4a3218;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}
.hp-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.hp-char-label {
  font-family: 'Cinzel', serif;
  font-size: 0.68rem;
  font-weight: 700;
  white-space: nowrap;
  width: 80px;
  flex-shrink: 0;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.hp-char-label.player { color: #9060c0; text-shadow: 0 0 6px rgba(144,96,192,0.5); }
.hp-char-label.enemy  { color: #c44030; text-shadow: 0 0 6px rgba(196,64,48,0.5); }

/* ── バトルエリア ───────────────────────── */
.battle-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 20px;
  min-height: 0;
  position: relative;
  z-index: 1;
}
.vs-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.vs-text {
  font-family: 'Cinzel', serif;
  font-size: 1.8rem;
  font-weight: 900;
  color: #c8a028;
  text-shadow: 0 0 18px rgba(200,160,40,0.7);
  letter-spacing: 0.25em;
}
.lightning {
  font-size: 1.1rem;
  animation: ember-flicker 2s ease-in-out infinite;
}
@keyframes ember-flicker {
  0%, 100% { opacity: 1;   filter: brightness(1); }
  35%       { opacity: 0.6; filter: brightness(1.6); }
  70%       { opacity: 0.8; filter: brightness(0.8); }
}

/* ── タイピングセクション（ルーン石板） ── */
.typing-section {
  position: relative;
  background: linear-gradient(180deg, rgba(8,6,2,0.92) 0%, rgba(14,10,4,0.96) 100%);
  border: 1px solid #7a5c28;
  border-radius: 0;
  padding: 16px 20px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  transition: opacity 0.2s;
  z-index: 1;
  box-shadow:
    inset 0 1px 0 rgba(200,160,40,0.07),
    inset 0 -1px 0 rgba(0,0,0,0.6),
    0 0 28px rgba(0,0,0,0.7);
}
.typing-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 0%, rgba(200,160,40,0.04) 0%, transparent 65%);
  pointer-events: none;
}
.typing-section .corner { width: 12px; height: 12px; }
.typing-section.transitioning {
  opacity: 0.4;
}
.romaji-wrap {
  padding: 6px 14px;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(122,92,40,0.35);
}
.input-hint {
  font-family: 'Cinzel', serif;
  font-size: 0.55rem;
  color: rgba(122,92,40,0.55);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* ── ミスシェイク ─────────────────────── */
.miss-shake {
  animation: screen-shake 0.3s ease;
}
@keyframes screen-shake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-8px); }
  40%       { transform: translateX(8px); }
  60%       { transform: translateX(-5px); }
  80%       { transform: translateX(5px); }
}

/* ── スタート待機オーバーレイ ─────────── */
.ready-overlay {
  position: absolute;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 7, 3, 0.82);
  cursor: pointer;
}
.ready-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 56px;
  border: 1px solid #c8a028;
  background: rgba(28, 21, 8, 0.95);
  position: relative;
}
.ready-box::before,
.ready-box::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
}
.ready-box::before {
  top: -1px; left: -1px;
  border-top: 2px solid #c8a028; border-left: 2px solid #c8a028;
}
.ready-box::after {
  bottom: -1px; right: -1px;
  border-bottom: 2px solid #c8a028; border-right: 2px solid #c8a028;
}
.ready-title {
  font-family: 'Cinzel', serif;
  font-size: 2.4rem;
  font-weight: 700;
  color: #f0d060;
  letter-spacing: 0.2em;
  text-shadow: 0 0 20px rgba(200,160,40,0.7);
  margin: 0;
  animation: ready-pulse 1.4s ease-in-out infinite;
}
.ready-hint {
  font-family: 'Cinzel', serif;
  font-size: 0.95rem;
  color: #c8a028;
  letter-spacing: 0.15em;
  margin: 0;
}
.ready-hint-sub {
  font-family: 'Cinzel', serif;
  font-size: 0.65rem;
  color: rgba(122, 92, 40, 0.6);
  letter-spacing: 0.1em;
  margin: 0;
}
.ready-ime-warning {
  font-size: 0.8rem;
  color: #e06040;
  text-shadow: 0 0 8px rgba(224,96,64,0.6);
  letter-spacing: 0.05em;
  margin: 0;
  animation: ready-pulse 1s ease-in-out infinite;
}
@keyframes ready-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
}
.ready-fade-enter-active { transition: opacity 0.25s ease; }
.ready-fade-leave-active { transition: opacity 0.3s ease; }
.ready-fade-enter-from,
.ready-fade-leave-to    { opacity: 0; }
</style>