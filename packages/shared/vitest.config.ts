import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: {
            // Force tests to use TypeScript source, not compiled dist/
            // This is needed because the package.json "main" points to dist/index.js
            // and CJS→ESM named export detection doesn't work reliably.
            '../errors': path.resolve(__dirname, 'src/errors.ts'),
            '../logger': path.resolve(__dirname, 'src/logger.ts'),
            '../env/validate-env': path.resolve(__dirname, 'src/env/validate-env.ts'),
            '../middleware/error-handler': path.resolve(__dirname, 'src/middleware/error-handler.ts'),
            '../observability/correlation': path.resolve(__dirname, 'src/observability/correlation.ts'),
        },
    },
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'src/**/*.d.ts'],
        },
        silent: true,
    },
});
