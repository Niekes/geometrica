import { describe, it, expect } from 'vitest';
import { renderScene } from '../renderScene';
import { type Background, buildLayer, defaultBackground } from '../../config/defaults';
import { type Layer } from '../../types/Layer';

function makeLayer(shape: Layer['shape'], overrides: Partial<Layer> = {}): Layer {
    return {
        ...buildLayer(shape),
        amount: 1,
        fillMode: 'fill',
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

describe('renderScene: fill modes', () => {
    it('fills a single rect instance with the sequence color', () => {
        const [path, ...rest] = paths(render([makeLayer('rect', { width: 60, height: 60 })]));

        expect(rest).toHaveLength(0);
        expect(path!.getAttribute('d')).toMatch(/^M-30 -30L30 -30/);
        expect(path!.getAttribute('fill')).toBe(MAGMA_BRIGHT);
        expect(path!.getAttribute('fill-opacity')).toBe('1');
        expect(path!.hasAttribute('stroke')).toBe(false);
    });

    it('strokes instead of filling in stroke mode', () => {
        const layer = makeLayer('rect', { fillMode: 'stroke', strokeWidth: 5 });
        const [path] = paths(render([layer]));

        expect(path!.getAttribute('fill')).toBe('none');
        expect(path!.getAttribute('stroke')).toBe(MAGMA_BRIGHT);
        expect(path!.getAttribute('stroke-opacity')).toBe('1');
        expect(path!.getAttribute('stroke-width')).toBe('5');
        // keeps the miter joins of the former renderer; SVG would default to 4
        expect(path!.getAttribute('stroke-miterlimit')).toBe('10');
    });

    it('fills and strokes in fillStroke mode', () => {
        const [path] = paths(render([makeLayer('rect', { fillMode: 'fillStroke' })]));

        expect(path!.getAttribute('fill')).toBe(MAGMA_BRIGHT);
        expect(path!.getAttribute('stroke')).toBe(MAGMA_BRIGHT);
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

    it('interpolates the opacity along the sequence on top of the layer opacity', () => {
        const layer = makeLayer('rect', { amount: 2, opacity: 0.5, calcOpacity: ['interpolate'] });
        const flipped = { ...layer, calcOpacity: ['interpolate', 'flip'] } as Layer;

        expect(paths(render([layer])).map((p) => p.getAttribute('fill-opacity'))).toEqual([
            '0',
            '0.5'
        ]);
        expect(paths(render([flipped])).map((p) => p.getAttribute('fill-opacity'))).toEqual([
            '0.5',
            '0'
        ]);
    });

    it('interpolates the stroke width along the sequence', () => {
        const layer = makeLayer('rect', {
            amount: 2,
            fillMode: 'stroke',
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
            makeLayer('rect', { amount: 2, opacity: 0.5, fillMode: 'fillStroke' })
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
            fillMode: 'stroke',
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
            fillMode: 'fillStroke',
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
});

describe('renderScene: surface', () => {
    it('draws the background with its corner radius and clips the layers to it', () => {
        const svg = render([], { color: '#123456', borderRadius: 50 });

        expect(svg.getAttribute('xmlns')).toBe('http://www.w3.org/2000/svg');
        expect(svg.getAttribute('viewBox')).toBe('0 0 1024 1024');

        const background = svg.querySelector(':scope > rect')!;
        expect(background.getAttribute('fill')).toBe('#123456');
        expect(background.getAttribute('rx')).toBe('512');

        const clip = svg.querySelector('clipPath#surface rect')!;
        expect(clip.getAttribute('rx')).toBe('512');
        expect(svg.querySelector('g')!.getAttribute('clip-path')).toBe('url(#surface)');
    });

    it('falls back to the default color for a background color that is not a color', () => {
        const svg = render([], { color: '"/><script>alert(1)</script>', borderRadius: 0 });

        expect(svg.querySelector('script')).toBeNull();
        expect(svg.querySelector(':scope > rect')!.getAttribute('fill')).toBe('#000');
    });
});
