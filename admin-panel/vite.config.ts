import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 8536,
    host: '0.0.0.0',
    open: false,
    hmr: {
      overlay: true
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => {
          console.log('🔄 Proxy rewrite:', path);
          return path;
        }
      }
    }
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
      'localhost',
      '127.0.0.1',
      '.vercel.app'
    ]
  }
})
