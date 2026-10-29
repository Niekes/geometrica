import { describe, it, expect } from 'vitest';
import { layerBounds, renderScene } from '../renderScene';
import { type Background, buildLayer, defaultBackground } from '../../config/defaults';
import { type Layer } from '../../types/Layer';

function makeLayer(shape: Layer['shape'], overrides: Partial<Layer> = {}): Layer {
    return {
        ...buildLayer(shape),
        amount: 1,
        fillOpacity: 1,
        strokeOpacity: 0,
        // magma(1) is the bright end of the ramp
        flipColorInterpolator: true,
        ...overrides
    };
}

function render(layers: Layer[], background: Background = defaultBackground): Element {
    const markup = renderScene({ background, layers });
    const svg = new DOMParser().parseFromString(markup, 'image/svg+xml').documentElement;

    expect(svg.tagName).toBe('svg');

    return svg;
}

const MAGMA_BRIGHT = '#fcfdbf';

function paths(svg: Element): Element[] {
    return [...svg.querySelectorAll('g > path')];
}

describe('renderScene: fill and stroke', () => {
    it('fills a single rect instance with the sequence color', () => {
        const [path, ...rest] = paths(render([makeLayer('rect', { width: 60, height: 60 })]));

        expect(rest).toHaveLength(0);
        expect(path!.getAttribute('d')).toMatch(/^M-30 -30L30 -30/);
        expect(path!.getAttribute('fill')).toBe(MAGMA_BRIGHT);
        expect(path!.getAttribute('fill-opacity')).toBe('1');
        expect(path!.hasAttribute('stroke')).toBe(false);
    });

    it('strokes without a fill at zero fill opacity', () => {
        const layer = makeLayer('rect', { fillOpacity: 0, strokeOpacity: 1, strokeWidth: 5 });
        const [path] = paths(render([layer]));

        expect(path!.getAttribute('fill')).toBe('none');
        expect(path!.getAttribute('stroke')).toBe(MAGMA_BRIGHT);
        expect(path!.getAttribute('stroke-opacity')).toBe('1');
        expect(path!.getAttribute('stroke-width')).toBe('5');
        // keeps the miter joins of the former renderer; SVG would default to 4
        expect(path!.getAttribute('stroke-miterlimit')).toBe('10');
        // miter is the SVG default, so existing exports stay as they were
        expect(path!.hasAttribute('stroke-linejoin')).toBe(false);
    });

    it('turns sharp corners with the stroke join of the layer', () => {
        const layer = makeLayer('rect', { strokeOpacity: 1, strokeJoin: 'round' });
        const [path] = paths(render([layer]));

        expect(path!.getAttribute('stroke-linejoin')).toBe('round');
        // a limit only applies to miter joins
        expect(path!.hasAttribute('stroke-miterlimit')).toBe(false);
    });

    it('fills and strokes with the same color', () => {
        const [path] = paths(render([makeLayer('rect', { fillOpacity: 1, strokeOpacity: 1 })]));

        expect(path!.getAttribute('fill')).toBe(MAGMA_BRIGHT);
        expect(path!.getAttribute('stroke')).toBe(MAGMA_BRIGHT);
    });

    it('draws fill and stroke with their own opacity on top of the layer opacity', () => {
        const layer = makeLayer('rect', { opacity: 0.5, fillOpacity: 0.4, strokeOpacity: 0.8 });
        const [path] = paths(render([layer]));

        expect(path!.getAttribute('fill-opacity')).toBe('0.2');
        expect(path!.getAttribute('stroke-opacity')).toBe('0.4');
    });

    it('centers the layer on the surface with cy pointing up', () => {
        const [path] = paths(render([makeLayer('rect', { cx: 10, cy: 20 })]));

        expect(path!.getAttribute('transform')).toBe('translate(522 492) rotate(0)');
    });
});

