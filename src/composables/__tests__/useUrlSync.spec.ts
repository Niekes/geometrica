import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ref, nextTick, type Ref } from 'vue';
import { useUrlSync } from '../useUrlSync';
import { buildLayer, defaultBackground, type Background } from '../../config/defaults';
import { type Layer } from '../../types/Layer';
import { parseState, serializeState } from '../../lib/urlState';

function makeLayer(name: string): Layer {
    return { ...buildLayer('rect'), id: `id-${name}`, name };
}

describe('useUrlSync', () => {
    let layers: Ref<Layer[]>;
    let background: Ref<Background>;
    let onLoadCalls: number;

    let sync: ReturnType<typeof useUrlSync>;

    beforeEach(() => {
        window.history.replaceState({}, '', '/geometrica/');
        layers = ref<Layer[]>([]);
        background = ref({ ...defaultBackground });
        onLoadCalls = 0;
        sync = useUrlSync({
            layers,
            background,
            onLoad: () => {
                onLoadCalls += 1;
            }
        });
    });

    afterEach(() => {
        vi.useRealTimers();
        window.history.replaceState({}, '', '/geometrica/');
    });

    it('returns false and keeps defaults when the URL has no state', () => {
        const result = sync.initFromUrl();

        expect(result).toBe(false);
        expect(layers.value).toEqual([]);
        expect(onLoadCalls).toBe(0);
    });

    it('loads layers and background from a c URL and calls onLoad', () => {
        window.history.replaceState(
            {},
            '',
            `/geometrica/?${serializeState({
                background: { color: '#123456', opacity: 1, borderRadius: 20 },
                layers: [makeLayer('from-url')]
            })}`
        );

        const result = sync.initFromUrl();

        expect(result).toBe(true);
        expect(layers.value.length).toBe(1);
        expect(layers.value[0]!.name).toBe('from-url');
        expect(background.value.color).toBe('#123456');
        expect(background.value.borderRadius).toBe(20);
        expect(onLoadCalls).toBe(1);
    });

    it('serializes the current state to the URL', () => {
        layers.value = [makeLayer('one')];
        background.value = { color: '#abcdef', opacity: 1, borderRadius: 5 };

        sync.serializeToUrl();

        expect(window.location.search).toMatch(/^\?c=/);
        expect(parseState(window.location.search.substring(1))!.layers[0]!.name).toBe('one');
    });

    it('pushes the state to the URL once watched state stops changing', async () => {
        vi.useFakeTimers();
        layers.value = [makeLayer('one')];
        const entries = window.history.length;

        sync.setupWatchers();
        const opened = window.location.search;

        for (const amount of [5, 6, 7]) {
            layers.value[0]!.amount = amount;
            await nextTick();
            vi.advanceTimersByTime(100);
        }

        // the URL still holds the opened artwork while the change has not come to rest
        expect(window.location.search).toBe(opened);

        vi.advanceTimersByTime(300);

        expect(window.location.search).toMatch(/^\?c=/);
        expect(parseState(window.location.search.substring(1))!.layers[0]!.amount).toBe(7);
        expect(window.history.length).toBe(entries + 1);
    });

    it('reloads the state when the browser navigates back', () => {
        const query = serializeState({
            background: { ...defaultBackground },
            layers: [makeLayer('popped')]
        });

        sync.initFromUrl();
        sync.setupWatchers();

        window.history.pushState({}, '', `/geometrica/?${query}`);
        window.dispatchEvent(new PopStateEvent('popstate'));

        expect(layers.value[0]!.name).toBe('popped');
        expect(onLoadCalls).toBeGreaterThan(0);
    });

    it('keeps the way forward after going back, adding no entry for the restored state', async () => {
        vi.useFakeTimers();
        const query = serializeState({
            background: { ...defaultBackground },
            layers: [makeLayer('popped')]
        });
        window.history.replaceState({}, '', `/geometrica/?${query}`);
        sync.setupWatchers();
        const entries = window.history.length;

        window.dispatchEvent(new PopStateEvent('popstate'));
        await nextTick();
        vi.advanceTimersByTime(300);

        expect(window.history.length).toBe(entries);
    });

    it('keeps the way forward after going back to a link in an older format', async () => {
        vi.useFakeTimers();
        sync.setupWatchers();

        for (const link of ['v=2&l[0][name]=old&l[0][amount]=8', 'shape=rect&rect[amount]=8']) {
            window.history.replaceState({}, '', `/geometrica/?${link}`);
            const entries = window.history.length;

            window.dispatchEvent(new PopStateEvent('popstate'));
            await nextTick();
            vi.advanceTimersByTime(300);

            expect(window.history.length).toBe(entries);
        }
    });

    describe('undo and redo', () => {
        // jsdom moves through the history in a task of its own, like a browser
        const settle = () =>
            new Promise((resolve) => window.addEventListener('popstate', resolve, { once: true }));

        async function change(amount: number) {
            layers.value[0]!.amount = amount;
            await nextTick();
            vi.advanceTimersByTime(300);
        }

        beforeEach(() => {
            layers.value = [makeLayer('one')];
        });

        it('offers neither on the artwork the page was opened with', () => {
            sync.setupWatchers();

            expect(sync.canUndo.value).toBe(false);
            expect(sync.canRedo.value).toBe(false);
        });

        it('adds no step when there is nothing to undo', () => {
            sync.setupWatchers();
            const entries = window.history.length;

            sync.undo();
            sync.redo();

            expect(window.history.length).toBe(entries);
            expect(sync.canUndo.value).toBe(false);
        });

        it('never undoes past the opened artwork, however fast undo is pressed', async () => {
            vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
            sync.setupWatchers();
            await change(5);
            const back = vi.spyOn(window.history, 'back');

            sync.undo();
            sync.undo();

            expect(back).toHaveBeenCalledTimes(1);
            await settle();
        });

        it('undoes a step and redoes it', async () => {
            vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
            sync.setupWatchers();
            await change(5);
            await change(6);

            expect(sync.canUndo.value).toBe(true);

            sync.undo();
            await settle();

            expect(layers.value[0]!.amount).toBe(5);
            expect(sync.canRedo.value).toBe(true);

            sync.redo();
            await settle();

            expect(layers.value[0]!.amount).toBe(6);
            expect(sync.canRedo.value).toBe(false);
        });

        it('discards the steps ahead when a new change follows an undo', async () => {
            vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
            sync.setupWatchers();
            await change(5);
            await change(6);
            sync.undo();
            await settle();

            await change(9);

            expect(sync.canRedo.value).toBe(false);
            expect(sync.canUndo.value).toBe(true);
        });

        it('undoes a change that has not come to rest yet as a step of its own', async () => {
            vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
            sync.setupWatchers();
            await change(5);
            layers.value[0]!.amount = 6;
            await nextTick();

            sync.undo();
            await settle();

            expect(layers.value[0]!.amount).toBe(5);
            expect(sync.canRedo.value).toBe(true);
        });

        it('undoes back to an artwork the page was opened with without a link', async () => {
            vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
            layers.value[0]!.amount = 3;
            sync.setupWatchers();
            await change(5);

            sync.undo();
            await settle();

            expect(layers.value[0]!.amount).toBe(3);
        });

        it('stops at the artwork the page was opened with, also after a reload', async () => {
            vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
            sync.setupWatchers();
            await change(5);

            // a reload keeps the history entry and with it the step
            const reloaded = useUrlSync({ layers, background });
            reloaded.setupWatchers();

            expect(reloaded.canUndo.value).toBe(true);

            reloaded.undo();
            await settle();

            expect(reloaded.canUndo.value).toBe(false);
        });
    });
});
