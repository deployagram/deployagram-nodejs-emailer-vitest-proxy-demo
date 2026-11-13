import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    // Every test file starts the Emailer on the same fixed port (8080),
    // so the files must run one after another, as the JUnit tests do.
    fileParallelism: false,
  },
});
