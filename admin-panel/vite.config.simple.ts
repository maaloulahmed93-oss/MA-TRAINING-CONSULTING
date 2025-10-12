import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Simplified Vite configuration to avoid initialization issues
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    plugins: [react()],
    
    // Server configuration
    server: {
      host: true,
      port: 8536,
      cors: true
    },
    
    // Preview configuration
    preview: {
      host: '0.0.0.0',
      port: 4173,
      strictPort: false
    },
    
    // Build optimization - simplified
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: isProduction ? 'terser' : false,
      target: 'es2015',
      
      // Simplified rollup options without manual chunks
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
        }
      }
    },
    
    // Dependency optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom'
      ]
    },
    
    // CSS configuration
    css: {
      postcss: './postcss.config.js',
      devSourcemap: !isProduction
    },
    
    // ESBuild configuration
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : []
    }
  };
});
