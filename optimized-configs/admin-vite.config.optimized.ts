import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'

// Optimized Vite configuration for Admin Panel
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';
  
  return {
    plugins: [react()],
    
    // Server configuration
    server: {
      host: true,
      port: 8536,
      cors: true,
      allowedHosts: [
        '*',
        'admine-lake.vercel.app',
        'matc-admin.vercel.app',
        'localhost',
        '127.0.0.1'
      ],
      // Proxy for development - only in development mode
      proxy: isDevelopment ? {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
          ws: true
        }
      } : undefined
    },
    
    // Preview configuration
    preview: {
      allowedHosts: [
        '*',
        'admine-lake.vercel.app',
        'matc-admin.vercel.app'
      ],
      host: '0.0.0.0',
      port: 4173,
      strictPort: false
    },
    
    // Global definitions
    define: {
      __ALLOW_ALL_HOSTS__: JSON.stringify(true),
      __APP_VERSION__: JSON.stringify(env.npm_package_version || '1.0.0'),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString())
    },
    
    // Build optimization
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: 'terser',
      target: 'es2015',
      
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor dependencies
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            // UI libraries specific to admin panel
            ui: ['@headlessui/react', '@heroicons/react'],
            utils: ['framer-motion', 'lucide-react']
          },
          // Optimized file naming
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
        }
      },
      
      // Chunk size warning limit
      chunkSizeWarningLimit: 1000
    },
    
    // Dependency optimization
    optimizeDeps: {
      include: [
        '@headlessui/react',
        '@heroicons/react',
        'react',
        'react-dom',
        'react-router-dom',
        'framer-motion',
        'lucide-react'
      ]
    },
    
    // CSS configuration
    css: {
      postcss: {
        plugins: [
          autoprefixer,
          tailwindcss
        ]
      },
      devSourcemap: !isProduction
    },
    
    // Asset handling
    assetsInclude: ['**/*.woff', '**/*.woff2', '**/*.ttf', '**/*.otf'],
    
    // ESBuild configuration
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : []
    }
  };
});
