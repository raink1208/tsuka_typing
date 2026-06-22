<template>
  <div class="hp-bar-wrap">
    <div class="hp-label">
      <span class="name">{{ name }}</span>
      <span class="value">{{ current }} / {{ max }}</span>
    </div>
    <div class="bar-track">
      <div
        class="bar-fill"
        :class="colorClass"
        :style="{ width: pct + '%' }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  name: string
  current: number
  max: number
  side?: 'player' | 'enemy'
}>()

const pct = computed(() => props.max > 0 ? Math.max(0, (props.current / props.max) * 100) : 0)
const colorClass = computed(() => {
  if (props.side === 'enemy') return 'enemy-bar'
  if (pct.value > 60) return 'hp-high'
  if (pct.value > 30) return 'hp-mid'
  return 'hp-low'
})
</script>

<style scoped>
.hp-bar-wrap {
  width: 100%;
}
.hp-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  margin-bottom: 4px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.name { color: #d4b8ff; }
.value { color: #aaa; font-family: 'Share Tech Mono', monospace; }
.bar-track {
  height: 12px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.1);
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.3s ease;
}
.hp-high {
  background: linear-gradient(90deg, #22cc55, #44ff88);
  box-shadow: 0 0 8px #44ff88aa;
}
.hp-mid {
  background: linear-gradient(90deg, #cc8800, #ffcc00);
  box-shadow: 0 0 8px #ffcc00aa;
  animation: hp-flash 0.5s ease 1;
}
.hp-low {
  background: linear-gradient(90deg, #cc2200, #ff4422);
  box-shadow: 0 0 8px #ff4422aa;
  animation: hp-flash 0.5s ease 1;
}
.enemy-bar {
  background: linear-gradient(90deg, #880022, #ff2244);
  box-shadow: 0 0 8px #ff2244aa;
}

@keyframes hp-flash {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}
</style>
