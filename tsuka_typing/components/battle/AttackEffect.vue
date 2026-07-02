<template>
  <!-- 攻撃エフェクトのオーバーレイ -->
  <Teleport to="body">
    <!-- ミスフラッシュ -->
    <div v-if="store.showMissFlash" class="miss-flash" />

    <!-- スコアポップアップ -->
    <Transition name="score-pop">
      <div v-if="store.showScorePopup" class="score-popup">
        +{{ store.lastEarnedScore.toLocaleString() }}
        <span v-if="store.combo >= 5" class="combo-bonus">
          COMBO ×{{ Math.floor(store.combo / 5) + 1 }}
        </span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const store = useGameStore()
</script>

<style scoped>
.miss-flash {
  position: fixed;
  inset: 0;
  background: rgba(139, 26, 26, 0.3);
  pointer-events: none;
  z-index: 50;
  animation: flash-out 0.4s ease forwards;
}
@keyframes flash-out {
  from { opacity: 1; }
  to   { opacity: 0; }
}

.score-popup {
  position: fixed;
  top: 42%;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Cinzel', serif;
  font-size: 2rem;
  font-weight: 700;
  color: #e8c85a;
  text-shadow: 0 0 16px rgba(200,160,40,0.9), 0 2px 4px rgba(0,0,0,0.9);
  z-index: 60;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.combo-bonus {
  font-size: 0.9rem;
  color: #9060c0;
  text-shadow: 0 0 10px rgba(144,96,192,0.7);
  letter-spacing: 0.1em;
}

.score-pop-enter-active {
  animation: score-rise 0.6s ease forwards;
}
.score-pop-leave-active {
  animation: score-fade 0.2s ease forwards;
}
@keyframes score-rise {
  0%   { transform: translateX(-50%) translateY(0) scale(0.5); opacity: 0; }
  30%  { opacity: 1; }
  100% { transform: translateX(-50%) translateY(-50px) scale(1.2); opacity: 1; }
}
@keyframes score-fade {
  from { opacity: 1; }
  to   { opacity: 0; }
}
</style>