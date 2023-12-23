// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxt/ui', 'nuxt-icon', '@nuxtjs/supabase'],
  app: {
	  pageTransition: { name: 'page', mode: 'out-in' },
	  layoutTransition: { name: 'page', mode: 'out-in' },
	  head: {
		htmlAttrs: {
		  lang: 'ru',
		},
	  },
  },
  css: [
	  "assets/global.scss"
  ],
  supabase: {
	  redirect: false
  }
})