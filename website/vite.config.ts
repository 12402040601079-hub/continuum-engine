import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: path.resolve(import.meta.dirname, '../backend/app/static/marketing'),
    emptyOutDir: true,
  }
})

