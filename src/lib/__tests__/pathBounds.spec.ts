import { describe, it, expect } from 'vitest';
import { parsePath, getPathBounds, normalizePath } from '../pathBounds';

describe('getPathBounds', () => {
    it('computes bounds of straight lines', () => {
        const bounds = getPathBounds(parsePath('M0 0 L10 0 L10 10 Z'));

        expect(bounds).toEqual({ minX: 0, minY: 0, maxX: 10, maxY: 10 });
    });

    it('handles relative commands', () => {
        const bounds = getPathBounds(parsePath('M2 3 l4 0 l0 5'));

        expect(bounds).toEqual({ minX: 2, minY: 3, maxX: 6, maxY: 8 });
    });

    it('handles h and v commands', () => {
        const bounds = getPathBounds(parsePath('M1 1 h8 v6 h-8 z'));

        expect(bounds).toEqual({ minX: 1, minY: 1, maxX: 9, maxY: 7 });
    });

    it('bounds a cubic curve at its extreme point', () => {
        // y(t) = 30t(1-t) has its maximum 7.5 at t = 0.5
        const bounds = getPathBounds(parsePath('M0 0 C0 10 10 10 10 0'));

        expect(bounds).toEqual({ minX: 0, minY: 0, maxX: 10, maxY: 7.5 });
    });

    it('bounds a quadratic curve at its extreme point', () => {
        // y(t) = 20t(1-t) has its maximum 5 at t = 0.5
        const bounds = getPathBounds(parsePath('M0 0 Q5 10 10 0'));

        expect(bounds).toEqual({ minX: 0, minY: 0, maxX: 10, maxY: 5 });
    });

    it('bounds a half circle arc bulging upwards', () => {
        // A 5 5 ... 1 sweeps clockwise over the top point (5, -5)
        const bounds = getPathBounds(parsePath('M0 0 A5 5 0 0 1 10 0'));

        expect(bounds!.minX).toBeCloseTo(0);
        expect(bounds!.minY).toBe(-5);
        expect(bounds!.maxX).toBe(10);
        expect(bounds!.maxY).toBeCloseTo(0);
    });

    it('handles multiple subpaths', () => {
        const bounds = getPathBounds(parsePath('M0 0 L1 1 M5 5 L8 8'));

        expect(bounds).toEqual({ minX: 0, minY: 0, maxX: 8, maxY: 8 });
    });
});

describe('normalizePath', () => {
    it('scales a square path to the target size and centers it on the origin', () => {
        const result = normalizePath('M0 0 L10 0 L10 10 Z', 100);

        expect(result).not.toBeNull();
        const bounds = getPathBounds(parsePath(result!.d));
        expect(bounds).toEqual({ minX: -50, minY: -50, maxX: 50, maxY: 50 });
        expect(result!.width).toBe(100);
        expect(result!.height).toBe(100);
    });

    it('scales a non-square path by its larger side and centers it', () => {
        const result = normalizePath('M0 0 L10 0 L10 4 Z', 50);

        expect(result).not.toBeNull();
        const bounds = getPathBounds(parsePath(result!.d));
        expect(bounds!.minX).toBeCloseTo(-25);
        expect(bounds!.maxX).toBeCloseTo(25);
        expect(bounds!.minY).toBeCloseTo(-10);
        expect(bounds!.maxY).toBeCloseTo(10);
        expect(result!.width).toBe(50);
        expect(result!.height).toBe(20);
    });

    it('returns null for invalid path data', () => {
        expect(normalizePath('hello', 100)).toBeNull();
        expect(normalizePath('M 0 0 C 1 2', 100)).toBeNull();
        expect(normalizePath('', 100)).toBeNull();
    });
});
