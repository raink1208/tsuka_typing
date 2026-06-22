<template>
  <div class="timer" :class="{ urgent: timeLeft <= 10 }">
    <div class="label">TIME</div>
    <div class="value">{{ formatted }}</div>
    <div class="bar-wrap">
      <div class="bar" :style="{ width: pct + '%' }" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ timeLeft: number; maxTime: number }>()

const formatted = computed(() => {
  const m = Math.floor(Math.max(0, props.timeLeft) / 60)
  const s = Math.max(0, props.timeLeft) % 60
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
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  color: #d4b8ff;
  font-weight: 700;
}
.value {
  font-family: 'Share Tech Mono', monospace;
  font-size: 1.6rem;
  color: #fff;
  font-weight: 700;
  letter-spacing: 0.08em;
}
.bar-wrap {
  width: 80px;
  height: 4px;
  background: rgba(255,255,255,0.15);
  border-radius: 2px;
  margin-top: 3px;
  overflow: hidden;
}
.bar {
  height: 100%;
  background: #44ff88;
  border-radius: 2px;
  transition: width 1s linear, background 0.5s;
}

.timer.urgent .value {
  color: #ff4444;
  text-shadow: 0 0 12px #ff4444;
  animation: tick-pulse 1s ease-in-out infinite;
}
.timer.urgent .bar {
  background: #ff4444;
}
@keyframes tick-pulse {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.06); }
}
</style>
