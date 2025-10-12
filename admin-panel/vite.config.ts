import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Production-safe Vite configuration
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
    
    // Build optimization for production safety
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: isProduction ? 'esbuild' : false, // Use esbuild instead of terser
      target: 'es2018', // Updated target for better compatibility
      
      rollupOptions: {
        output: {
          // Simplified chunk naming to avoid initialization issues
          manualChunks: undefined,
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
        }
      }
    },
    
    // Enhanced dependency optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom'
      ],
      // Force pre-bundling to avoid runtime issues
      force: isProduction
    },
    
    // CSS configuration
    css: {
      postcss: './postcss.config.js',
      devSourcemap: !isProduction
    },
    
    // ESBuild configuration - safer settings
    esbuild: {
      // Don't drop console/debugger in production to avoid variable reference issues
      drop: [],
      // Ensure proper variable hoisting
      keepNames: true
    },
    
    // Define global constants to prevent undefined variables
    define: {
      __DEV__: !isProduction,
      'process.env.NODE_ENV': JSON.stringify(mode)
    }
  };
});
