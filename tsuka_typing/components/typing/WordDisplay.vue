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
  width: 100%;
  max-width: 100%;
  text-align: center;
  line-height: 1.2;
}
.kanji {
  font-size: clamp(1.6rem, 6vw, 2.9rem);
  font-weight: 900;
  color: #fdf6e0;
  text-shadow:
    0 0 14px rgba(200,160,40,0.5),
    2px 2px 0 rgba(0,0,0,0.8);
  letter-spacing: 0.1em;
  font-family: 'Noto Serif JP', serif;
  overflow-wrap: break-word;
  word-break: break-word;
}
.hiragana {
  font-size: clamp(0.85rem, 3vw, 1.3rem);
  color: #c8b98c;
  margin-top: 0.3rem;
  letter-spacing: 0.18em;
  font-family: 'Noto Serif JP', serif;
  overflow-wrap: break-word;
  word-break: break-word;
}
</style>