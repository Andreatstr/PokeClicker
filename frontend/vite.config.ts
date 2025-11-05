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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          apollo: ['@apollo/client', 'graphql'],
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': [
            '@radix-ui/react-avatar',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-select',
            '@radix-ui/react-slot',
          ],
        },
      },
    },
  },
  server: {
    host: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      // Add any additional dev hosts here if needed
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
