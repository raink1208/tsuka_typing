<template>
  <div class="score-board">
    <div class="label">SCORE</div>
    <div class="value">{{ score.toLocaleString() }}</div>
  </div>
</template>

<script setup lang="ts">
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
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  color: #d4b8ff;
  font-weight: 700;
}
.value {
  font-family: 'Share Tech Mono', monospace;
  font-size: 1.6rem;
  color: #ffd700;
  text-shadow: 0 0 10px #ffd70088;
  font-weight: 700;
  letter-spacing: 0.05em;
}
</style>
