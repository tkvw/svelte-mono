import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import wordpressShortcode from "@tkvw/vite-plugin-wordpress-shortcode"
// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  build:{
    minify: false
  },
  plugins: [svelte(),wordpressShortcode({
    shortcode: "tkvw-app",
    shadowDom: true,
  })],
})
