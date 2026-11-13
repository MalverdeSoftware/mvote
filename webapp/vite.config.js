import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // The demo must remain local even if this checkout has Firebase settings.
  define: mode === 'demo' ? { 'import.meta.env.VITE_USE_MOCK': JSON.stringify('true') } : {},
  test: {
    environment: 'jsdom',
    // Ring's prebuilt modules use extensionless imports that Node can't
    // resolve on its own, so Vite has to process them in tests too.
    server: { deps: { inline: [/@jetbrains\/ring-ui-built/] } },
    setupFiles: './src/test/setup.js',
    env: {
      VITE_USE_MOCK: 'true',
    },
  },
}));
