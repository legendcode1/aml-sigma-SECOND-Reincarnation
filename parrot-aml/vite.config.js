// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import inject from '@rollup/plugin-inject';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    inject({
      global: 'globalThis',
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
      util: 'util',
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      fs: path.resolve(__dirname, 'node_modules/browserify-fs'),
    },
  },
  define: {
    global: 'globalThis',
  },
  build: {
    sourcemap: true, // Enable source maps for debugging
  },
});
