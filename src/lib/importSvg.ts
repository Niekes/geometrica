import { parsePath, serializePath } from './pathBounds';

export type SvgImport = { d: string; paths: number; ignored: number } | { error: string };

// drawn shapes that are not converted to path data; they are only counted
const OTHER_SHAPES = 'rect, circle, ellipse, line, polyline, polygon, text, use, image';

// content of these elements is never drawn by itself, e.g. the clip paths of Figma exports
const DEFINITIONS = 'defs, clipPath, mask, symbol, pattern, marker';

export function importSvg(markup: string): SvgImport {
    // the HTML parser forgives what strict XML rejects, e.g. an undeclared xlink prefix
    const doc = new DOMParser().parseFromString(markup, 'text/html');
    const drawn = (selector: string) =>
        [...doc.querySelectorAll(selector)].filter((element) => !element.closest(DEFINITIONS));
    const elements = drawn('path');

    // ponytail: transforms are rejected, not applied; apply them when pasted SVGs need it
    if (elements.some((path) => path.closest('[transform]'))) {
        return { error: 'Transforms are not supported. Flatten them in your editor first.' };
    }

    // every path is parsed on its own, so a leading relative moveto starts from the origin
    const parsed = elements
        .map((path) => parsePath(path.getAttribute('d') ?? ''))
        .filter((commands) => commands.length > 0);

    if (parsed.length === 0) return { error: 'No <path> with valid path data found.' };

    return {
        d: serializePath(parsed.flat()),
        paths: parsed.length,
        ignored: drawn(OTHER_SHAPES).length + elements.length - parsed.length
    };
}
