// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    // https://supabase.nuxtjs.org/
    "@nuxtjs/supabase",
    // https://eslint.nuxt.com/packages/module
    "@nuxt/eslint",
  ],
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirect: false,
  },
});
