// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@vite-pwa/nuxt'],
  devServer: {
    port: 3000
  },
  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI,
    mongodbDbName: process.env.MONGODB_DB_NAME,
    adminSecret: process.env.ADMIN_SECRET,
    sessionSecret: process.env.SESSION_SECRET,
    public: {
      appName: 'Flow Services'
    }
  },
  typescript: {
    strict: true,
    typeCheck: false
  },
  css: ['~/assets/css/main.css'],
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Flow Services',
      short_name: 'Flow Services',
      description: 'Registro de frequência, louvores e participantes dos cultos.',
      lang: 'pt-BR',
      theme_color: '#087f5b',
      background_color: '#f3f8f5',
      display: 'standalone',
      start_url: '/cultos',
      scope: '/',
      icons: [
        {
          src: '/icons/flow-services-192.svg',
          sizes: '192x192',
          type: 'image/svg+xml',
          purpose: 'any maskable'
        },
        {
          src: '/icons/flow-services-512.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'any maskable'
        }
      ]
    },
    generateSW: {
      navigateFallback: null,
      runtimeCaching: []
    },
    devOptions: {
      enabled: true
    }
  },
  routeRules: {
    '/**': {
      headers: {
        'x-content-type-options': 'nosniff',
        'referrer-policy': 'strict-origin-when-cross-origin',
        'x-frame-options': 'SAMEORIGIN',
        'permissions-policy': 'camera=(), microphone=(), geolocation=()'
      }
    },
    '/api/**': {
      headers: {
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'referrer-policy': 'no-referrer'
      }
    }
  }
})
