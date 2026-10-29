import { describe, it, expect } from 'vitest';
import { artworkTools, type Artwork } from '../artworkTools';
import { type SceneState } from '../urlState';
import { buildLayer, defaultBackground } from '../../config/defaults';

function setup(artwork: SceneState, selectedLayer = 0) {
    const written: Artwork[] = [];
    const tools = artworkTools({
        read: () => ({ artwork, selectedLayer }),
        write: (next) => written.push(next)
    });
    const run = (name: string, input: Record<string, unknown> = {}) =>
        tools.find((tool) => tool.name === name)!.execute(input);

    return { tools, written, run };
}

const artwork: SceneState = {
    background: { color: '#112233', opacity: 0.5, borderRadius: 20 },
    layers: [
        { ...buildLayer('circle'), id: 'a', name: 'Rings' },
        { ...buildLayer('rect'), id: 'b', name: 'Frame' }
    ]
};

describe('get_artwork', () => {
    it('returns the background, the layers without their ids and the selected layer', async () => {
        const { run } = setup(artwork, 1);

        const result = (await run('get_artwork')) as Record<string, unknown>;
        const { id: _id, ...rings } = artwork.layers[0]!;

        expect(result.background).toEqual({ color: '#112233', opacity: 0.5, borderRadius: 20 });
        expect(result.layers).toHaveLength(2);
        expect((result.layers as unknown[])[0]).toEqual(rings);
        expect(result.selectedLayer).toBe(1);
    });
});

describe('set_artwork', () => {
    it('fills omitted fields with the defaults of the shape and of the background', async () => {
        const { run, written } = setup(artwork);

        await run('set_artwork', { layers: [{ shape: 'circle', amount: 5 }] });

        const { id: _id, ...circle } = buildLayer('circle');

        expect(written).toEqual([
            {
                background: defaultBackground,
                layers: [{ ...circle, amount: 5, name: 'Layer 1' }]
            }
        ]);
    });

    it('takes back what get_artwork returned, ignoring the selection it cannot set', async () => {
        const { run, written } = setup(artwork, 1);

        await run('set_artwork', (await run('get_artwork')) as Record<string, unknown>);

        expect(written[0]!.layers.map((layer) => layer.name)).toEqual(['Rings', 'Frame']);
        expect(written[0]!.background).toEqual(artwork.background);
    });

    it('rejects a fraction where the slider moves in whole steps', async () => {
        const { run, written } = setup(artwork);

        await expect(run('set_artwork', { layers: [{ sides: 3.5 }] })).rejects.toThrow(
            'layers[0].sides must be a whole number between 3 and 32'
        );
        expect(written).toEqual([]);
    });

    it('rejects a number outside the slider bounds and leaves the artwork unchanged', async () => {
        const { run, written } = setup(artwork);

        await expect(run('set_artwork', { layers: [{ distance: 100 }] })).rejects.toThrow(
            'layers[0].distance must be a number between -64 and 64'
        );
        expect(written).toEqual([]);
    });

    it('trims layer names and names a blank one by its place', async () => {
        const { run, written } = setup(artwork);

        await run('set_artwork', { layers: [{ name: ' Rays ' }, { name: '  ' }] });

        expect(written[0]!.layers.map((layer) => layer.name)).toEqual(['Rays', 'Layer 2']);
    });

    it('rejects a layer name longer than 40 characters', async () => {
        const { run, written } = setup(artwork);

        await expect(run('set_artwork', { layers: [{ name: 'a'.repeat(41) }] })).rejects.toThrow(
            'layers[0].name must be at most 40 characters'
        );
        expect(written).toEqual([]);
    });

    it('names every unknown field, wrong type and unknown option at once', async () => {
        const { run, written } = setup(artwork);

        const error = await run('set_artwork', {
            layers: [
                {
                    rotationX: 3,
                    visible: 'yes',
                    shape: 'star',
                    colorInterPolator: 'interpolateRosa',
                    calcOpacity: ['fade']
                }
            ]
        }).catch((e: Error) => e.message);

        expect(error).toContain('layers[0].rotationX is not a known field');
        expect(error).toContain('layers[0].visible must be true or false');
        expect(error).toContain('layers[0].shape must be one of rect, circle, polygon, custom');
        expect(error).toMatch(/layers\[0\]\.colorInterPolator must be one of .*interpolateMagma/);
        expect(error).toContain('layers[0].calcOpacity[0] must be one of interpolate, flip');
        expect(written).toEqual([]);
    });

    it('rejects input that is not shaped like an artwork', async () => {
        const { run, written } = setup(artwork);

        await expect(run('set_artwork', {})).rejects.toThrow('layers is required');
        await expect(run('set_artwork', { layers: 'circle' })).rejects.toThrow(
            'layers must be an array'
        );
        await expect(run('set_artwork', { layers: ['circle'] })).rejects.toThrow(
            'layers[0] must be an object'
        );
        await expect(run('set_artwork', { layers: [{ name: 7 }] })).rejects.toThrow(
            'layers[0].name must be a string'
        );
        expect(written).toEqual([]);
    });

    it('rejects an artwork without layers, since the surface always holds one', async () => {
        const { run, written } = setup(artwork);

        await expect(run('set_artwork', { layers: [] })).rejects.toThrow(
            'layers must hold at least 1 item'
        );
        expect(written).toEqual([]);
    });

    it('takes ten layers and rejects an eleventh', async () => {
        const { run, written } = setup(artwork);
        const layers = (length: number) => Array.from({ length }, () => ({}));

        await run('set_artwork', { layers: layers(10) });

        await expect(run('set_artwork', { layers: layers(11) })).rejects.toThrow(
            'layers must hold at most 10 items'
        );
        expect(written).toHaveLength(1);
    });

    it('rejects a background color and a custom shape the renderer cannot draw', async () => {
        const { run, written } = setup(artwork);

        const error = await run('set_artwork', {
            background: { color: 'sunset' },
            layers: [{ shape: 'custom', path: 'draw a star' }]
        }).catch((e: Error) => e.message);

        expect(error).toContain('background.color must be a CSS color');
        expect(error).toContain('layers[0].path must be SVG path data');
        expect(written).toEqual([]);
    });

    it('accepts a custom shape with SVG path data', async () => {
        const { run, written } = setup(artwork);

        await run('set_artwork', { layers: [{ shape: 'custom', path: 'M0 0 L100 0 L50 87 Z' }] });

        expect(written[0]!.layers[0]!.path).toBe('M0 0 L100 0 L50 87 Z');
    });
});
