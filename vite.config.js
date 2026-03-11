import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true, // avoids ENOSPC when inotify limit is reached (e.g. large workspace)
    },
  },
})
