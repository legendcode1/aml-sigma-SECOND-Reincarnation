// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import inject from '@rollup/plugin-inject';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    // Polyfill Node.js globals
    NodeGlobalsPolyfillPlugin({
      process: true,
      buffer: true,
    }),
    // Polyfill Node.js modules
    NodeModulesPolyfillPlugin(),
    // Inject globals
    inject({
      global: 'globalThis',
      process: 'process/browser',
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
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis', // Polyfill `global`
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
      ],
    },
  },
  build: {
    sourcemap: true, // Enable source maps for debugging
  },
});
