import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ref, nextTick, type Ref } from 'vue';
import { useUrlSync } from '../useUrlSync';
import { buildLayer, defaultBackground, type Background } from '../../config/defaults';
import { type Layer } from '../../types/Layer';
import { serializeState } from '../../lib/urlState';

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
        window.history.replaceState({}, '', '/geometrica/');
    });

    it('returns false and keeps defaults when the URL has no state', () => {
        const result = sync.initFromUrl();

        expect(result).toBe(false);
        expect(layers.value).toEqual([]);
        expect(onLoadCalls).toBe(0);
    });

    it('loads layers and background from a v2 URL and calls onLoad', () => {
        window.history.replaceState(
            {},
            '',
            `/geometrica/?${serializeState({
                background: { color: '#123456', borderRadius: 20 },
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
        background.value = { color: '#abcdef', borderRadius: 5 };

        sync.serializeToUrl();

        expect(window.location.search).toContain('v=2');
        expect(window.location.search).toContain('one');
    });

    it('pushes the state to the URL when watched state changes', async () => {
        layers.value = [makeLayer('one')];

        sync.setupWatchers();
        layers.value[0]!.amount = 7;
        await nextTick();

        expect(window.location.search).toContain('v=2');
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
});
