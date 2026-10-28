import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { effectScope } from 'vue';
import useScene from '../useScene';
import { useWebMcp } from '../useWebMcp';
import { buildLayer } from '../../config/defaults';

let registered: { tool: ModelContextTool; signal?: AbortSignal }[];

function setup() {
    const scene = useScene();

    scene.init([
        { ...buildLayer('rect'), id: 'a', name: 'Frame' },
        { ...buildLayer('circle'), id: 'b', name: 'Rings' }
    ]);

    const scope = effectScope();

    scope.run(() => useWebMcp(scene));

    const run = (name: string, input: Record<string, unknown> = {}) =>
        registered.find(({ tool }) => tool.name === name)!.tool.execute(input);

    return { scene, scope, run };
}

describe('useWebMcp', () => {
    beforeEach(() => {
        registered = [];
        Object.defineProperty(document, 'modelContext', {
            configurable: true,
            value: {
                registerTool: (tool: ModelContextTool, options?: { signal?: AbortSignal }) =>
                    registered.push({ tool, signal: options?.signal })
            }
        });
    });

    afterEach(() => {
        delete (document as { modelContext?: unknown }).modelContext;
    });

    it('lets an agent read the artwork and the selected layer of the scene', async () => {
        const { scene, run } = setup();

        scene.selectedLayerId.value = 'b';

        const result = (await run('get_artwork')) as { layers: { name: string }[] };

        expect(result.layers.map((layer) => layer.name)).toEqual(['Frame', 'Rings']);
        expect(result).toMatchObject({ selectedLayer: 1 });
    });

    it('replaces the artwork and keeps the selection at its position', async () => {
        const { scene, run } = setup();

        scene.selectedLayerId.value = 'b';

        await run('set_artwork', {
            background: { color: '#ffffff' },
            layers: [{ name: 'One' }, { name: 'Two', shape: 'polygon' }, { name: 'Three' }]
        });

        const ids = scene.layers.value.map((layer) => layer.id);

        expect(scene.background.value.color).toBe('#ffffff');
        expect(scene.layers.value.map((layer) => layer.name)).toEqual(['One', 'Two', 'Three']);
        expect(scene.selectedLayer.value.name).toBe('Two');
        expect(new Set(ids).size).toBe(3);
    });

    it('selects the last layer when the new artwork ends before the selected position', async () => {
        const { scene, run } = setup();

        scene.selectedLayerId.value = 'b';

        await run('set_artwork', { layers: [{ name: 'Only' }] });

        expect(scene.selectedLayerId.value).toBe(scene.layers.value[0]!.id);
    });

    it('withdraws the tools once the view is gone', () => {
        const { scope } = setup();

        scope.stop();

        expect(registered.map(({ tool }) => tool.name)).toEqual(['get_artwork', 'set_artwork']);
        expect(registered.every(({ signal }) => signal?.aborted)).toBe(true);
    });

    it('offers nothing in a browser without WebMCP', () => {
        delete (document as { modelContext?: unknown }).modelContext;

        expect(() => setup()).not.toThrow();
    });
});
