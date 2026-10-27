import { watch, onUnmounted, type Ref } from 'vue';
import { parseState, serializeState } from '../lib/urlState';
import { type Layer } from '../types/Layer';
import { type Background } from '../config/defaults';

interface UseUrlSyncOptions {
    layers: Ref<Layer[]>;
    background: Ref<Background>;
    onLoad?: () => void;
}

/**
 * Composable for bidirectional URL query parameter synchronization.
 * Parses URL params on init (v2 format or legacy migration) and
 * updates the URL whenever the scene state changes.
 */
export function useUrlSync(state: UseUrlSyncOptions) {
    const { layers, background, onLoad } = state;

    function serializeToUrl() {
        const query = serializeState({ background: background.value, layers: layers.value });
        window.history.pushState({}, '', `${window.location.pathname}?${query}`);
    }

    function initFromUrl(): boolean {
        const parsed = parseState(window.location.search.substring(1));

        if (parsed) {
            background.value = parsed.background;
            layers.value = parsed.layers;
            onLoad?.();
        }

        return parsed !== null;
    }

    function onPopState() {
        if (initFromUrl()) onLoad?.();
    }

    function setupWatchers() {
        watch([layers, background], serializeToUrl, { deep: true });
        window.addEventListener('popstate', onPopState);

        onUnmounted(() => {
            window.removeEventListener('popstate', onPopState);
        });
    }

    return {
        initFromUrl,
        setupWatchers,
        serializeToUrl
    };
}
