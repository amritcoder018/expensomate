import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Intercept any local calls to /api and route them safely to the backend
      '/api': {
        target: 'http://localhost:5000', // Vercel's default local function port
        changeOrigin: true,
        secure: false,
      },
    },
  },
});