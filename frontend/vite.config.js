import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Force Vite to use rollup's JS version instead of native binary
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // This ensures rollup-loads the fallback JS implementation
      externalNativeModule: true
    }
  }
})
