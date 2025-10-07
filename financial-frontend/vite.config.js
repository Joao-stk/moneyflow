import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  // ⬇️ ADICIONE ESTAS CONFIGURAÇÕES PARA PRODUÇÃO ⬇️
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: './index.html'
    }
  },
  // ⬇️ CONFIGURAÇÃO SPA - ESSENCIAL! ⬇️
  base: './',
  esbuild: {
    loader: 'jsx',
  },
  publicDir: 'public'
})