import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    globalSetup: ['test/deployagram.global-setup.ts'],
    // Suites share the Emailer's port (8080) and the Deployagram environment, so run them one
    // after another, as the Java tests do.
    fileParallelism: false,
  },
});
