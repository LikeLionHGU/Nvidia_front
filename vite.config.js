// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    proxy: {
      // Reverse Geocode
      '/map-reversegeocode': {
        target: 'https://naveropenapi.apigw.ntruss.com',
        changeOrigin: true,
        secure: true, // ntruss는 정상 cert, true로 둬도 OK
      },

      // Naver Search API
      // 로컬 개발에서만 Vercel 로컬 함수로 우회
      //    vercel dev가 3000 포트에서 /api/* 제공
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // rewrite 금지: /api 경로 그대로 유지해야 함수 매칭됨
      },


    },
  },
  optimizeDeps: {
    exclude: ['date-fns'],
  },
})
