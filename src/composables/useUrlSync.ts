import { computed, ref, watch, onUnmounted, type Ref } from 'vue';
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
 * updates the URL once the scene state stops changing. Every history entry it writes is a
 * step, numbered from the artwork the page was opened with, so undo and redo are the
 * browser's back and forward (ADR-0007).
 */
export function useUrlSync(state: UseUrlSyncOptions) {
    const { layers, background, onLoad } = state;

    // the step of the current history entry and the last one known ahead of it
    const step = ref(0);
    const lastStep = ref(0);
    const canUndo = computed(() => step.value > 0);
    const canRedo = computed(() => step.value < lastStep.value);

    function stepOf(historyState: unknown): number | null {
        const value = (historyState as { step?: unknown } | null)?.step;

        return typeof value === 'number' ? value : null;
    }

    function serializeToUrl() {
        const query = serializeState({ background: background.value, layers: layers.value });
        const current = parseState(window.location.search.substring(1));

        // the back button restores a state the URL already holds, maybe in an older format;
        // pushing it again cuts off the way forward
        if (current && serializeState(current) === query) return;

        step.value += 1;
        lastStep.value = step.value;
        window.history.pushState({ step: step.value }, '', `${window.location.pathname}?${query}`);
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

    function onPopState(event: PopStateEvent) {
        step.value = stepOf(event.state) ?? 0;
        lastStep.value = Math.max(lastStep.value, step.value);
        // initFromUrl calls onLoad itself when it loads state
        initFromUrl();
    }

    // a slider or a drag changes the state many times per second; browsers throttle pushState,
    // and a single history entry per gesture keeps the back button useful
    const scheduleSerialize = useDebounceFn(serializeToUrl, 300);

    // a change that has not come to rest yet becomes a step first, so undo never skips it
    function flushSerialize() {
        if (!scheduleSerialize.isPending.value) return;

        scheduleSerialize.flush();
    }

    // the browser moves in a task of its own; counting the step at once keeps a quick second
    // press from leaving the page, and popstate then confirms it
    function undo() {
        flushSerialize();
        if (!canUndo.value) return;

        step.value -= 1;
        window.history.back();
    }

    function redo() {
        flushSerialize();
        if (!canRedo.value) return;

        step.value += 1;
        window.history.forward();
    }

    function setupWatchers() {
        // a reload keeps the entry and its step; a page opened anew starts at step 0.
        // shortcut: after a reload the steps ahead are unknown, so redo waits for the next undo
        step.value = stepOf(window.history.state) ?? 0;
        lastStep.value = step.value;
        // the opened artwork goes into its entry too, so undo has it to come back to even when
        // the page was opened without a link
        if (step.value === 0) {
            const query = serializeState({ background: background.value, layers: layers.value });

            window.history.replaceState({ step: 0 }, '', `${window.location.pathname}?${query}`);
        }

        watch([layers, background], scheduleSerialize, { deep: true });
        useEventListener(window, 'popstate', onPopState);

        // a change right before teardown must not push to the URL once the view is gone
        onUnmounted(() => scheduleSerialize.cancel());
    }

    return {
        initFromUrl,
        setupWatchers,
        serializeToUrl,
        canUndo,
        canRedo,
        undo,
        redo
    };
}
