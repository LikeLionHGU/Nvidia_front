// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    proxy: {
      // 1) NCP Reverse Geocode (직접 호출)
      '/map-reversegeocode': {
        target: 'https://naveropenapi.apigw.ntruss.com',
        changeOrigin: true,
        secure: true,
      },
      // 3) 백엔드(Spring) — janghong.asia
      //    프리픽스는 /api/spaceon 으로 두고, 요청에서 /api/spaceon을 제거해 백엔드로 프록시
      '/api/spaceon': {
        target: 'http://janghong.asia',   // 서버가 https면 이걸로, http면 http로 변경
        changeOrigin: true,
        secure: false,                      // http 통신이므로 false로 설정
        rewrite: (path) => path.replace(/^\/api\/spaceon/, ''),
      },
    },
  },
  optimizeDeps: {
    exclude: ['date-fns'],
  },
});