<template>
  <div class="app-root">
    <NuxtPage />
  </div>
</template>

<style>
/* ── リセット ─────────────────────────── */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
html, body {
  width: 100%;
  height: 100%;
  background: #0a001a;
  color: #fff;
  font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic Pro', 'MS Gothic', sans-serif;
  overflow: hidden;
  user-select: none;
  -webkit-font-smoothing: antialiased;
}

/* ── CSS 変数 ──────────────────────────── */
:root {
  --color-bg:        #0a001a;
  --color-surface:   rgba(18, 0, 38, 0.88);
  --color-border:    rgba(160, 80, 255, 0.28);
  --color-primary:   #ffd700;
  --color-tsukasa:   #ff69b4;
  --color-text:      #ffffff;
  --color-text-dim:  #aaaaaa;
  --font-mono:       'Share Tech Mono', 'Consolas', monospace;
}

/* ── ルートコンテナ ─────────────────────── */
.app-root {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse at 30% 20%, #220040 0%, #0a001a 55%, #000008 100%);
  overflow: hidden;
}

/* ── ページ共通トランジション ───────────── */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.25s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}

/* ── ボタン共通スタイル ─────────────────── */
button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  outline: none;
}
button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}
</style>
