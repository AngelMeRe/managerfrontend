import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,           // opcional, ver Opción B
    strictPort: false,    // permite elegir otro si 5173 está ocupado
    proxy: {
      '/api': {
        target: 'https://managerapi-8zyq.onrender.com',
        changeOrigin: true,
        secure: true,
        rewrite: path => path, // conserva /api
      },
    },
  },
});