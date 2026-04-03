import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const SHEET_ID = '1AKDObiI1KD9V32DCCMqaYR_sKCsg3YVreza9_N9JuUo'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/sheet-q1': {
        target: 'https://docs.google.com',
        changeOrigin: true,
        rewrite: () => `/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`,
      },
      '/sheet-q2': {
        target: 'https://docs.google.com',
        changeOrigin: true,
        rewrite: () => `/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=117404340`,
      },
      '/sheet-q2-daily': {
        target: 'https://docs.google.com',
        changeOrigin: true,
        rewrite: () => `/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=1887540425`,
      },
    },
  },
})
