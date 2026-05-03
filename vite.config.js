import { defineConfig } from 'vite'

export default defineConfig({
  // Raiz do projeto é a pasta raiz (onde está index.html)
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        login: 'login.html',
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})
