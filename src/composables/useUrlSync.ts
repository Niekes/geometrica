import { onUnmounted, watch, type Ref } from 'vue';
import { useDebounceFn, useEventListener } from '@vueuse/core';
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
        const current = parseState(window.location.search.substring(1));

        // the back button restores a state the URL already holds, maybe in an older format;
        // pushing it again cuts off the way forward
        if (current && serializeState(current) === query) return;

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
    const scheduleSerialize = useDebounceFn(serializeToUrl, 300);

    function setupWatchers() {
        watch([layers, background], scheduleSerialize, { deep: true });
        useEventListener(window, 'popstate', onPopState);

        // a change right before teardown must not push to the URL once the view is gone
        onUnmounted(() => scheduleSerialize.cancel());
    }

    return {
        initFromUrl,
        setupWatchers,
        serializeToUrl
    };
}
