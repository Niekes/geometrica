import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue({
            template: {
                compilerOptions: {
                    isCustomElement: (tag) => tag.startsWith('niekes-') || tag.startsWith('bb-')
                }
            }
        }),
        vueJsx()
    ],
    server: {
        host: true,
        watch: {
            usePolling: true
        }
    }
});
