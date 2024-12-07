import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [
    angular()
  ],
  build: {
    target: 'es2020',
  },
  optimizeDeps: {
    include: ['chart.js']
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
