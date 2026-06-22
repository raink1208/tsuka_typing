<template>
  <div class="input-field">
    <input
      ref="el"
      class="ghost-input"
      @keydown="onKeydown"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="none"
      spellcheck="false"
      inputmode="none"
    />
    <!-- クリックで再フォーカス -->
    <div class="click-overlay" @click="focus" />
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  char: [key: string]
}>()

const el = ref<HTMLInputElement>()

function focus() {
  el.value?.focus()
}

function onKeydown(e: KeyboardEvent) {
  if (e.isComposing) return
  if (e.ctrlKey || e.altKey || e.metaKey) return
  if (/^[a-z]$/i.test(e.key)) {
    e.preventDefault()
    emit('char', e.key.toLowerCase())
  }
}

onMounted(() => {
  nextTick(() => focus())
})

defineExpose({ focus })
</script>

<style scoped>
.input-field {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.ghost-input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  border: none;
  outline: none;
}
.click-overlay {
  position: absolute;
  inset: 0;
  pointer-events: all;
  cursor: text;
}
</style>
