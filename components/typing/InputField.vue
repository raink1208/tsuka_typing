<template>
  <div class="input-field">
    <input
      ref="el"
      class="ghost-input"
      @keydown="onKeydown"
      @compositionstart="cancelComposition"
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

/**
 * IME が起動した場合は即座に blur → focus してキャンセルする。
 * これにより日本語変換 UI が表示されるのを防ぐ。
 */
function cancelComposition() {
  if (el.value) {
    el.value.value = ''
    el.value.blur()
    nextTick(() => el.value?.focus())
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.isComposing) return
  if (e.ctrlKey || e.altKey || e.metaKey) return

  // e.code でキー判定（日本語 IME が e.key を "Process" に書き換えることがある）
  if (e.code?.startsWith('Key')) {
    e.preventDefault()
    emit('char', e.code.slice(3).toLowerCase())
    return
  }
  // 記号・伸ばし棒に対応するキー
  if (/^[-!?,./]$/.test(e.key)) {
    e.preventDefault()
    emit('char', e.key)
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
  /* 日本語 IME を無効化（非標準だが主要ブラウザで有効） */
  ime-mode: disabled;
}
.click-overlay {
  position: absolute;
  inset: 0;
  pointer-events: all;
  cursor: text;
}
</style>