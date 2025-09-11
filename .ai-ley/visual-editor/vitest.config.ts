/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    typecheck: {
      include: ['**/*.{test,spec}.{js,ts,tsx}']
    },
    css: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/**/*.d.ts',
        'src/vite-env.d.ts',
        'dist/',
        '.vscode/',
        '.husky/',
        'eslint.config.js',
        'vite.config.ts',
        'vitest.config.ts',
        'tailwind.config.ts',
        'postcss.config.js',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@features': path.resolve(__dirname, './src/features'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@canvas': path.resolve(__dirname, './src/features/canvas'),
      '@palette': path.resolve(__dirname, './src/features/palette'),
      '@inspector': path.resolve(__dirname, './src/features/inspector'),
      '@validation': path.resolve(__dirname, './src/features/validation'),
      '@export': path.resolve(__dirname, './src/features/export'),
      '@ui-common': path.resolve(__dirname, './src/features/ui-common'),
      '~': path.resolve(__dirname, './src'),
    },
  },
});