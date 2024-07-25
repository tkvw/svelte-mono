import { startDevelopment } from '@tkvw/vite-plugin-wordpress-shortcode/client';

import './app.css';
import App from './App.svelte';
import { shortcode } from './constants';

// This can be started inside a wordpress page
// or from within dev mode build
export default startDevelopment(
  shortcode,
  ({ attributes = {}, contents }) =>
    new App({
      target: document.getElementById('app')!,
      props: {
        ...attributes,
        contents,
        shortcode
      }
    })
);
