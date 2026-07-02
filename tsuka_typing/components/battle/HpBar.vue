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
  font-size: 0.72rem;
  margin-bottom: 4px;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.name { color: #8a7a5a; font-family: 'Noto Serif JP', serif; }
.value { color: #5a4a28; font-family: 'Share Tech Mono', monospace; }
.bar-track {
  height: 11px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 0;
  border: 1px solid rgba(90,60,20,0.5);
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 0;
  transition: width 0.3s ease;
}
.hp-high {
  background: linear-gradient(90deg, #2e6644, #48a068);
  box-shadow: 0 0 8px rgba(72,160,104,0.5);
}
.hp-mid {
  background: linear-gradient(90deg, #7a5c10, #c8a028);
  box-shadow: 0 0 8px rgba(200,160,40,0.4);
  animation: hp-flash 0.5s ease 1;
}
.hp-low {
  background: linear-gradient(90deg, #8b1a1a, #c44030);
  box-shadow: 0 0 8px rgba(196,64,48,0.4);
  animation: hp-flash 0.5s ease 1;
}
.enemy-bar {
  background: linear-gradient(90deg, #6b1010, #c44030);
  box-shadow: 0 0 8px rgba(196,64,48,0.4);
}

@keyframes hp-flash {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
}
</style>
