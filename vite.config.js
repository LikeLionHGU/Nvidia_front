import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // ✅ 기존 리버스지오코드
      '/map-reversegeocode': {
        target: 'https://naveropenapi.apigw.ntruss.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/map-reversegeocode/, ''),
        secure: false,
      },

      // 추가: Naver Search API
      '/api': {
        target: 'https://openapi.naver.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // /api/v1/... -> /v1/...
        secure: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ['date-fns'],
  },
})