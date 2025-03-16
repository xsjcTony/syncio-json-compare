import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'


export default defineConfig({
  // vite configurations
  plugins: [
    tsconfigPaths(),
  ],

  // vitest configurations
  test: {
    include: ['src/__tests__/**/*.test.ts'],
    retry: 0,
  },
})
