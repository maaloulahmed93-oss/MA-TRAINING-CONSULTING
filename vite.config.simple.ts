import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Simplified Vite configuration to avoid initialization issues
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    plugins: [react()],
    base: '/',
    
    // Server configuration for development
    server: {
      port: 5173,
      host: true,
      open: false,
      cors: true
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
    
    // Preview configuration for production testing
    preview: {
      host: '0.0.0.0',
      port: 4173,
      strictPort: false
    },
    
    // Environment variables
    define: {
      __APP_VERSION__: JSON.stringify('1.0.0'),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString())
    },
    
    // CSS configuration
    css: {
      postcss: './postcss.config.js',
      devSourcemap: !isProduction
    },
    
    // Asset handling
    assetsInclude: ['**/*.woff', '**/*.woff2', '**/*.ttf', '**/*.otf'],
    
    // Performance optimizations
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : []
    }
  };
});
