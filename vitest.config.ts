import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        coverage: {
            provider: 'istanbul', // 使用 istanbul 替代 v8
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.ts', 'src/**/*.tsx'],
            exclude: ['node_modules/**', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
        },
    },
}) 