// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // ✅ Reverse Geocode: rewrite 제거!
      '/map-reversegeocode': {
        target: 'https://naveropenapi.apigw.ntruss.com',
        changeOrigin: true,
        // ❌ rewrite: (path) => path.replace(/^\/map-reversegeocode/, ''),  // 지우세요
        secure: true, // ntruss는 정상 cert, true로 둬도 OK
      },

      // ✅ Naver Search API (그대로)
      '/api': {
        target: 'https://openapi.naver.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ['date-fns'],
  },
})