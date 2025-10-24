import path from 'path';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  base: '/project2/',
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [
      'xbjul-2001-700-302-11--16b.a.free.pinggy.link',
      'localhost',
      '127.0.0.1'
    ]
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
