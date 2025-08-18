import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/map-reversegeocode': {
        target: 'https://naveropenapi.apigw.ntruss.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/map-reversegeocode/, ''),
        secure: false,
      },
      '/v1': {
        target: 'https://openapi.naver.com',
        changeOrigin: true,
        secure: false,
      },
    }
  },
  optimizeDeps: {
    exclude: ['date-fns'],
  },
})