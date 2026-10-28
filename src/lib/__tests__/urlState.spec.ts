import { describe, it, expect } from 'vitest';
import { serializeState, parseState } from '../urlState';
import { buildLayer, defaultBackground } from '../../config/defaults';
import { type Layer } from '../../types/Layer';

function makeLayer(index: number, overrides: Partial<Layer> = {}): Layer {
    return {
        ...buildLayer('rect'),
        id: `l-${index}`,
        name: `Layer ${index + 1}`,
        ...overrides
    };
}

describe('serializeState / parseState roundtrip (v2)', () => {
    it('roundtrips background and layers', () => {
        const layers = [
            makeLayer(0, {
                shape: 'custom',
                fillOpacity: 0.3,
                strokeOpacity: 0.6,
                path: 'M0 0 L10 0 L10 10 Z',
                amount: 5,
                gradientType: 'radial',
                gradientAngle: 45,
                opacity: 0.7,
                visible: false,
                calcOpacity: ['interpolate', 'flip']
            }),
            makeLayer(1, {
                shape: 'circle',
                radiusX: 300,
                radiusY: 200,
                rotationCx: -40,
                rotationCy: 12,
                calcStrokeWidth: ['flip']
            })
        ];
        const state = {
            background: { color: '#123456', opacity: 0.4, borderRadius: 25 },
            layers
        };

        const query = serializeState(state);
        const parsed = parseState(query);

        expect(parsed).not.toBeNull();
        expect(parsed!.background).toEqual(state.background);
        expect(parsed!.layers).toEqual(layers);
    });
});

describe('parseState', () => {
    it('parses a v2 query string', () => {
        const parsed = parseState(
            'v=2&bg[color]=%23ff0000&bg[borderRadius]=15&l[0][shape]=polygon&l[0][amount]=8&l[0][sides]=6&l[0][size]=100&l[0][opacity]=0.5&l[0][applyColorSchemeToEachShape]=true&l[0][calcOpacity]=interpolate%2Cflip'
        );

        expect(parsed).not.toBeNull();
        // links from before the background opacity load an opaque background
        expect(parsed!.background).toEqual({ color: '#ff0000', opacity: 1, borderRadius: 15 });
        expect(parsed!.layers.length).toBe(1);
        const layer = parsed!.layers[0]!;
        expect(layer.shape).toBe('polygon');
        expect(layer.amount).toBe(8);
        expect(layer.sides).toBe(6);
        expect(layer.size).toBe(100);
        expect(layer.opacity).toBe(0.5);
        expect(layer.applyColorSchemeToEachShape).toBe(true);
        expect(layer.calcOpacity).toEqual(['interpolate', 'flip']);
    });

    it('migrates the fill mode of older v2 URLs into fill and stroke opacity', () => {
        const parsed = parseState(
            'v=2&l[0][fillMode]=stroke&l[1][fillMode]=fill&l[2][fillMode]=fillStroke'
        );
        const opacities = parsed!.layers.map((layer) => [layer.fillOpacity, layer.strokeOpacity]);

        expect(opacities).toEqual([
            [0, 1],
            [1, 0],
            [1, 1]
        ]);
        expect(parsed!.layers[0]).not.toHaveProperty('fillMode');
    });

    it('migrates a legacy URL without a shape parameter', () => {
        const parsed = parseState('circle[amount]=3&circle[bgColor]=%23fff');

        expect(parsed).not.toBeNull();
        expect(parsed!.layers[0]!.shape).toBe('circle');
        expect(parsed!.layers[0]!.amount).toBe(3);
        expect(parsed!.background.color).toBe('#fff');
    });

    it('falls back to defaults for a v2 URL without background or layer fields', () => {
        const parsed = parseState('v=2&l[0][amount]=3&l[0][name]=x&l[0][path]=');

        expect(parsed).not.toBeNull();
        expect(parsed!.background).toEqual(defaultBackground);
        expect(parsed!.layers[0]!.name).toBe('x');
        expect(parsed!.layers[0]!.path).toBe('');
    });

    it('names a layer by its place when the link gives it only spaces', () => {
        const parsed = parseState('v=2&l[0][name]=x&l[1][name]=%20%20');

        expect(parsed!.layers[1]!.name).toBe('Layer 2');
    });

    it('cuts a layer name from a link to 40 characters', () => {
        const parsed = parseState(`v=2&l[0][name]=${'a'.repeat(50)}`);

        expect(parsed!.layers[0]!.name).toBe('a'.repeat(40));
    });

    it('cuts a layer name before an emoji rather than through it', () => {
        const parsed = parseState(`v=2&l[0][name]=${'a'.repeat(39)}%F0%9F%98%80`);

        expect(parsed!.layers[0]!.name).toBe('a'.repeat(39));
    });

    it('migrates a legacy rect URL into a single layer with background', () => {
        const parsed = parseState(
            'shape=rect&rect[amount]=8&rect[distance]=10&rect[width]=100&rect[height]=50&rect[strokeWidth]=2&rect[bgColor]=%23000&rect[bgBorderRadius]=10&rect[applyColorSchemeToEachShape]=true&rect[calcOpacity]=interpolate'
        );

        expect(parsed).not.toBeNull();
        expect(parsed!.background).toEqual({ color: '#000', opacity: 1, borderRadius: 10 });
        expect(parsed!.layers.length).toBe(1);
        const layer = parsed!.layers[0]!;
        expect(layer.shape).toBe('rect');
        expect(layer.amount).toBe(8);
        expect(layer.distance).toBe(10);
        expect(layer.width).toBe(100);
        expect(layer.height).toBe(50);
        expect(layer.strokeWidth).toBe(2);
        expect(layer.applyColorSchemeToEachShape).toBe(true);
        expect(layer.calcOpacity).toEqual(['interpolate']);
        // layer-specific v2 defaults are filled in
        expect(layer.fillOpacity).toBe(0);
        expect(layer.strokeOpacity).toBe(1);
        expect(layer.opacity).toBe(1);
        expect(layer.visible).toBe(true);
    });

    it('migrates a legacy polygon URL', () => {
        const parsed = parseState(
            'shape=polygon&polygon[sides]=7&polygon[borderRadius]=0.2&polygon[size]=200'
        );

        expect(parsed).not.toBeNull();
        expect(parsed!.background).toEqual(defaultBackground);
        const layer = parsed!.layers[0]!;
        expect(layer.shape).toBe('polygon');
        expect(layer.sides).toBe(7);
        expect(layer.borderRadius).toBe(0.2);
        expect(layer.size).toBe(200);
    });

    it('falls back to rect for an unknown legacy shape', () => {
        const parsed = parseState('shape=star&star[amount]=3');

        expect(parsed).not.toBeNull();
        expect(parsed!.layers[0]!.shape).toBe('rect');
    });

    it('returns null for an empty or unknown query string', () => {
        expect(parseState('')).toBeNull();
        expect(parseState('foo=bar')).toBeNull();
    });
});
