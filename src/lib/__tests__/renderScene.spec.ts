import { describe, it, expect, beforeEach } from 'vitest';
import { renderScene } from '../renderScene';
import { buildLayer } from '../../config/defaults';
import { type Layer } from '../../types/Layer';

const CANVAS_SIZE = 100;

let ctx: CanvasRenderingContext2D;

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

function pixel(x: number, y: number): [number, number, number, number] {
    const data = ctx.getImageData(x, y, 1, 1).data;
    return [data[0]!, data[1]!, data[2]!, data[3]!];
}

function expectBright(actual: [number, number, number, number]) {
    expect(actual[0]).toBeGreaterThan(240);
    expect(actual[1]).toBeGreaterThan(240);
    expect(actual[2]).toBeGreaterThan(170);
    expect(actual[3]).toBe(255);
}

beforeEach(() => {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    ctx = canvas.getContext('2d')!;
});

describe('renderScene: fill modes', () => {
    it('fills a single rect instance with the sequence color', () => {
        const layer = makeLayer('rect', { width: 60, height: 60 });

        renderScene(ctx, [layer], { width: CANVAS_SIZE, height: CANVAS_SIZE });

        expectBright(pixel(50, 50));
        expect(pixel(10, 50)[3]).toBe(0);
    });

    it('strokes instead of filling in stroke mode', () => {
        const layer = makeLayer('rect', {
            width: 60,
            height: 60,
            fillMode: 'stroke',
            strokeWidth: 5
        });

        renderScene(ctx, [layer], { width: CANVAS_SIZE, height: CANVAS_SIZE });

        expectBright(pixel(21, 50));
        expect(pixel(50, 50)[3]).toBe(0);
    });

    it('fills and strokes in fillStroke mode', () => {
        const layer = makeLayer('rect', {
            width: 60,
            height: 60,
            fillMode: 'fillStroke',
            strokeWidth: 5
        });

        renderScene(ctx, [layer], { width: CANVAS_SIZE, height: CANVAS_SIZE });

        expect(pixel(50, 50)[3]).toBe(255);
        expectBright(pixel(21, 50));
    });
});

describe('renderScene: shape presets', () => {
    it('fills circle instances', () => {
        const layer = makeLayer('circle', { radiusX: 60, radiusY: 60 });

        renderScene(ctx, [layer], { width: CANVAS_SIZE, height: CANVAS_SIZE });

        expectBright(pixel(50, 50));
        expectBright(pixel(75, 50));
        expect(pixel(85, 50)[3]).toBe(0);
    });

    it('fills polygon instances', () => {
        const layer = makeLayer('polygon', { sides: 4, size: 60 });

        renderScene(ctx, [layer], { width: CANVAS_SIZE, height: CANVAS_SIZE });

        expectBright(pixel(50, 50));
    });

    it('fills custom svg path instances', () => {
        const layer = makeLayer('custom', {
            path: 'M0 0 L100 0 L100 100 L0 100 Z',
            size: 60
        });

        renderScene(ctx, [layer], { width: CANVAS_SIZE, height: CANVAS_SIZE });

        expectBright(pixel(50, 50));
        expect(pixel(80, 50)[3]).toBe(0);
    });

    it('fills custom paths built from curve commands', () => {
        // cubic bulge, quadratic bow and a half circle arc
        const cubic = makeLayer('custom', {
            path: 'M0 0 C0 100 100 100 100 0 L100 100 L0 100 Z',
            size: 60
        });
        const quadratic = makeLayer('custom', { path: 'M0 0 Q50 100 100 0 Z', size: 60 });
        const arc = makeLayer('custom', { path: 'M0 0 A50 50 0 0 1 100 0 Z', size: 60 });

        renderScene(ctx, [cubic], { width: CANVAS_SIZE, height: CANVAS_SIZE });
        // the cubic bulge dips to y=65, the closing lines sit at y=80
        expect(pixel(50, 70)[3]).toBe(255);
        expect(pixel(50, 85)[3]).toBe(0);

        renderScene(ctx, [quadratic], { width: CANVAS_SIZE, height: CANVAS_SIZE });
        // the bow spans y=35 (chord) to y=65 (apex) at the center
        expect(pixel(50, 42)[3]).toBe(255);
        expect(pixel(50, 70)[3]).toBe(0);

        renderScene(ctx, [arc], { width: CANVAS_SIZE, height: CANVAS_SIZE });
        // the half circle spans y=35 (arc top) to y=65 (chord) at the center
        expect(pixel(50, 45)[3]).toBe(255);
        expect(pixel(50, 70)[3]).toBe(0);
    });

    it('falls back to the first interpolator for an unknown color scheme name', () => {
        const layer = makeLayer('rect', {
            width: 60,
            height: 60,
            colorInterPolator: 'nope' as unknown as Layer['colorInterPolator']
        });

        renderScene(ctx, [layer], { width: CANVAS_SIZE, height: CANVAS_SIZE });

        expect(pixel(50, 50)[3]).toBe(255);
    });

    it('draws rounded rect corners through quadratic segments', () => {
        const layer = makeLayer('rect', {
            width: 60,
            height: 60,
            borderRadiusTl: 1,
            borderRadiusTr: 1,
            borderRadiusBl: 1,
            borderRadiusBr: 1
        });

        renderScene(ctx, [layer], { width: CANVAS_SIZE, height: CANVAS_SIZE });

        expectBright(pixel(50, 50));
        // the corner itself is cut by the rounding
        expect(pixel(21, 21)[3]).toBe(0);
    });

    it('renders all interpolation toggles combined without errors', () => {
        const layer = makeLayer('rect', {
            width: 60,
            height: 60,
            amount: 2,
            distance: 10,
            fillMode: 'fillStroke',
            strokeWidth: 5,
            applyColorSchemeToEachShape: true,
            gradientType: 'radial',
            calcOpacity: ['interpolate', 'flip'],
            calcStrokeWidth: ['interpolate', 'flip']
        });

        renderScene(ctx, [layer], { width: CANVAS_SIZE, height: CANVAS_SIZE });

        expect(pixel(50, 50)[3]).toBe(255);
    });

    it('strokes with the full color ramp when applyColorSchemeToEachShape is on', () => {
        const layer = makeLayer('rect', {
            width: 60,
            height: 60,
            fillMode: 'stroke',
            strokeWidth: 5,
            applyColorSchemeToEachShape: true,
            gradientType: 'linear',
            gradientAngle: 90
        });

        renderScene(ctx, [layer], { width: CANVAS_SIZE, height: CANVAS_SIZE });

        expect(pixel(21, 50)[3]).toBe(255);
    });

    it('skips degenerate zero-size instances at the repetition end', () => {
        const layer = makeLayer('polygon', { sides: 3, size: 20, amount: 2, distance: 20 });

        renderScene(ctx, [layer], { width: CANVAS_SIZE, height: CANVAS_SIZE });

        expect(pixel(50, 50)[3]).toBe(255);
    });

    it('skips custom layers with an empty path', () => {
        const layer = makeLayer('custom', { path: '', size: 60 });

        renderScene(ctx, [layer], { width: CANVAS_SIZE, height: CANVAS_SIZE });

        expect(pixel(50, 50)[3]).toBe(0);
    });

    it('skips layers with invalid custom paths', () => {
        const layer = makeLayer('custom', { path: 'not a path', size: 60 });

        renderScene(ctx, [layer], { width: CANVAS_SIZE, height: CANVAS_SIZE });

        expect(pixel(50, 50)[3]).toBe(0);
    });
});

