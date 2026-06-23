<template>
  <div class="game-screen" :class="{ 'miss-shake': store.showMissFlash }">
    <!-- エフェクトオーバーレイ -->
    <BattleAttackEffect />

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
      <!-- 入力キャプチャ（非表示） -->
      <TypingInputField ref="inputFieldRef" @char="store.onKeyPress" />

      <TypingWordDisplay :word="store.currentWord" />

      <div class="romaji-wrap">
        <TypingRomajiProgress
          :romaji="store.displayRomaji"
          :matched="store.matchedDisplayLength"
        />
      </div>

      <div class="input-hint">クリックしてフォーカス / ローマ字を入力</div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false })

const store = useGameStore()
const { start, stop } = useGameLoop()

const inputFieldRef = ref()

// タイトルを経由していない場合はリダイレクト
onMounted(() => {
  if (store.phase !== 'battle') {
    navigateTo('/')
    return
  }
  start()
  nextTick(() => inputFieldRef.value?.focus())
})

onUnmounted(() => stop())

// ゲーム終了 → リザルト画面へ
watch(() => store.phase, (p) => {
  if (p === 'result') navigateTo('/result')
})
</script>

<style scoped>
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
  background: linear-gradient(180deg, rgba(15,0,35,0.97) 0%, rgba(8,0,20,0.99) 100%);
  border: 1px solid rgba(160, 80, 255, 0.25);
  border-radius: 12px;
  overflow: hidden;
}
.game-screen::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% -10%, rgba(120, 0, 200, 0.14) 0%, transparent 60%);
  pointer-events: none;
}

/* ── HUD ───────────────────────────────── */
.hud {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.07);
  padding: 8px 16px;
  flex-shrink: 0;
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
  background: rgba(0, 0, 0, 0.35);
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}
.hp-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.hp-char-label {
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
  width: 80px;
  flex-shrink: 0;
  letter-spacing: 0.05em;
}
.hp-char-label.player { color: #ff69b4; text-shadow: 0 0 6px #ff69b4; }
.hp-char-label.enemy  { color: #ff4444; text-shadow: 0 0 6px #ff4444; }

/* ── バトルエリア ───────────────────────── */
.battle-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 20px;
  min-height: 0;
}
.vs-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.vs-text {
  font-size: 1.6rem;
  font-weight: 900;
  color: #ffd700;
  text-shadow: 0 0 16px #ffd700;
  letter-spacing: 0.2em;
}
.lightning {
  font-size: 1.4rem;
  animation: lightning-flicker 1.5s ease-in-out infinite;
}
@keyframes lightning-flicker {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}

/* ── タイピングセクション ─────────────── */
.typing-section {
  position: relative;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(160, 80, 255, 0.3);
  border-radius: 10px;
  padding: 14px 20px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  transition: opacity 0.2s;
}
.typing-section.transitioning {
  opacity: 0.4;
}
.romaji-wrap {
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.08);
}
.input-hint {
  font-size: 0.6rem;
  color: rgba(255,255,255,0.2);
  letter-spacing: 0.05em;
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
</style>