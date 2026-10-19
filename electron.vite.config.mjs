import { defineConfig } from 'electron-vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    publicDir: 'src/pdf',
    plugins: [
      tailwindcss()
    ]    
  }
})
