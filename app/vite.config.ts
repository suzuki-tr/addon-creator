import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': `${import.meta.dirname}/src` } },
  test: {
    exclude: ['**/node_modules/**', '**/e2e/**'],
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
