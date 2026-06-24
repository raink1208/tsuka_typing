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
  font-family: 'Cinzel', serif;
  font-size: 0.6rem;
  letter-spacing: 0.22em;
  color: #7a6018;
  font-weight: 600;
  text-transform: uppercase;
}
.value {
  font-family: 'Share Tech Mono', monospace;
  font-size: 1.6rem;
  color: #e8c85a;
  text-shadow: 0 0 10px rgba(200,160,40,0.6);
  font-weight: 700;
  letter-spacing: 0.05em;
}
</style>
