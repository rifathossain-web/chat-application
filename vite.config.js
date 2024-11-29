import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://airstate-server.vercel.app',
        changeOrigin: true, // Ensures the origin header is set to the target URL
        secure: true,       // Use secure connection for HTTPS
      },
    },
  },
});
