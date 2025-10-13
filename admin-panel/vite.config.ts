import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Ultra-safe Vite configuration to prevent minification issues
export default defineConfig({
  plugins: [react()],
  
  // Development server
  server: {
    port: 8536,
    host: true
  },
  
  // Build configuration - NO MINIFICATION to prevent variable issues
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: false, // DISABLE minification to prevent 'Sv' error
    target: 'es2020',
    rollupOptions: {
      output: {
        // Prevent code splitting that causes initialization issues
        manualChunks: undefined,
        // Keep variable names intact
        compact: false
      }
    }
  },
  
  // Environment variables
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});
