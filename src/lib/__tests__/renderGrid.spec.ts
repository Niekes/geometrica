import { describe, it, expect } from 'vitest';
import { renderGrid, snapToGrid } from '../renderGrid';
import { type Background, defaultBackground } from '../../config/defaults';

function render(background: Partial<Background> = {}): Element {
    const markup = renderGrid({ ...defaultBackground, ...background });
    const svg = new DOMParser().parseFromString(markup, 'image/svg+xml').documentElement;

    expect(svg.tagName).toBe('svg');

    return svg;
}

function strength(element: Element): number {
    return Number(element.closest('[stroke-opacity]')?.getAttribute('stroke-opacity'));
}

describe('renderGrid', () => {
    it('draws dark lines on a light background and light lines on a dark one', () => {
        expect(render({ color: '#f0f0f0' }).getAttribute('stroke')).toBe('#000');
        expect(render({ color: '#101010' }).getAttribute('stroke')).toBe('#fff');
    });

    it('treats a translucent background as lightened by the transparency pattern behind it', () => {
        expect(render({ color: '#000', opacity: 0.2 }).getAttribute('stroke')).toBe('#000');
        expect(render({ color: '#000', opacity: 0.8 }).getAttribute('stroke')).toBe('#fff');
    });

    it('draws light lines on the black fallback for a background color that is not a color', () => {
        expect(render({ color: 'not-a-color' }).getAttribute('stroke')).toBe('#fff');
    });

    it('keeps every line one screen pixel wide at any display size', () => {
        const svg = render();
        const shapes = [...svg.querySelectorAll('line, circle, rect')];

        expect(svg.getAttribute('stroke-width')).toBe('1');
        expect(shapes.length).toBeGreaterThan(0);
        expect(
            shapes.filter((shape) => shape.getAttribute('vector-effect') !== 'non-scaling-stroke')
        ).toEqual([]);
    });

    it('draws a line every cell, a stronger one every fourth and the axes as strong as the keylines', () => {
        const svg = render();
        const lines = [...svg.querySelectorAll('line')].map((line) => ({
            from: [Number(line.getAttribute('x1')), Number(line.getAttribute('y1'))],
            to: [Number(line.getAttribute('x2')), Number(line.getAttribute('y2'))],
            strength: strength(line)
        }));
        const vertical = (x: number) =>
            lines.find((line) => line.from[0] === x && line.to[0] === x)?.strength;
        const horizontal = (y: number) =>
            lines.find((line) => line.from[1] === y && line.to[1] === y)?.strength;

        for (let at = 32; at < 1024; at += 32) {
            expect(vertical(at)).toBeDefined();
            expect(horizontal(at)).toBeDefined();
        }

        const keyline = strength(svg.querySelector('circle')!);

        expect(vertical(32)).toBeLessThan(vertical(128)!);
        expect(vertical(128)).toBeLessThan(keyline);
        expect(horizontal(96)).toBe(vertical(32));
        expect(horizontal(384)).toBe(vertical(128));
        expect(vertical(512)).toBe(keyline);
        expect(horizontal(512)).toBe(keyline);
        expect(lines).toContainEqual({ from: [0, 0], to: [1024, 1024], strength: keyline });
        expect(lines).toContainEqual({ from: [1024, 0], to: [0, 1024], strength: keyline });
    });

    it('draws the keylines in material proportions, rounded to whole cells', () => {
        const svg = render();
        const attributes = (element: Element, names: string[]) =>
            names.map((name) => Number(element.getAttribute(name)));

        expect(
            [...svg.querySelectorAll('circle')].map((c) => attributes(c, ['cx', 'cy', 'r']))
        ).toEqual([
            [512, 512, 480],
            [512, 512, 256]
        ]);
        expect(
            [...svg.querySelectorAll('rect')].map((r) =>
                attributes(r, ['x', 'y', 'width', 'height', 'rx'])
            )
        ).toEqual([
            [96, 96, 832, 832, 32],
            [160, 32, 704, 960, 32],
            [32, 160, 960, 704, 32]
        ]);
    });
});

describe('snapToGrid', () => {
    it('snaps a position within a quarter cell to the nearest grid line', () => {
        expect(snapToGrid(37)).toBe(32);
        expect(snapToGrid(-60)).toBe(-64);
    });

    it('leaves a position between grid lines free', () => {
        expect(snapToGrid(48)).toBe(48);
        expect(snapToGrid(-23)).toBe(-23);
    });
});
