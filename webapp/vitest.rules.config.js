// Tests for ../firestore.rules. They need the Firestore emulator, so they
// run through `npm run test:rules`, not the regular `npm test`.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['rules/**/*.test.js'],
    fileParallelism: false,
  },
});
