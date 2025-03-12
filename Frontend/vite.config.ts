import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'


export default defineConfig({
  plugins: [
    tsconfigPaths({ loose: true }),
    tailwindcss(),
    vue(),
  ],
  envPrefix: 'SYNCIO_',
})
