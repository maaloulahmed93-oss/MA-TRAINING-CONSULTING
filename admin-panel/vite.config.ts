import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Simple and reliable Vite configuration for Vercel deployment
export default defineConfig({
  plugins: [react()],
  
  // Development server
  server: {
    port: 8536,
    host: true
  },
  
  // Build configuration - Simple and reliable
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    target: 'es2015'
  },
  
  // Environment variables
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});
