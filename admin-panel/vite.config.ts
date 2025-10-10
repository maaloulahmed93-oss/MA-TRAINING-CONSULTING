import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 8536,
    host: true,
    open: false,
    allowedHosts: ['.vercel.app', '.onrender.com', 'localhost', '127.0.0.1'],
    hmr: {
      overlay: true
    },
    // Only use proxy in development
    proxy: process.env.NODE_ENV !== 'production' ? {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => {
          console.log('🔄 Proxy rewrite:', path);
          return path;
        }
      }
    } : undefined
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
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: [
      'ma-training-consulting.onrender.com',
      'admine-lake.vercel.app',
      '.vercel.app',
      '.onrender.com',
      'localhost',
      '127.0.0.1'
    ]
  }
})
