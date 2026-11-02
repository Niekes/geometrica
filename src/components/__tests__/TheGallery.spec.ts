import { describe, it, expect } from 'vitest';
import { readdirSync } from 'node:fs';
import { gallery } from '@/config/gallery';

describe('the gallery', () => {
    it('names each artwork once and has exactly one thumbnail per name', () => {
        const names = gallery.map(({ name }) => name);
        const thumbnails = readdirSync('public/gallery').map((file) => file.replace('.avif', ''));

        expect(new Set(names).size).toBe(names.length);
        expect(thumbnails.sort()).toEqual(
            names.map((name) => name.toLowerCase().replace(/ /g, '-')).sort()
        );
    });
});
