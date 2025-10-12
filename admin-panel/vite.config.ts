import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Ultra-safe production configuration to prevent variable initialization errors
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    plugins: [
      react()
    ],
    
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
    
    // Ultra-safe build configuration
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      // Disable minification completely to prevent variable mangling
      minify: false,
      target: 'es2020',
      
      rollupOptions: {
        // Completely disable code splitting to prevent initialization issues
        output: {
          manualChunks: () => 'index',
          chunkFileNames: 'assets/js/[name].js',
          entryFileNames: 'assets/js/[name].js',
          assetFileNames: 'assets/[ext]/[name].[ext]',
          // Preserve variable names and structure
          compact: false,
          minifyInternalExports: false
        },
        // Preserve all external dependencies
        external: [],
        // Disable tree shaking that might cause variable issues
        treeshake: false
      }
    },
    
    // Strict dependency optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom'
      ],
      // Don't force pre-bundling in production
      force: false,
      // Disable dependency optimization in production
      disabled: isProduction
    },
    
    // CSS configuration
    css: {
      postcss: './postcss.config.js',
      devSourcemap: false
    },
    
    // Disable ESBuild transformations that might cause issues
    esbuild: isProduction ? false : {
      drop: [],
      keepNames: true
    },
    
    // Define minimal globals
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode)
    }
  };
});
