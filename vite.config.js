import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    rollupOptions: {
      input: '/src/main.jsx', // Asegúrate de que el punto de entrada esté definido correctamente
    },
  },
});