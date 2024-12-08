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
    include: [
      'chart.js',
      'chartjs-adapter-date-fns',
      'date-fns'
    ]
  },
  ssr: {
    optimizeDeps: {
      include: [
        'chart.js',
        'chartjs-adapter-date-fns',
        'date-fns'
      ]
    }
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
