import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Development server configuration
  server: {
    port: 5173,
    open: false,
    hmr: {
      overlay: true,
    },
  },
  
  // Build configuration
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate React and React-DOM into their own chunk
          react: ['react', 'react-dom'],
          // Future: React Flow will go into its own chunk
          // 'react-flow': ['@xyflow/react', '@xyflow/core'],
        },
      },
    },
    // Optimize for modern browsers
    cssCodeSplit: true,
  },
  
  // Path resolution for cleaner imports
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@types': fileURLToPath(new URL('./src/types', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@services': fileURLToPath(new URL('./src/services', import.meta.url)),
      '@constants': fileURLToPath(new URL('./src/constants', import.meta.url)),
      '@canvas': fileURLToPath(new URL('./src/features/canvas', import.meta.url)),
      '@palette': fileURLToPath(new URL('./src/features/palette', import.meta.url)),
      '@inspector': fileURLToPath(new URL('./src/features/inspector', import.meta.url)),
      '@validation': fileURLToPath(new URL('./src/features/validation', import.meta.url)),
      '@export': fileURLToPath(new URL('./src/features/export', import.meta.url)),
    },
  },
  
  // Asset optimization
  assetsInclude: ['**/*.puml', '**/*.plantuml'],
  
  // Define global constants
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  
  // Optimized dependency pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
    ],
    // Future React Flow optimization
    // 'react-flow-renderer',
    // '@xyflow/react',
  },
})
