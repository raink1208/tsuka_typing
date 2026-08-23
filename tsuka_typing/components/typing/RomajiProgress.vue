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
  flex-wrap: wrap;
  justify-content: center;
  gap: 1px;
  row-gap: 4px;
  max-width: 100%;
  font-family: 'Share Tech Mono', 'Consolas', monospace;
  font-size: clamp(1.1rem, 4vw, 1.9rem);
  letter-spacing: 0.06em;
  min-height: 2.5rem;
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
/* 次の文字：白銀の輝き（打済みの琥珀色とはっきり区別する） */
.current {
  color: #ffffff;
  background: rgba(120,200,255,0.16);
  text-shadow:
    0 0 10px rgba(160,220,255,0.95),
    0 0 22px rgba(120,200,255,0.7);
  border-radius: 2px;
  animation: rune-pulse 0.7s ease-in-out infinite;
}
/* 未打済：石に刻まれた薄暗い色 */
.pending {
  color: rgba(206,192,150,0.75);
}

@keyframes rune-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}
</style>