/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { Plugin as importToCDN } from "vite-plugin-cdn-import";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/lib/index.ts'),
      name: 'ClientDetector',
      fileName: 'client-detector'
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'client-detector'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'client-detector': 'ClientDetector'
        }
      }
    }
  },
  test: {

  },
  plugins: [
    react(),
    // importToCDN({
    //   modules: [
    //     {
    //         name: '@easycode/client-detector',
    //         var: 'ClientDetector',
    //         path: './dist/client-detector.umd.cjs'
    //     },
    //   ],
    // }),
    dts({
      outDir: ['dist/types'],
      include: ['src/**/*.tsx', 'src/**/*.ts']
    })
  ],
  server: {
    host: true,
    proxy: {
      '/api/v1': {
        target: 'http://127.0.0.1:10019',
        changeOrigin: true,
        secure: false,
        rewrite: path => {
          console.log(path);
          return path.replace('^', '');
        },
      }
    }
  },
})
