import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      formats: ['es', 'cjs'],
      entry: 'src/index.ts',
      name: 'math',
      fileName: 'math'
    }
  },
  plugins: [dts({})]
});
