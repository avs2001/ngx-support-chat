/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import { fileURLToPath, URL } from 'node:url';

const dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [
    angular({
      tsconfig: `${dirname}/tsconfig.spec.json`
    })
  ],
  resolve: {
    alias: {
      'ngx-support-chat/models': `${dirname}/projects/ngx-support-chat/src/models/public-api`,
      'ngx-support-chat/tokens': `${dirname}/projects/ngx-support-chat/src/tokens/public-api`,
      'ngx-support-chat': `${dirname}/projects/ngx-support-chat/src/public-api`
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['setup-tests.ts'],
    include: ['projects/**/*.spec.ts'],
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['projects/ngx-support-chat/src/**/*.ts'],
      exclude: [
        'projects/ngx-support-chat/src/**/*.spec.ts',
        'projects/ngx-support-chat/src/**/index.ts',
        'projects/ngx-support-chat/src/public-api.ts'
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      }
    }
  }
});
