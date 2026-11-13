import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default defineConfig({
  // vite 8 (rolldown) ↔ vitest 3 (rollup) plugin type mismatch is a known upstream issue — runtime-safe
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: [react() as any, tailwindcss() as any],
  resolve: { alias: { '@': `${import.meta.dirname}/src` } },
  test: {
    exclude: ['**/node_modules/**', '**/e2e/**'],
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
