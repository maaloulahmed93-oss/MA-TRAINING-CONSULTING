import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Ultra-safe Vite configuration - Nuclear Fix
export default defineConfig({
  plugins: [react()],
  
  server: {
    port: 8536,
    host: true
  },
  
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: false, // NO MINIFICATION
    target: 'es2020',
    rollupOptions: {
      output: {
        // Single chunk to prevent initialization issues
        manualChunks: () => 'index',
        entryFileNames: 'assets/js/[name].js',
        chunkFileNames: 'assets/js/[name].js',
        assetFileNames: 'assets/[ext]/[name].[ext]'
      }
    }
  },
  
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env.VITE_API_BASE_URL': '"https://matc-backend.onrender.com/api"'
  }
});
