import path from 'path';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {visualizer} from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  base: '/project2/',
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  server: {
    host: true,
    allowedHosts: [
      'tcdux-129-241-236-87.a.free.pinggy.link',
      'localhost',
      '127.0.0.1',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@features': path.resolve(__dirname, './src/features'),
      '@ui': path.resolve(__dirname, './src/ui'),
      '@components': path.resolve(__dirname, './src/components'),
      '@lib': path.resolve(__dirname, './src/lib'),
    },
  },
  optimizeDeps: {
    include: ['@apollo/client'],
  },
});
