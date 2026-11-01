import { describe, it, expect } from 'vitest';
import { embedMetadata } from '../embedMetadata';
import { renderScene } from '../renderScene';
import { defaultBackground } from '../../config/defaults';

const DC = 'http://purl.org/dc/elements/1.1/';

function embed(link: string): Document {
    const svg = renderScene({ background: defaultBackground, layers: [] });
    const markup = embedMetadata(svg, {
        link,
        date: new Date('2026-11-01T12:00:00Z'),
        creator: 'Geometrica 1.2.0'
    });

    return new DOMParser().parseFromString(markup, 'image/svg+xml');
}

const field = (doc: Document, name: string) => doc.getElementsByTagNameNS(DC, name)[0]?.textContent;

describe('embedMetadata', () => {
    it('carries link, date and creator as Dublin Core in the svg metadata', () => {
        const doc = embed('https://example.org/geometrica/?c=abc');

        expect(doc.documentElement.firstElementChild?.tagName).toBe('metadata');
        expect(field(doc, 'source')).toBe('https://example.org/geometrica/?c=abc');
        expect(field(doc, 'date')).toBe('2026-11-01T12:00:00.000Z');
        expect(field(doc, 'creator')).toBe('Geometrica 1.2.0');
    });

    it('escapes markup characters so the file stays well-formed', () => {
        const doc = embed('https://example.org/a&b<c>/?c=x');

        expect(doc.querySelector('parsererror')).toBeNull();
        expect(field(doc, 'source')).toBe('https://example.org/a&b<c>/?c=x');
    });
});
