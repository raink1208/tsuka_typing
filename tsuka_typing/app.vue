<template>
  <div class="app-root">
    <main class="app-main">
      <NuxtPage />
    </main>

    <footer class="site-footer">
      <p class="site-footer-line is-primary">{{ t('footer.disclaimer') }}</p>
      <p class="site-footer-line is-secondary">{{ t('footer.copyright') }}</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const config = useRuntimeConfig()

// SNSに共有されたリンクのカード表示用（OGP / Twitter Card）
useHead({
  title: () => t('meta.title'),
  meta: [
    { name: 'description', content: () => t('meta.description') },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: () => t('meta.title') },
    { property: 'og:title', content: () => t('meta.title') },
    { property: 'og:description', content: () => t('meta.description') },
    { property: 'og:url', content: config.public.siteUrl },
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: () => t('meta.title') },
    { name: 'twitter:description', content: () => t('meta.description') },
  ],
})
</script>

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
  color: #ece2bc;
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
  --color-tsukasa:   #a878d8;
  --color-text:      #ece2bc;
  --color-text-dim:  #b7a878;
  --font-mono:       'Share Tech Mono', 'Consolas', monospace;

  /* Fantasy RPG design tokens */
  --rpg-bg:           #0e0b04;
  --rpg-surface:      #1a1208;
  --rpg-panel:        #1e160a;
  --rpg-border:       #4a3218;
  --rpg-border-gold:  #7a5c28;
  --rpg-gold:         #d4ac34;
  --rpg-gold-bright:  #f2d472;
  --rpg-gold-dim:     #b08c30;
  --rpg-crimson:      #8b1a1a;
  --rpg-crimson-lt:   #e05a48;
  --rpg-emerald:      #2e6644;
  --rpg-emerald-lt:   #5cbc80;
  --rpg-violet:       #5a2c7a;
  --rpg-violet-lt:    #a878d8;
  --rpg-parchment:    #ece2bc;
  --rpg-parchment-dim:#b7a878;
  --rpg-ink:          #f8f2da;
}

/* ── ルートコンテナ ─────────────────────── */
.app-root {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(ellipse at 15% 85%, rgba(100,40,10,0.30) 0%, transparent 45%),
    radial-gradient(ellipse at 85% 15%, rgba(70,25,90,0.20) 0%, transparent 45%),
    linear-gradient(160deg, #120e06 0%, #0e0b04 55%, #090704 100%);
  overflow: hidden;
}

/* ページ表示領域（フッターを除いた高さ） */
.app-main {
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* ── サイトフッター（非公式ファンサイト注記） ── */
.site-footer {
  flex: 0 0 auto;
  width: 100%;
  padding: 12px 20px calc(12px + env(safe-area-inset-bottom, 0px));
  text-align: center;
  background: linear-gradient(180deg, #1a1208 0%, #0b0803 100%);
  border-top: 2px solid var(--rpg-border-gold);
  box-shadow: 0 -4px 18px rgba(0, 0, 0, 0.55);
}
.site-footer-line {
  font-family: 'Noto Serif JP', serif;
  line-height: 1.8;
  letter-spacing: 0.04em;
}
/* 1行目：非公式である旨を最も見せる */
.site-footer-line.is-primary {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--rpg-gold-bright);
  text-shadow: 0 0 10px rgba(200, 160, 40, 0.28);
}
/* 2行目：権利表記 */
.site-footer-line.is-secondary {
  font-size: 0.78rem;
  color: var(--rpg-parchment-dim);
}
@media (max-width: 600px) {
  .site-footer { padding: 10px 14px calc(10px + env(safe-area-inset-bottom, 0px)); }
  .site-footer-line.is-primary   { font-size: 0.78rem; }
  .site-footer-line.is-secondary { font-size: 0.7rem; }
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