import pluginVue from 'eslint-plugin-vue';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';

export default defineConfigWithVueTs(
    {
        name: 'app/files-to-lint',
        ignores: ['dist/**', 'coverage/**', '**/*.d.ts']
    },
    pluginVue.configs['flat/strongly-recommended'],
    vueTsConfigs.recommended,
    skipFormatting,
    {
        name: 'app/rules',
        rules: {
            'vue/no-deprecated-slot-attribute': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
            ]
        }
    },
    {
        // browser plumbing goes through @vueuse/core; the direct calls are banned,
        // each message names the composable to use instead
        name: 'app/vueuse',
        files: ['src/**/*.ts', 'src/**/*.vue'],
        rules: {
            'no-restricted-globals': [
                'error',
                { name: 'addEventListener', message: 'Use useEventListener from @vueuse/core.' },
                {
                    name: 'removeEventListener',
                    message: 'Use useEventListener from @vueuse/core.'
                },
                { name: 'matchMedia', message: 'Use useMediaQuery from @vueuse/core.' },
                {
                    name: 'localStorage',
                    message: 'Use useLocalStorage/useStorage from @vueuse/core.'
                },
                {
                    name: 'sessionStorage',
                    message: 'Use useSessionStorage/useStorage from @vueuse/core.'
                },
                {
                    name: 'ResizeObserver',
                    message: 'Use useResizeObserver from @vueuse/core.'
                },
                {
                    name: 'IntersectionObserver',
                    message: 'Use useIntersectionObserver from @vueuse/core.'
                },
                {
                    name: 'MutationObserver',
                    message: 'Use useMutationObserver from @vueuse/core.'
                }
            ],
            'no-restricted-properties': [
                'error',
                {
                    object: 'window',
                    property: 'addEventListener',
                    message: 'Use useEventListener from @vueuse/core.'
                },
                {
                    object: 'window',
                    property: 'removeEventListener',
                    message: 'Use useEventListener from @vueuse/core.'
                },
                {
                    object: 'window',
                    property: 'matchMedia',
                    message: 'Use useMediaQuery from @vueuse/core.'
                },
                {
                    object: 'window',
                    property: 'localStorage',
                    message: 'Use useLocalStorage/useStorage from @vueuse/core.'
                },
                {
                    object: 'window',
                    property: 'sessionStorage',
                    message: 'Use useSessionStorage/useStorage from @vueuse/core.'
                },
                {
                    object: 'navigator',
                    property: 'clipboard',
                    message: 'Use useClipboard from @vueuse/core.'
                }
            ]
        }
    },
    {
        // the tests stub the browser APIs by design; the inline boot script in
        // index.html runs before the app loads and is outside src/, hence not linted
        name: 'app/vueuse-tests',
        files: ['src/**/__tests__/**'],
        rules: {
            'no-restricted-globals': 'off',
            'no-restricted-properties': 'off'
        }
    }
);
