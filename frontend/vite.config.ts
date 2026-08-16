import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const senderEmail = loadEnv(mode, '..', 'Email__SenderEmail').Email__SenderEmail
  if (!senderEmail) throw new Error('Email__SenderEmail must be configured in the root .env file.')

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_CONTACT_EMAIL': JSON.stringify(senderEmail),
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:5237',
          changeOrigin: true,
        },
      },
    },
  }
})
