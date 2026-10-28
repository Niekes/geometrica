import { describe, it, expect } from 'vitest';
import { importSvg } from '../importSvg';

describe('importSvg', () => {
    it('joins all paths of the markup into one form and drops their styles', () => {
        const markup =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480"><g fill="#808">' +
            '<path d="M0 0v120a360 360 0 0 1 360 360h120A480 480 0 0 0 0 0Z"></path>' +
            '<path d="M0 240v120a120 120 0 0 1 120 120h120A240 240 0 0 0 0 240Z"></path>' +
            '</g></svg>';

        expect(importSvg(markup)).toEqual({
            d:
                'M0 0L0 120A360 360 0 0 1 360 480L480 480A480 480 0 0 0 0 0Z' +
                'M0 240L0 360A120 120 0 0 1 120 480L240 480A240 240 0 0 0 0 240Z',
            paths: 2,
            ignored: 0
        });
    });

    it('keeps a later path that starts with a relative moveto in place', () => {
        const markup = '<svg><path d="M0 0h10"/><path d="m20 20 5 0"/></svg>';

        expect(importSvg(markup)).toMatchObject({ d: 'M0 0L10 0M20 20L25 20' });
    });

    it('counts drawn shapes other than paths as ignored, but not metadata', () => {
        const markup =
            '<svg><title>Icon</title><rect width="4" height="4"/><circle r="2"/>' +
            '<path d="M0 0h10"/></svg>';

        expect(importSvg(markup)).toEqual({ d: 'M0 0L10 0', paths: 1, ignored: 2 });
    });

    it('rejects a transform on a path or its group rather than misplace the path', () => {
        const onPath = '<svg><path transform="rotate(45)" d="M0 0h10"/></svg>';
        const onGroup = '<svg><g transform="translate(5 0)"><path d="M0 0h10"/></g></svg>';

        expect(importSvg(onPath)).toHaveProperty('error');
        expect(importSvg(onGroup)).toHaveProperty('error');
    });

    it('rejects markup without usable path data', () => {
        expect(importSvg('<svg><rect width="4" height="4"/></svg>')).toHaveProperty('error');
        expect(importSvg('<svg><path d="nonsense"/></svg>')).toHaveProperty('error');
    });

    it('counts a path without usable path data as ignored', () => {
        const markup = '<svg><path d="nonsense"/><path d="M0 0h10"/></svg>';

        expect(importSvg(markup)).toEqual({ d: 'M0 0L10 0', paths: 1, ignored: 1 });
    });

    it('leaves out definitions, which are never drawn, such as the clip paths of Figma exports', () => {
        const markup =
            '<svg><g clip-path="url(#clip)"><path d="M0 0h10"/></g>' +
            '<defs><clipPath id="clip"><rect width="4" height="4"/><path d="M5 5h1"/></clipPath>' +
            '<mask id="mask"><path d="M7 7h1"/></mask></defs></svg>';

        expect(importSvg(markup)).toEqual({ d: 'M0 0L10 0', paths: 1, ignored: 0 });
    });
});
