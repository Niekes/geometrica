import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/*'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        provider: 'v8',
        // json-summary feeds the coverage badge; json emits coverage-final.json,
        // which fallow reads for exact coverage gaps.
        reporter: ['text', 'html', 'json-summary', 'json'],
        include: ['src/lib/**', 'src/composables/**'],
        thresholds: {
          statements: 95,
          branches: 85,
          functions: 95,
          lines: 95
        }
      }
    }
  })
)
