import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // base: '/Nvidia_front/' 배포는 나중에 하자..
  server: {
    proxy: {
      '/map-reversegeocode': {
        target: 'https://naveropenapi.apigw.ntruss.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/map-reversegeocode/, ''),
        secure: false,
      },
    }
  }
})

