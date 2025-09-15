// Correcto
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    allowedHosts: [
      '2c07ffe7cc33.ngrok-free.app', // Elimina 'https://'
      'localhost', // Es buena práctica incluirlo
    ],
  },
})
