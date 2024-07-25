import { svelte } from '@sveltejs/vite-plugin-svelte';
import wordpressShortcode from '@tkvw/vite-plugin-wordpress-shortcode';

import { defineConfig } from 'vite';

import { shortcode } from './src/constants';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/my/shop',
  plugins: [
    svelte(),
    wordpressShortcode({
      shortcode,
      entry: 'src/wordpress.ts'
    })
  ]
});
