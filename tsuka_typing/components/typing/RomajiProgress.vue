<template>
  <div class="romaji-progress">
    <span
      v-for="(ch, i) in chars"
      :key="i"
      :class="[
        'romaji-char',
        i < matched ? 'typed' : i === matched ? 'current' : 'pending',
      ]"
    >{{ ch }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  romaji: string | undefined
  matched: number
}>()

const chars = computed(() => (props.romaji ?? '').split(''))
</script>

<style scoped>
/* ルーン石板の詠唱進捗表示 */
.romaji-progress {
  display: flex;
  justify-content: center;
  gap: 1px;
  font-family: 'Share Tech Mono', 'Consolas', monospace;
  font-size: 1.6rem;
  letter-spacing: 0.06em;
  min-height: 2.2rem;
}
.romaji-char {
  display: inline-block;
  padding: 0 2px;
  transition: color 0.08s, text-shadow 0.08s;
}
/* 打済み：琅琶の火で燃える */
.typed {
  color: #e8a040;
  text-shadow:
    0 0 8px rgba(232,160,64,0.9),
    0 0 18px rgba(220,100,20,0.6);
}
/* 次の文字：金色の輝き */
.current {
  color: #e8c85a;
  text-shadow:
    0 0 12px rgba(200,160,40,0.9),
    0 0 24px rgba(200,160,40,0.5);
  animation: rune-pulse 0.7s ease-in-out infinite;
}
/* 未打済：石に刻まれた薄暗い色 */
.pending {
  color: rgba(138,122,90,0.45);
}

@keyframes rune-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}
</style>
