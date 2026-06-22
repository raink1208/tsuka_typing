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
.romaji-progress {
  display: flex;
  justify-content: center;
  gap: 2px;
  font-family: 'Share Tech Mono', 'Consolas', monospace;
  font-size: 1.6rem;
  letter-spacing: 0.08em;
  min-height: 2.2rem;
}
.romaji-char {
  display: inline-block;
  padding: 0 1px;
  transition: color 0.08s, text-shadow 0.08s;
}
.typed {
  color: #44ff88;
  text-shadow: 0 0 8px #44ff88;
}
.current {
  color: #ffd700;
  text-shadow: 0 0 12px #ffd700;
  animation: cursor-blink 0.8s ease-in-out infinite;
}
.pending {
  color: rgba(255, 255, 255, 0.35);
}

@keyframes cursor-blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
</style>
