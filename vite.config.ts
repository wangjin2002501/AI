import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // We removed the define block for process.env.API_KEY 
  // because the key is now only used safely on the backend (api/identify.ts)
})