import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['*', 'ma-training-consulting.onrender.com', 'localhost', '127.0.0.1'],
    proxy: process.env.NODE_ENV !== 'production'
      ? { '/api': { target: 'http://localhost:3001', changeOrigin: true } }
      : undefined
  },
  preview: {
    allowedHosts: ['*', 'ma-training-consulting.onrender.com'],
    host: '0.0.0.0',
    port: 4173,
    strictPort: false
  },
  define: {
    __ALLOW_ALL_HOSTS__: JSON.stringify(true)
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@headlessui/react', '@heroicons/react']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['@headlessui/react', '@heroicons/react']
  }
})
