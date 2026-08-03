import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// CSR 纯静态构建产物，可部署到 EdgeOne Makers / CF Pages / Azure Static Web Apps
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 5173,
  },
})
