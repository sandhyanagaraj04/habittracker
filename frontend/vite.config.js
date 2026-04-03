import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/sheet-data': {
        target: 'https://docs.google.com',
        changeOrigin: true,
        rewrite: () =>
          '/spreadsheets/d/1AKDObiI1KD9V32DCCMqaYR_sKCsg3YVreza9_N9JuUo/export?format=csv',
      },
    },
  },
})
