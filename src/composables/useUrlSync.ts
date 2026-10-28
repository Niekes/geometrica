import { watch, onUnmounted, type Ref } from 'vue';
import { parseState, serializeState } from '../lib/urlState';
import { type Layer } from '../types/Layer';
import { type Background } from '../config/defaults';

export interface UseUrlSyncOptions {
    layers: Ref<Layer[]>;
    background: Ref<Background>;
    onLoad?: () => void;
}

/**
 * Composable for bidirectional URL query parameter synchronization.
 * Parses URL params on init (v2 format or legacy migration) and
 * updates the URL once the scene state stops changing.
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
        // initFromUrl calls onLoad itself when it loads state
        initFromUrl();
    }

    // a slider or a drag changes the state many times per second; browsers throttle pushState,
    // and a single history entry per gesture keeps the back button useful
    let serializeTimer: ReturnType<typeof setTimeout> | undefined;

    function scheduleSerialize() {
        clearTimeout(serializeTimer);
        serializeTimer = setTimeout(serializeToUrl, 300);
    }

    function setupWatchers() {
        watch([layers, background], scheduleSerialize, { deep: true });
        window.addEventListener('popstate', onPopState);

        onUnmounted(() => {
            clearTimeout(serializeTimer);
            window.removeEventListener('popstate', onPopState);
        });
    }

    return {
        initFromUrl,
        setupWatchers,
        serializeToUrl
    };
}