describe('renderScene: shape presets', () => {
    it('draws circles as two elliptical arcs', () => {
        const [path] = paths(render([makeLayer('circle', { radiusX: 60, radiusY: 40 })]));

        expect(path!.getAttribute('d')).toBe('M30 0A30 20 0 1 1 -30 0A30 20 0 1 1 30 0Z');
    });

    it('draws polygons with a vertex pointing up', () => {
        const [path] = paths(render([makeLayer('polygon', { sides: 4, size: 60 })]));

        expect(path!.getAttribute('d')).toMatch(/^M30 0/);
        expect(path!.getAttribute('transform')).toBe('translate(512 512) rotate(-90)');
    });

    it('rounds rect corners through quadratic segments', () => {
        const layer = makeLayer('rect', {
            width: 60,
            height: 60,
            borderRadiusTl: 1,
            borderRadiusTr: 1,
            borderRadiusBl: 1,
            borderRadiusBr: 1
        });
        const [path] = paths(render([layer]));

        expect(path!.getAttribute('d')).toContain('Q30 -30 30 0');
    });

    it('normalizes custom svg paths to the layer size around the center', () => {
        const layer = makeLayer('custom', { path: 'M0 0 L100 0 L100 100 L0 100 Z', size: 60 });
        const [path] = paths(render([layer]));

        expect(path!.getAttribute('d')).toBe('M-30 -30L30 -30L30 30L-30 30Z');
    });

    it('keeps curve commands of custom paths', () => {
        const layer = makeLayer('custom', {
            path: 'M0 0 C0 100 100 100 100 0 Q50 100 0 0 A50 50 0 0 1 100 0 Z',
            size: 60
        });
        const d = paths(render([layer]))[0]!.getAttribute('d')!;

        expect(d).toMatch(/C.*Q.*A/);
    });

    it('skips custom layers with an empty or invalid path', () => {
        const empty = makeLayer('custom', { path: '' });
        const invalid = makeLayer('custom', { path: 'not a path' });

        expect(paths(render([empty, invalid]))).toHaveLength(0);
    });

    it('skips degenerate zero-size instances at the repetition end', () => {
        const layer = makeLayer('polygon', { sides: 3, size: 20, amount: 2, distance: 20 });

        expect(paths(render([layer]))).toHaveLength(1);
    });

    it('falls back to the first interpolator for an unknown color scheme name', () => {
        const layer = makeLayer('rect', {
            colorInterPolator: 'nope' as unknown as Layer['colorInterPolator']
        });

        expect(paths(render([layer]))[0]!.getAttribute('fill')).toBe(MAGMA_BRIGHT);
    });
});

describe('renderScene: repetition', () => {
    it('draws one path per instance and spreads the rotation across them', () => {
        const layer = makeLayer('rect', { amount: 3, distance: 10, rotation: 90 });
        const rotations = paths(render([layer])).map((p) => p.getAttribute('transform'));

        expect(rotations).toEqual([
            'translate(512 512) rotate(0)',
            'translate(512 512) rotate(45)',
            'translate(512 512) rotate(90)'
        ]);
    });

    it('swings the instances around the rotation center, offset from the position', () => {
        // the rotation center lies 100 right of and 100 above the center of the surface
        const layer = makeLayer('rect', {
            amount: 3,
            rotation: 180,
            rotationCx: 100,
            rotationCy: 100
        });
        const transforms = paths(render([layer])).map((p) => p.getAttribute('transform'));

        expect(transforms).toEqual([
            'translate(512 512) rotate(0)',
            'translate(512 312) rotate(90)',
            'translate(712 312) rotate(180)'
        ]);
    });

    it('turns a polygon upright in place, not around the rotation center', () => {
        const layer = makeLayer('polygon', { rotationCx: 100, rotationCy: 100 });

        expect(paths(render([layer]))[0]!.getAttribute('transform')).toBe(
            'translate(512 512) rotate(-90)'
        );
    });

    it('interpolates the opacity along the sequence on top of the layer opacity', () => {
        const layer = makeLayer('rect', {
            amount: 2,
            opacity: 0.5,
            strokeOpacity: 0.5,
            calcOpacity: ['interpolate']
        });
        const flipped = { ...layer, calcOpacity: ['interpolate', 'flip'] } as Layer;

        expect(paths(render([layer])).map((p) => p.getAttribute('fill-opacity'))).toEqual([
            '0',
            '0.5'
        ]);
        expect(paths(render([layer])).map((p) => p.getAttribute('stroke-opacity'))).toEqual([
            '0',
            '0.25'
        ]);
        expect(paths(render([flipped])).map((p) => p.getAttribute('fill-opacity'))).toEqual([
            '0.5',
            '0'
        ]);
    });

    it('interpolates the stroke width along the sequence', () => {
        const layer = makeLayer('rect', {
            amount: 2,
            fillOpacity: 0,
            strokeOpacity: 1,
            strokeWidth: 4,
            calcStrokeWidth: ['interpolate']
        });
        const flipped = { ...layer, calcStrokeWidth: ['flip'] } as Layer;

        expect(paths(render([layer])).map((p) => p.getAttribute('stroke-width'))).toEqual([
            '0',
            '4'
        ]);
        expect(paths(render([flipped])).map((p) => p.getAttribute('stroke-width'))).toEqual([
            '4',
            '0'
        ]);
    });
});

