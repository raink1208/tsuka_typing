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
  char: [key: string, timeStamp: number]
}>()

const el = ref<HTMLInputElement>()

function focus() {
  el.value?.focus()
}

function onKeydown(e: KeyboardEvent) {
  if (e.isComposing) return
  if (e.ctrlKey || e.altKey || e.metaKey) return
  // OS のキーリピート（キーを押し続けた際に自動発火する合成 keydown）は
  // 新しい打鍵ではない。リピート間隔は OS 設定次第で 30ms を大きく下回ることが
  // あり、除外しないと通常プレイでもサーバー側の INTERVAL_TOO_SHORT を
  // 誤検知してしまう。ゲームロジック側にも二重入力として渡さないよう、
  // ここで完全に無視する。
  if (e.repeat) {
    e.preventDefault()
    return
  }

  if (/^[a-z]$/i.test(e.key)) {
    e.preventDefault()
    emit('char', e.key.toLowerCase(), e.timeStamp)
    return
  }
  // 数字キー（半角）
  if (/^[0-9]$/.test(e.key)) {
    e.preventDefault()
    emit('char', e.key, e.timeStamp)
    return
  }
  // 記号・伸ばし棒に対応するキー
  if (/^[-!?,./]$/.test(e.key)) {
    e.preventDefault()
    emit('char', e.key, e.timeStamp)
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