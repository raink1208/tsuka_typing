// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxtjs/i18n'],
  i18n: {
    // 現在は日本語のみ。多言語追加時は locales に code/file を追加する
    locales: [
      { code: 'ja', language: 'ja-JP', name: '日本語', file: 'ja.json' },
    ],
    defaultLocale: 'ja',
    strategy: 'no_prefix',
  },
  runtimeConfig: {
    public: {
      // typing_backend の API ベースURL（環境変数 NUXT_PUBLIC_API_BASE で上書き可能）
      apiBase: 'http://localhost:3001',
    },
  },
  app: {
    head: {
      // title / description は app.vue 側で useI18n() を使って動的に設定する
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: ''
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cinzel+Decorative:wght@700;900&family=Noto+Serif+JP:wght@400;700;900&family=Share+Tech+Mono&display=swap'
        }
      ]
    }
  },
})
