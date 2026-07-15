import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  
  base: "/", // 🔥 السطر المهم
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('gsap')) return 'gsap-vendor';
            if (id.includes('swiper')) return 'swiper-vendor';
            if (id.includes('firebase')) return 'firebase-vendor';
            if (id.includes('framer-motion')) return 'framer-motion-vendor';
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'react-vendor';
            return 'vendor';
          }
        },
      },
    },
  },
})