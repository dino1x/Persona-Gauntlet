import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 4180,
    host: true,
  },
  build: {
    sourcemap: false,
    target: 'es2022',
  },
});
