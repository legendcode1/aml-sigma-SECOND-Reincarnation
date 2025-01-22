import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

export default defineConfig({
  plugins: [
    react(),
    NodeGlobalsPolyfillPlugin({
      buffer: true,
      events: true,
      process: true,
      util: true
    }),
    NodeModulesPolyfillPlugin()
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://aegisllm-backend-633765957616.asia-southeast1.run.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      events: 'events',
      process: 'process/browser',
      util: 'util'
    }
  }
});import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

export default defineConfig({
  plugins: [
    react(),
    NodeGlobalsPolyfillPlugin({
      buffer: true,
      events: true,
      process: true,
      util: true
    }),
    NodeModulesPolyfillPlugin()
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://aegisllm-backend-633765957616.asia-southeast1.run.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      events: 'events',
      process: 'process/browser',
      util: 'util'
    }
  }
});