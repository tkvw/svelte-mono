import { startProduction } from '@tkvw/vite-plugin-wordpress-shortcode/client';
import './app.css';
import App from './App.svelte';

export default startProduction(
  ({ target, ...props }) =>
    new App({
      target,
      props
    })
);
