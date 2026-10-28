import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import vueJsx from '@vitejs/plugin-vue-jsx';

// https://vitejs.dev/config/
export default defineConfig({
    base: '/geometrica/',
    plugins: [
        tailwindcss(),
        vue({
            template: {
                compilerOptions: {
                    isCustomElement: (tag) => tag.startsWith('niekes-') || tag.startsWith('bb-')
                }
            }
        }),
        vueJsx()
    ],
    build: {
        rolldownOptions: {
            // the agent guide is a page of its own: GitHub Pages serves no fallback for app routes
            input: {
                main: fileURLToPath(new URL('./index.html', import.meta.url)),
                agentGuide: fileURLToPath(new URL('./agent/index.html', import.meta.url))
            }
        }
    },
    server: {
        host: true,
        watch: {
            usePolling: true
        }
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    }
});
