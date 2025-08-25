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

      '/spaceon': {
        target: 'https://janghong.asia', //  HTTPS로 변경
        changeOrigin: true,
        secure: true,                    //  HTTPS니까 true
        rewrite: (path) => path.replace(/^\/spaceon/, ''),
      },
    },
  },
  optimizeDeps: {
    exclude: ['date-fns'],
  },
});