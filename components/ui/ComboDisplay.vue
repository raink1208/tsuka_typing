<template>
  <div class="combo-display" :class="{ active: combo > 0 }">
    <div class="label">COMBO</div>
    <div class="value" :key="combo">
      <span class="x">×</span>{{ combo }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ combo: number }>()
</script>

<style scoped>
.combo-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 90px;
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
  font-weight: 700;
  color: rgba(255,255,255,0.35);
  letter-spacing: 0.05em;
  transition: color 0.2s;
}
.x {
  font-size: 1rem;
  margin-right: 1px;
}

.active .value {
  color: #ff69b4;
  text-shadow: 0 0 10px #ff69b488;
  animation: combo-pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes combo-pop {
  from { transform: scale(0.7); }
  to   { transform: scale(1); }
}
</style>
