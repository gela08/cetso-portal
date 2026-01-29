import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // This silences the warning you saw in your terminal
    chunkSizeWarningLimit: 1600, 
  },
})