describe('renderScene: layers', () => {
    it('draws the first layer on top', () => {
        const top = makeLayer('rect');
        const bottom = makeLayer('rect', { colorInterPolator: 'interpolateGreens' });
        const fills = paths(render([top, bottom])).map((p) => p.getAttribute('fill'));

        // greens(1) is #00441b
        expect(fills).toEqual(['#00441b', MAGMA_BRIGHT]);
    });

    it('skips hidden layers', () => {
        expect(paths(render([makeLayer('rect', { visible: false })]))).toHaveLength(0);
    });

    it('applies the layer opacity to every instance, not to the layer as a group', () => {
        const svg = render([
            makeLayer('rect', { amount: 2, opacity: 0.5, fillOpacity: 1, strokeOpacity: 1 })
        ]);

        expect(svg.querySelector('[opacity]')).toBeNull();
        for (const path of paths(svg)) {
            expect(path.getAttribute('fill-opacity')).toBe('0.5');
            expect(path.getAttribute('stroke-opacity')).toBe('0.5');
        }
    });
});

describe('renderScene: gradients', () => {
    const MAGMA_DARK = '#000004';

    function gradientOf(svg: Element, path: Element, attribute = 'fill'): Element {
        const id = /^url\(#(.+)\)$/.exec(path.getAttribute(attribute)!)![1]!;

        return svg.querySelector(`defs > #${id}`)!;
    }

    function stopColors(gradient: Element): string[] {
        return [...gradient.querySelectorAll('stop')].map((s) => s.getAttribute('stop-color')!);
    }

    it('fills each instance with a linear gradient along the angle in its own space', () => {
        const layer = makeLayer('rect', {
            width: 60,
            height: 40,
            applyColorSchemeToEachShape: true,
            flipColorInterpolator: false,
            gradientType: 'linear',
            gradientAngle: 90
        });
        const svg = render([layer]);
        const gradient = gradientOf(svg, paths(svg)[0]!);

        expect(gradient.tagName).toBe('linearGradient');
        expect(gradient.getAttribute('gradientUnits')).toBe('userSpaceOnUse');
        // the radius is half the larger side
        expect(['x1', 'y1', 'x2', 'y2'].map((a) => gradient.getAttribute(a))).toEqual([
            '0',
            '-30',
            '0',
            '30'
        ]);

        const stops = stopColors(gradient);
        expect(stops).toHaveLength(11);
        expect(stops[0]).toBe(MAGMA_DARK);
        expect(stops[10]).toBe(MAGMA_BRIGHT);
    });

    it('strokes with a radial gradient from the center and flips the ramp', () => {
        const layer = makeLayer('circle', {
            radiusX: 60,
            radiusY: 60,
            fillOpacity: 0,
            strokeOpacity: 1,
            applyColorSchemeToEachShape: true,
            gradientType: 'radial'
        });
        const svg = render([layer]);
        const gradient = gradientOf(svg, paths(svg)[0]!, 'stroke');

        expect(gradient.tagName).toBe('radialGradient');
        expect(['cx', 'cy', 'r'].map((a) => gradient.getAttribute(a))).toEqual(['0', '0', '30']);
        expect(stopColors(gradient)[0]).toBe(MAGMA_BRIGHT);
    });

    it('gives every instance of every layer its own gradient', () => {
        const layer = makeLayer('rect', {
            amount: 2,
            fillOpacity: 1,
            strokeOpacity: 1,
            applyColorSchemeToEachShape: true
        });
        const svg = render([layer, { ...layer, id: 'other' }]);
        const fills = paths(svg).map((p) => p.getAttribute('fill'));

        expect(new Set(fills).size).toBe(4);
        expect(paths(svg).every((p) => p.getAttribute('stroke') === p.getAttribute('fill'))).toBe(
            true
        );
        expect(svg.querySelectorAll('defs > linearGradient')).toHaveLength(4);
    });

    it('spans the gradient of a polygon with sharp corners across its size', () => {
        const layer = makeLayer('polygon', {
            sides: 4,
            size: 100,
            borderRadius: 0,
            gradientAngle: 0,
            applyColorSchemeToEachShape: true
        });
        const gradient = render([layer]).querySelector('defs > linearGradient')!;

        expect(gradient.getAttribute('x1')).toBe('-50');
        expect(gradient.getAttribute('x2')).toBe('50');
    });
});

describe('renderScene: surface', () => {
    it('draws the background with its corner radius and clips the layers to it', () => {
        const svg = render([], { color: '#123456', opacity: 1, borderRadius: 50 });

        expect(svg.getAttribute('xmlns')).toBe('http://www.w3.org/2000/svg');
        expect(svg.getAttribute('viewBox')).toBe('0 0 1024 1024');

        const background = svg.querySelector(':scope > rect')!;
        expect(background.getAttribute('fill')).toBe('#123456');
        expect(background.getAttribute('rx')).toBe('512');
        // an opaque background keeps the export free of a redundant opacity
        expect(background.hasAttribute('fill-opacity')).toBe(false);

        const clip = svg.querySelector('clipPath#surface rect')!;
        expect(clip.getAttribute('rx')).toBe('512');
        expect(svg.querySelector('g')!.getAttribute('clip-path')).toBe('url(#surface)');
    });

    it('falls back to the default color for a background color that is not a color', () => {
        const svg = render([], {
            color: '"/><script>alert(1)</script>',
            opacity: 1,
            borderRadius: 0
        });

        expect(svg.querySelector('script')).toBeNull();
        expect(svg.querySelector(':scope > rect')!.getAttribute('fill')).toBe('#000');
    });

    it('exports a translucent background with its opacity', () => {
        const svg = render([], { color: '#123456', opacity: 0.25, borderRadius: 0 });

        expect(svg.querySelector(':scope > rect')!.getAttribute('fill-opacity')).toBe('0.25');
    });
});

describe('layerBounds', () => {
    it('frames a single instance around its position, with y counted downwards', () => {
        const layer = makeLayer('rect', { width: 100, height: 60, cx: 10, cy: 20 });

        expect(layerBounds(layer)).toEqual({ minX: 472, minY: 462, maxX: 572, maxY: 522 });
    });

    it('frames instances turned along the repetition', () => {
        const layer = makeLayer('rect', {
            width: 100,
            height: 60,
            amount: 2,
            rotation: 90,
            distance: 0
        });

        expect(layerBounds(layer)).toEqual({ minX: 462, minY: 462, maxX: 562, maxY: 562 });
    });

    it('reaches out by half the stroke width', () => {
        const layer = makeLayer('rect', {
            width: 100,
            height: 60,
            strokeOpacity: 1,
            strokeWidth: 10
        });

        expect(layerBounds(layer)).toEqual({ minX: 457, minY: 477, maxX: 567, maxY: 547 });
    });

    it('frames a polygon with sharp corners', () => {
        const layer = makeLayer('polygon', { sides: 4, size: 100, borderRadius: 0 });

        expect(layerBounds(layer)).toEqual({
            minX: expect.closeTo(462),
            minY: expect.closeTo(462),
            maxX: expect.closeTo(562),
            maxY: expect.closeTo(562)
        });
    });

    it('reaches out to the miter tips of sharp stroked corners', () => {
        // a square on its tip: each 90° corner juts out by the width over √2, not half the width
        const layer = makeLayer('polygon', {
            sides: 4,
            size: 100,
            borderRadius: 0,
            strokeOpacity: 1,
            strokeWidth: 10
        });

        expect(layerBounds(layer)).toEqual({
            minX: expect.closeTo(512 - 50 - 10 / Math.SQRT2),
            minY: expect.closeTo(512 - 50 - 10 / Math.SQRT2),
            maxX: expect.closeTo(512 + 50 + 10 / Math.SQRT2),
            maxY: expect.closeTo(512 + 50 + 10 / Math.SQRT2)
        });
    });

    it('stops at half the width around corners turned by a round or bevel join', () => {
        for (const strokeJoin of ['round', 'bevel'] as const) {
            const layer = makeLayer('polygon', {
                sides: 4,
                size: 100,
                borderRadius: 0,
                strokeOpacity: 1,
                strokeWidth: 10,
                strokeJoin
            });

            expect(layerBounds(layer)).toEqual({
                minX: expect.closeTo(457),
                minY: expect.closeTo(457),
                maxX: expect.closeTo(567),
                maxY: expect.closeTo(567)
            });
        }
    });

    it('stops at half the width where the miter limit bevels a spike', () => {
        const layer = makeLayer('custom', {
            path: 'M0 0 L100 1 L0 2 Z',
            size: 100,
            strokeOpacity: 1,
            strokeWidth: 4
        });

        expect(layerBounds(layer)!.maxX).toBeCloseTo(564);
    });

    it('has no frame for a layer without instances', () => {
        expect(layerBounds(makeLayer('custom', { path: '' }))).toBeNull();
    });
});
