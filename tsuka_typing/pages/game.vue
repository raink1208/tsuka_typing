<template>
  <div class="game-screen" :class="{ 'miss-shake': store.showMissFlash }">
    <!-- コーナー装飾 -->
    <span class="corner corner-tl" aria-hidden="true" />
    <span class="corner corner-tr" aria-hidden="true" />
    <span class="corner corner-bl" aria-hidden="true" />
    <span class="corner corner-br" aria-hidden="true" />

    <!-- エフェクトオーバーレイ -->
    <BattleAttackEffect />

    <!-- ロード / スタート待機オーバーレイ -->
    <Transition name="ready-fade">
      <div v-if="!hasStarted" class="ready-overlay">
        <!-- 出題準備中（/api/game/start の応答待ち） -->
        <div v-if="isLoading" class="ready-box">
          <p class="loading-title">{{ t('game.loadingTitle') }}</p>
          <div class="loading-dots" aria-hidden="true">
            <span /><span /><span />
          </div>
          <p class="ready-hint-sub">{{ t('game.loadingHint') }}</p>
        </div>

        <!-- 準備完了 -->
        <div v-else class="ready-box">
          <p class="ready-title">{{ t('game.readyTitle') }}</p>
          <p class="ready-hint">{{ t('game.readyHint') }}</p>
          <p v-if="showImeWarning" class="ready-ime-warning">{{ t('game.imeWarning') }}</p>
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
        <span class="hp-char-label player" :title="displayPlayerName">{{ displayPlayerName }}</span>
        <BattleHpBar
          name=""
          :current="store.tsukasaHp"
          :max="store.tsukasaMaxHp"
          side="player"
        />
      </div>
      <div class="hp-row">
        <span class="hp-char-label enemy">{{ displayEnemyName }}</span>
        <BattleHpBar
          name=""
          :current="store.displayEnemyHp"
          :max="store.displayEnemyMaxHp"
          side="enemy"
        />
      </div>
    </section>

    <!-- ── バトルエリア ─────────────── -->
    <section class="battle-area">
      <BattleCharacterSprite :state="store.tsukasaAnim" />

      <div class="vs-area">
        <span class="vs-text">{{ t('game.vs') }}</span>
        <div class="lightning" aria-hidden="true">⚡</div>
      </div>

      <BattleEnemySprite
        :enemy="store.displayEnemy"
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
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false })

const { t } = useI18n()
const store = useGameStore()
const { start, stop } = useGameLoop()

const displayPlayerName = computed(() =>
  store.playerName === 'anonymous' ? t('character.tsukasa.shortName') : store.playerName
)
const displayEnemyName = computed(() => {
  const id = store.displayEnemy?.id
  return id ? t(`enemies.${id}.name`) : t('enemies.unknown.name')
})

const inputFieldRef = ref()
/** ゲームループが動き出したか（＝オーバーレイを消したか） */
const hasStarted = ref(false)
const showImeWarning = ref(false)
/** ロード中に押されたスペースを覚えておき、準備完了と同時に自動スタートする */
const pendingStart = ref(false)

const isLoading = computed(() => store.startStatus !== 'ready')

function beginGame() {
  if (hasStarted.value) return
  // 出題準備が済むまではスタートさせない。ワード未生成のまま
  // タイマーだけが進み、打鍵が握り潰されるのを防ぐ。
  if (isLoading.value) {
    pendingStart.value = true
    return
  }
  hasStarted.value = true
  store.beginPlaying()
  start()
  nextTick(() => inputFieldRef.value?.focus())
}

// ロード中に押されたスペースを、準備完了の瞬間に消化する
watch(isLoading, (loading) => {
  if (!loading && pendingStart.value) beginGame()
})

function onKeydown(e: KeyboardEvent) {
  if (!hasStarted.value && e.code === 'Space') {
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
  width: 100px;
  flex-shrink: 0;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  /* プレイヤー名は最大30文字入力できるため、溢れた分は省略記号で切る */
  overflow: hidden;
  text-overflow: ellipsis;
}
.hp-char-label.player {
  color: #9060c0;
  text-shadow: 0 0 6px rgba(144,96,192,0.5);
  /* 入力された名前はランキング表示と一致させたいので大文字化しない */
  text-transform: none;
}
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
.loading-title {
  font-family: 'Cinzel', serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: #c8a028;
  letter-spacing: 0.24em;
  text-shadow: 0 0 16px rgba(200,160,40,0.5);
  margin: 0;
}
.loading-dots {
  display: flex;
  gap: 10px;
}
.loading-dots span {
  display: block;
  width: 7px;
  height: 7px;
  background: #c8a028;
  box-shadow: 0 0 8px rgba(200,160,40,0.7);
  animation: loading-blink 1.2s ease-in-out infinite;
}
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes loading-blink {
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50%       { opacity: 1;   transform: scale(1); }
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