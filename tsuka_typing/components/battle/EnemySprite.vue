<template>
  <div
    class="enemy-sprite"
    :class="`anim-${state}`"
    :style="{ '--enemy-color': enemy?.color ?? '#ff4444' }"
  >
    <div class="enemy-body">
      <div class="enemy-glow" />
      <div class="enemy-emoji">{{ enemy?.emoji ?? '👾' }}</div>
    </div>
    <div class="enemy-name">{{ enemy?.name ?? '???' }}</div>
    <div class="enemy-desc">{{ enemy?.description ?? '' }}</div>
  </div>
</template>

<script setup lang="ts">
import type { Enemy } from '~/data/words'
defineProps<{
  enemy: Enemy | null
  state: 'idle' | 'attack' | 'damage' | 'dead'
}>()
</script>

<style scoped>
.enemy-sprite {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 140px;
}
.enemy-body {
  position: relative;
  width: 110px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.enemy-glow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(ellipse, color-mix(in srgb, var(--enemy-color) 25%, transparent) 0%, transparent 70%);
}
.enemy-emoji {
  font-size: 5rem;
  filter: drop-shadow(0 0 12px var(--enemy-color));
  z-index: 1;
}
.enemy-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--enemy-color);
  text-shadow: 0 0 8px var(--enemy-color);
  letter-spacing: 0.05em;
}
.enemy-desc {
  font-size: 0.65rem;
  color: rgba(255,255,255,0.45);
  letter-spacing: 0.03em;
}

/* ── アニメーション ── */
.anim-idle .enemy-body {
  animation: enemy-idle 2s ease-in-out infinite;
}
.anim-attack .enemy-body {
  animation: enemy-attack 0.6s ease;
}
.anim-damage .enemy-body {
  animation: enemy-damage 0.45s ease;
}
.anim-dead .enemy-body {
  animation: enemy-dead 0.9s ease forwards;
}
.anim-dead .enemy-name,
.anim-dead .enemy-desc {
  opacity: 0;
  transition: opacity 0.3s;
}

@keyframes enemy-idle {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50%       { transform: translateY(-8px) rotate(2deg); }
}
@keyframes enemy-attack {
  0%   { transform: translateX(0) scale(1); }
  30%  { transform: translateX(-50px) scale(1.2); }
  60%  { transform: translateX(-20px) scale(1.05); }
  100% { transform: translateX(0) scale(1); }
}
@keyframes enemy-damage {
  0%, 100% { transform: translateX(0); filter: brightness(1); }
  20%      { transform: translateX(12px);  filter: brightness(3) saturate(0); }
  40%      { transform: translateX(-12px); filter: brightness(3) saturate(0); }
  60%      { transform: translateX(8px);   filter: brightness(2); }
  80%      { transform: translateX(-6px);  filter: brightness(1.5); }
}
@keyframes enemy-dead {
  0%   { transform: scale(1) rotate(0deg); opacity: 1; }
  40%  { transform: scale(1.3) rotate(10deg); filter: brightness(3); opacity: 1; }
  100% { transform: scale(0.3) rotate(30deg); opacity: 0; }
}
</style>
