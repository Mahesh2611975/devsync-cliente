import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dns from 'dns';

// Force Node to resolve localhost to 127.0.0.1 instead of ::1
dns.setDefaultResultOrder('ipv4first');

export default defineConfig({
  plugins: [react()],

  // FIX: Define global as window for sockjs-client compatibility
  define: {
    global: 'window',
  },

  server: {
    host: true,
    port: 5173,

    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});