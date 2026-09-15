import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom'],
          // Router
          'vendor-router': ['react-router-dom'],
          // Redux
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
          // Charts
          'vendor-charts': ['recharts'],
          // UI icons
          'vendor-icons': ['lucide-react'],
          // Date utils
          'vendor-date': ['date-fns'],
        },
      },
    },
  },
});