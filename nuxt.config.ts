// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
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
  routeRules: {
    '/api/**': {
      headers: {
        'cache-control': 'no-store'
      }
    }
  }
})
