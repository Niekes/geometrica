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

        for (const amount of [5, 6, 7]) {
            layers.value[0]!.amount = amount;
            await nextTick();
            vi.advanceTimersByTime(100);
        }

        expect(window.location.search).toBe('');

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
});