describe('renderScene: repetition', () => {
    it('interpolates opacity along the sequence when calcOpacity includes interpolate', () => {
        const layer = makeLayer('rect', {
            width: 60,
            height: 60,
            amount: 2,
            distance: 30,
            flipColorInterpolator: false,
            calcOpacity: ['interpolate']
        });

        renderScene(ctx, [layer], { width: CANVAS_SIZE, height: CANVAS_SIZE });

        // instance k=0 (60px) has opacity 0, instance k=1 (30px) has opacity 1
        expect(pixel(23, 50)[3]).toBe(0);
        expectBright(pixel(50, 50));
    });
});

describe('renderScene: layers', () => {
    it('draws the first layer on top', () => {
        const top = makeLayer('rect', { width: 60, height: 60 });
        const bottom = makeLayer('rect', {
            width: 80,
            height: 80,
            colorInterPolator: 'interpolateGreens'
        });

        renderScene(ctx, [top, bottom], { width: CANVAS_SIZE, height: CANVAS_SIZE });

        // inside the top layer: magma bright
        expectBright(pixel(50, 50));
        // inside the bottom layer only: greens(1) is #00441b
        const bottomPixel = pixel(15, 50);
        expect(bottomPixel[0]).toBeLessThan(40);
        expect(bottomPixel[1]).toBeGreaterThan(40);
        expect(bottomPixel[1]).toBeLessThan(110);
        expect(bottomPixel[2]).toBeLessThan(60);
        expect(bottomPixel[3]).toBe(255);
    });

    it('skips hidden layers', () => {
        const layer = makeLayer('rect', { width: 60, height: 60, visible: false });

        renderScene(ctx, [layer], { width: CANVAS_SIZE, height: CANVAS_SIZE });

        expect(pixel(50, 50)[3]).toBe(0);
    });

    it('applies the layer opacity', () => {
        const layer = makeLayer('rect', { width: 60, height: 60, opacity: 0.5 });

        renderScene(ctx, [layer], { width: CANVAS_SIZE, height: CANVAS_SIZE });

        const px = pixel(50, 50);
        expect(px[3]).toBeGreaterThan(120);
        expect(px[3]).toBeLessThan(135);
    });
});

describe('renderScene: gradients', () => {
    it('fills a linear gradient from dark to bright left to right', () => {
        const layer = makeLayer('rect', {
            width: 60,
            height: 60,
            applyColorSchemeToEachShape: true,
            flipColorInterpolator: false,
            gradientType: 'linear',
            gradientAngle: 0
        });

        renderScene(ctx, [layer], { width: CANVAS_SIZE, height: CANVAS_SIZE });

        // magma(0) is near-black rgb(0, 0, 4)
        const left = pixel(23, 50);
        expect(left[0]).toBeLessThan(30);
        expect(left[1]).toBeLessThan(30);
        expect(left[2]).toBeLessThan(40);
        expect(left[3]).toBe(255);

        const right = pixel(77, 50);
        expect(right[0]).toBeGreaterThan(200);
        expect(right[3]).toBe(255);
    });

    it('fills a radial gradient from dark center to bright rim', () => {
        const layer = makeLayer('rect', {
            width: 60,
            height: 60,
            applyColorSchemeToEachShape: true,
            flipColorInterpolator: false,
            gradientType: 'radial'
        });

        renderScene(ctx, [layer], { width: CANVAS_SIZE, height: CANVAS_SIZE });

        const center = pixel(50, 50);
        expect(center[0]).toBeLessThan(30);

        const rim = pixel(77, 50);
        expect(rim[0]).toBeGreaterThan(200);
        expect(rim[3]).toBe(255);
    });
});
