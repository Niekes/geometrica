import { describe, it, expect } from 'vitest';
import { computeInstances, baseDimension } from '../computeInstances';
import { buildLayer } from '../../config/defaults';
import { surfaceSize } from '../../config/surface';

describe('computeInstances', () => {
    it('returns one instance with k=0 and no rotation for amount=1', () => {
        const layer = { ...buildLayer('rect'), amount: 1 };

        const instances = computeInstances(layer);

        expect(instances).toEqual([{ index: 0, k: 0, flippedK: 1, angle: 0, shrink: 0 }]);
    });

    it('spreads k and rotation evenly across the repetition', () => {
        const layer = {
            ...buildLayer('polygon'),
            amount: 3,
            distance: 10,
            rotation: 90,
            size: 25
        };

        const instances = computeInstances(layer);

        expect(instances).toEqual([
            { index: 0, k: 0, flippedK: 1, angle: 0, shrink: 0 },
            { index: 1, k: 0.5, flippedK: 0.5, angle: Math.PI / 4, shrink: 10 },
            { index: 2, k: 1, flippedK: 0, angle: Math.PI / 2, shrink: 20 }
        ]);
    });

    it('stops the repetition when the base dimension is exhausted', () => {
        const layer = {
            ...buildLayer('rect'),
            amount: 10,
            distance: 10,
            width: 25,
            height: 40
        };

        const instances = computeInstances(layer);

        expect(instances.length).toBe(3);
        expect(instances[2]).toEqual({
            index: 2,
            k: 2 / 9,
            flippedK: 7 / 9,
            angle: 0,
            shrink: 20
        });
    });

    it('keeps growing instances for negative distance', () => {
        const layer = {
            ...buildLayer('polygon'),
            amount: 3,
            distance: -10,
            size: 25
        };

        const instances = computeInstances(layer);

        expect(instances.length).toBe(3);
        expect(instances[2]!.shrink).toBe(-20);
    });
});

describe('baseDimension', () => {
    it('uses the smaller side for rects', () => {
        const layer = { ...buildLayer('rect'), width: 25, height: 40 };

        expect(baseDimension(layer)).toBe(25);
    });

    it('uses the smaller radius for circles', () => {
        const layer = { ...buildLayer('circle'), radiusX: 60, radiusY: 40 };

        expect(baseDimension(layer)).toBe(40);
    });

    it('uses size for polygons and custom shapes', () => {
        const polygon = { ...buildLayer('polygon'), size: surfaceSize / 2 };
        const custom = { ...buildLayer('custom'), size: 100 };

        expect(baseDimension(polygon)).toBe(polygon.size);
        expect(baseDimension(custom)).toBe(custom.size);
    });
});
