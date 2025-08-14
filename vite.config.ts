import { defineConfig } from 'vite';

export default defineConfig({
  // Development server configuration
  server: {
    port: 5173,
    host: true,
    open: true
  },

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  },

  // Resolve path aliases
  resolve: {
    alias: {
      '@domain': '/src/domain',
      '@patterns': '/src/patterns',
      '@gameKernel': '/src/gameKernel',
      '@ui': '/src/ui',
      '@infra': '/src/infra',
      '@tests': '/src/tests'
    }
  },

  // Test configuration
  test: {
    globals: true,
    environment: 'jsdom'
  }
});

