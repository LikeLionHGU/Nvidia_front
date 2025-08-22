// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Reverse Geocode
      '/map-reversegeocode': {
        target: 'https://naveropenapi.apigw.ntruss.com',
        changeOrigin: true,
        secure: true, // ntruss는 정상 cert, true로 둬도 OK
      },

      // Naver Search API
      '/api': {
        target: 'https://openapi.naver.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true,
      },

      // 3) 백엔드(Spring) — janghong.asia
      //    프리픽스는 /spaceon 으로 두고, 요청에서 /spaceon을 제거해 백엔드로 프록시
      '/spaceon': {
        target: 'http://janghong.asia',   // 서버가 https면 이걸로, http면 http로 변경
        changeOrigin: true,
        secure: true,                      // self-signed면 false, 정식 인증서면 true
        rewrite: (path) => path.replace(/^\/spaceon/, ''),
      },
    },
  },
  optimizeDeps: {
    exclude: ['date-fns'],
  },
})
