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
    }
);
