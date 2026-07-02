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
  color: #f0e8c8;
  text-shadow:
    0 0 14px rgba(200,160,40,0.5),
    2px 2px 0 rgba(0,0,0,0.8);
  letter-spacing: 0.1em;
  font-family: 'Noto Serif JP', serif;
}
.hiragana {
  font-size: 1.05rem;
  color: #8a7a5a;
  margin-top: 0.2rem;
  letter-spacing: 0.18em;
  font-family: 'Noto Serif JP', serif;
}
</style>
