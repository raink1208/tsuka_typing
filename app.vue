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
  background: #0e0b04;
  color: #d8cda0;
  font-family: 'Noto Serif JP', 'Hiragino Mincho Pro', 'Yu Mincho', serif;
  overflow: hidden;
  user-select: none;
  -webkit-font-smoothing: antialiased;
}

/* ── CSS 変数 ──────────────────────────── */
:root {
  /* Legacy names kept, values updated */
  --color-bg:        #0e0b04;
  --color-surface:   rgba(26, 18, 8, 0.92);
  --color-border:    rgba(90, 60, 20, 0.5);
  --color-primary:   #c8a028;
  --color-tsukasa:   #9060c0;
  --color-text:      #d8cda0;
  --color-text-dim:  #8a7a5a;
  --font-mono:       'Share Tech Mono', 'Consolas', monospace;

  /* Fantasy RPG design tokens */
  --rpg-bg:           #0e0b04;
  --rpg-surface:      #1a1208;
  --rpg-panel:        #1e160a;
  --rpg-border:       #4a3218;
  --rpg-border-gold:  #7a5c28;
  --rpg-gold:         #c8a028;
  --rpg-gold-bright:  #e8c85a;
  --rpg-gold-dim:     #7a6018;
  --rpg-crimson:      #8b1a1a;
  --rpg-crimson-lt:   #c44030;
  --rpg-emerald:      #2e6644;
  --rpg-emerald-lt:   #48a068;
  --rpg-violet:       #5a2c7a;
  --rpg-violet-lt:    #9060c0;
  --rpg-parchment:    #d8cda0;
  --rpg-parchment-dim:#8a7a5a;
  --rpg-ink:          #f0e8c8;
}

/* ── ルートコンテナ ─────────────────────── */
.app-root {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(ellipse at 15% 85%, rgba(100,40,10,0.30) 0%, transparent 45%),
    radial-gradient(ellipse at 85% 15%, rgba(70,25,90,0.20) 0%, transparent 45%),
    linear-gradient(160deg, #120e06 0%, #0e0b04 55%, #090704 100%);
  overflow: hidden;
}

/* ── ページ共通トランジション ───────────── */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease;
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
  outline: 2px solid var(--rpg-gold);
  outline-offset: 3px;
}
</style>
