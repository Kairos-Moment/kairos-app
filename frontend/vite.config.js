import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // String shorthand for simple cases: '/foo' -> 'http://localhost:4567/foo'
      // With options if you need to rewrite the path
      '/api': {
        target: 'http://localhost:5001', // Your backend server
        changeOrigin: true, // Needed for virtual hosted sites
        secure: false,      // Set to false if your backend is not running on HTTPS
        rewrite: (path) => path.replace(/^\/api/, ''), // Remove /api prefix when forwarding
      },
    },
  },
})