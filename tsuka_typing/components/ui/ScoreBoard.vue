<template>
  <div class="score-board">
    <div class="label">{{ t('components.score') }}</div>
    <div class="value">{{ score.toLocaleString() }}</div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
defineProps<{ score: number }>()
</script>

<style scoped>
.score-board {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 110px;
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
  color: #f2d472;
  text-shadow: 0 0 10px rgba(200,160,40,0.6);
  font-weight: 700;
  letter-spacing: 0.05em;
}
</style>