import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    fs: {
      // Allow importing fixtures and core TS from the repo root.
      allow: ['..']
    }
  }
});
