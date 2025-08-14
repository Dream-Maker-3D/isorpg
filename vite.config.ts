import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})

