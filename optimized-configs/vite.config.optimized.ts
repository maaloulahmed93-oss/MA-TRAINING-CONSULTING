import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';

// Optimized Vite configuration for production deployment
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  
  return {
    plugins: [react()],
    base: '/',
    
    // Server configuration for development
    server: {
      port: 5173,
      host: true,
      open: false,
      cors: true,
      allowedHosts: [
        'matrainingconsulting.vercel.app',
        'ma-training-consulting.vercel.app',
        'localhost',
        '127.0.0.1'
      ]
    },
    
    // Build optimization
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false, // Disable for production
      minify: 'terser',
      target: 'es2015',
      
      // Rollup options for code splitting
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks for better caching
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['framer-motion', 'lucide-react'],
            icons: ['@heroicons/react', 'react-icons']
          },
          // Asset naming for better caching
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
        }
      },
      
      // Chunk size warnings
      chunkSizeWarningLimit: 1000
    },
    
    // Dependency optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'framer-motion',
        'lucide-react'
      ],
      exclude: ['@emotion/is-prop-valid']
    },
    
    // Preview configuration for production testing
    preview: {
      host: '0.0.0.0',
      port: 4173,
      strictPort: false,
      allowedHosts: [
        'matrainingconsulting.vercel.app',
        'ma-training-consulting.vercel.app',
        'localhost',
        '127.0.0.1'
      ]
    },
    
    // Environment variables
    define: {
      __APP_VERSION__: JSON.stringify(env.npm_package_version || '1.0.0'),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString())
    },
    
    // CSS configuration
    css: {
      postcss: {
        plugins: [
          autoprefixer,
          tailwindcss
        ]
      },
      devSourcemap: !isProduction // Disable CSS sourcemaps in production
    },
    
    // Asset handling
    assetsInclude: ['**/*.woff', '**/*.woff2', '**/*.ttf', '**/*.otf'],
    
    // Performance optimizations
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : []
    }
  };
});
