<template>
  <div class="word-display">
    <div class="kanji">{{ word?.kanji ?? '...' }}</div>
    <div class="hiragana">{{ word?.hiragana ?? '' }}</div>
  </div>
</template>

<script setup lang="ts">
import type { Word } from '~/data/words'
defineProps<{ word: Word | null }>()
</script>

<style scoped>
.word-display {
  text-align: center;
  line-height: 1.2;
}
.kanji {
  font-size: 2.6rem;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 0 12px rgba(255, 215, 0, 0.6);
  letter-spacing: 0.1em;
}
.hiragana {
  font-size: 1.1rem;
  color: #d4b8ff;
  margin-top: 0.2rem;
  letter-spacing: 0.15em;
}
</style>
