import { defineConfig } from 'vite'
import postcss from './postcss.config.js';
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    postcss,
  },
  plugins: [react()],
  base: './',
  server: {
    // Evitar que el file-watcher vigile artefactos de build (.zip, dist),
    // que en Windows pueden quedar bloqueados y tirar el dev server (EBUSY).
    watch: {
      ignored: ['**/*.zip', '**/dist/**'],
    },
  },
  resolve: {
    alias: [
      {
        find: /^~.+/,
        replacement: (val) => {
          return val.replace(/^~/, '');
        },
      },
    ],
  },
})
