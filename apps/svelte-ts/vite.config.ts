import { svelte } from '@sveltejs/vite-plugin-svelte';

import { defineConfig } from 'vite';


// https://vitejs.dev/config/
export default defineConfig({
  base: '/my/shop',
  plugins: [svelte()]
});
