import { defineConfig } from 'vite';

// Builds one ES-module entry (cine.js + cine.css) with stable file names into ../assets/cine/,
// so the static pages (and GitHub Pages) can load it with a plain <script type="module">.
export default defineConfig({
  base: './',
  build: {
    outDir: '../assets/cine',
    emptyOutDir: true,
    target: 'es2020',
    cssCodeSplit: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      input: 'src/cine.ts',
      output: {
        entryFileNames: 'cine.js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: 'cine.[ext]',
        // Shared state lives in its own chunk: if chunks imported the entry file, a "?v=" query on the
        // <script> URL would make the browser load and run the entry a second time.
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('node_modules/gsap') || id.includes('node_modules/lenis')) return 'gsap';
          if (id.includes('/src/state/') || id.includes('/src/engine/quality') || id.includes('/src/engine/capsuleData')) return 'shared';
        },
      },
    },
  },
});
