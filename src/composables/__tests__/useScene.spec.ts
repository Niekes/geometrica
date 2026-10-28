import { describe, it, expect } from 'vitest';
import useScene from '../useScene';
import { buildLayer } from '../../config/defaults';
import { type Layer } from '../../types/Layer';

function makeLayer(shape: Layer['shape'], name: string): Layer {
    return { ...buildLayer(shape), id: `id-${name}`, name };
}

describe('useScene', () => {
    it('initializes with a single default rect layer when no layers are given', () => {
        const scene = useScene();

        scene.init([]);

        expect(scene.layers.value.length).toBe(1);
        expect(scene.layers.value[0]!.shape).toBe('rect');
        expect(scene.layers.value[0]!.name).toBe('Layer 1');
        expect(scene.selectedLayerId.value).toBe(scene.layers.value[0]!.id);
    });

    it('adopts given layers and selects the first one', () => {
        const scene = useScene();
        const first = makeLayer('circle', 'one');
        const second = makeLayer('polygon', 'two');

        scene.init([first, second]);

        expect(scene.layers.value).toEqual([first, second]);
        expect(scene.selectedLayer.value).toEqual(first);
    });

    it('adds a layer as a duplicate of the selected one with a unique name', () => {
        const scene = useScene();
        scene.init([]);
        scene.layers.value[0]!.amount = 5;

        scene.addLayer();

        expect(scene.layers.value.length).toBe(2);
        const added = scene.layers.value[0]!;
        expect(added.amount).toBe(5);
        expect(added.id).not.toBe(scene.layers.value[1]!.id);
        expect(added.name).toBe('Layer 2');
        expect(scene.selectedLayerId.value).toBe(added.id);
    });

    it('duplicates a specific layer right after its source', () => {
        const scene = useScene();
        scene.init([makeLayer('rect', 'one'), makeLayer('circle', 'two')]);
        const third = makeLayer('polygon', 'three');
        scene.layers.value.push(third);

        scene.duplicateLayer(third.id);

        expect(scene.layers.value.length).toBe(4);
        expect(scene.layers.value[2]!.id).not.toBe(third.id);
        expect(scene.selectedLayerId.value).toBe(scene.layers.value[2]!.id);
    });

    it('keeps at least one layer when removing', () => {
        const scene = useScene();
        scene.init([]);

        scene.removeLayer(scene.layers.value[0]!.id);

        expect(scene.layers.value.length).toBe(1);
    });

    it('removes the selected layer and selects its neighbor', () => {
        const scene = useScene();
        const layers = [
            makeLayer('rect', 'one'),
            makeLayer('circle', 'two'),
            makeLayer('polygon', 'three')
        ];
        scene.init(layers);
        scene.selectedLayerId.value = layers[1]!.id;

        scene.removeLayer(layers[1]!.id);

        expect(scene.layers.value.length).toBe(2);
        expect(scene.selectedLayerId.value).toBe(layers[2]!.id);
    });

    it('removing the selected last layer selects the previous one', () => {
        const scene = useScene();
        const layers = [makeLayer('rect', 'one'), makeLayer('circle', 'two')];
        scene.init(layers);
        scene.selectedLayerId.value = layers[1]!.id;

        scene.removeLayer(layers[1]!.id);

        expect(scene.selectedLayerId.value).toBe(layers[0]!.id);
    });

    it('moves a layer within the list order', () => {
        const scene = useScene();
        const layers = [
            makeLayer('rect', 'one'),
            makeLayer('circle', 'two'),
            makeLayer('polygon', 'three')
        ];
        scene.init(layers);

        scene.moveLayer(layers[0]!.id, 1);

        expect(scene.layers.value.map((layer) => layer.name)).toEqual(['two', 'one', 'three']);
    });

    it('ignores moves beyond the list bounds', () => {
        const scene = useScene();
        const layers = [makeLayer('rect', 'one'), makeLayer('circle', 'two')];
        scene.init(layers);

        scene.moveLayer(layers[0]!.id, -1);
        scene.moveLayer(layers[1]!.id, 1);
        scene.moveLayer('does-not-exist', 1);

        expect(scene.layers.value.map((layer) => layer.name)).toEqual(['one', 'two']);
    });

    it('ignores unknown layer ids', () => {
        const scene = useScene();
        scene.init([]);

        scene.duplicateLayer('does-not-exist');
        scene.removeLayer('does-not-exist');
        scene.toggleVisibility('does-not-exist');

        expect(scene.layers.value.length).toBe(1);
        expect(scene.layers.value[0]!.visible).toBe(true);
    });

    it('toggles the visibility of a layer', () => {
        const scene = useScene();
        scene.init([]);

        const id = scene.layers.value[0]!.id;

        scene.toggleVisibility(id);
        expect(scene.layers.value[0]!.visible).toBe(false);

        scene.toggleVisibility(id);
        expect(scene.layers.value[0]!.visible).toBe(true);
    });

    it('renames a layer without its surrounding spaces', () => {
        const scene = useScene();
        scene.init([makeLayer('rect', 'one')]);

        scene.renameLayer('id-one', '  Sun rays ');

        expect(scene.layers.value[0]!.name).toBe('Sun rays');
    });

    it('cuts a new layer name to 40 characters', () => {
        const scene = useScene();
        scene.init([makeLayer('rect', 'one')]);

        scene.renameLayer('id-one', 'a'.repeat(50));

        expect(scene.layers.value[0]!.name).toBe('a'.repeat(40));
    });

    it('keeps the old name when the new one is blank', () => {
        const scene = useScene();
        scene.init([makeLayer('rect', 'one')]);

        scene.renameLayer('id-one', '   ');

        expect(scene.layers.value[0]!.name).toBe('one');
    });

    it('replaces a layer through the selectedLayer setter', () => {
        const scene = useScene();
        scene.init([]);
        const replacement = { ...scene.layers.value[0]!, amount: 42 };

        scene.selectedLayer.value = replacement;

        expect(scene.layers.value[0]!.amount).toBe(42);
    });

    it('appends an unknown layer through the selectedLayer setter', () => {
        const scene = useScene();
        scene.init([]);
        const fresh = makeLayer('custom', 'fresh');

        scene.selectedLayer.value = fresh;

        expect(scene.layers.value[scene.layers.value.length - 1]).toEqual(fresh);
    });
});
