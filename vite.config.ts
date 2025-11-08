import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repo = 'differential_rl_webpage'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: `/${repo}/`,
})
