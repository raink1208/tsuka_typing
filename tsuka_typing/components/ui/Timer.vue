<template>
  <div class="timer" :class="{ urgent: timeLeft <= 10 }">
    <div class="label">{{ t('components.time') }}</div>
    <div class="value">{{ formatted }}</div>
    <div class="bar-wrap">
      <div class="bar" :style="{ width: pct + '%' }" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const props = defineProps<{ timeLeft: number; maxTime: number }>()

const formatted = computed(() => {
  const t = Math.floor(Math.max(0, props.timeLeft))
  const m = Math.floor(t / 60)
  const s = t % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const pct = computed(() =>
  props.maxTime > 0 ? Math.max(0, (props.timeLeft / props.maxTime) * 100) : 0
)
</script>

<style scoped>
.timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 90px;
  transition: color 0.3s;
}
.label {
  font-family: 'Cinzel', serif;
  font-size: 0.78rem;
  letter-spacing: 0.16em;
  color: #c8a63c;
  font-weight: 700;
  text-transform: uppercase;
}
.value {
  font-family: 'Share Tech Mono', monospace;
  font-size: 1.8rem;
  color: #f0e8c8;
  font-weight: 700;
  letter-spacing: 0.08em;
}
.bar-wrap {
  width: 80px;
  height: 4px;
  background: rgba(90,60,20,0.4);
  border-radius: 0;
  margin-top: 3px;
  overflow: hidden;
}
.bar {
  height: 100%;
  background: linear-gradient(90deg, #2e6644, #48a068);
  border-radius: 0;
  transition: width 1s linear, background 0.5s;
}

.timer.urgent .value {
  color: #ff6a55;
  text-shadow: 0 0 10px rgba(196,64,48,0.6);
  animation: tick-pulse 1s ease-in-out infinite;
}
.timer.urgent .bar {
  background: linear-gradient(90deg, #8b1a1a, #c44030);
}
@keyframes tick-pulse {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.06); }
}
</style>