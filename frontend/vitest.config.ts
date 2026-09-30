import { defineConfig } from 'vitest/config'

export default defineConfig({
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('http://localhost:5000/api'),
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    testTimeout: 15000,
    restoreMocks: true,
    clearMocks: true,
  },
})
