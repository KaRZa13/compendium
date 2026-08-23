// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    '@nuxt/image',
    '@nuxt/eslint',
    '@nuxtjs/i18n'
  ],
  css: ['@/assets/css/main.css'],
  ssr: false,
    devServer: {
    host: '0',
  },
  vite: {
    clearScreen: false,
    // https://v2.tauri.app/reference/environment-variables/
    envPrefix: ['NUXT_', 'TAURI_'],
    server: {
      strictPort: true,
    },
  },
  ignore: ['**/src-tauri/**'],
  i18n: {
    locales: [
      { code: 'fr', name: 'Français', file: 'fr.json' },
      { code: 'en', name: 'English', file: 'en.json' }
    ],
    langDir: 'locales/',
    defaultLocale: 'en',
    // detectBrowserLanguage: false,
    vueI18n: './i18n/i18n.config.ts',
  }
})