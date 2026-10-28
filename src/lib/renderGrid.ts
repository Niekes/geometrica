import { interpolateRgb, lab } from 'd3';
import { type Background } from '../config/defaults';
import { surfaceSize } from '../config/surface';
import { backgroundFill } from './renderScene';

const cell = surfaceSize / 32;
const center = surfaceSize / 2;

// vector-effect is not inherited, so every shape carries it to stay one screen pixel wide
const nonScaling = 'vector-effect="non-scaling-stroke"';

// material product icon keylines (circle 176, square 152, rectangles 128 × 176 on 192) keep a
// padding of 1⅓ cells; rounded to 1 cell, every keyline lies on a grid line
const outerKeyline = surfaceSize - 2 * cell;
const keylines =
    `<circle cx="${center}" cy="${center}" r="${outerKeyline / 2}" ${nonScaling}/>` +
    `<circle cx="${center}" cy="${center}" r="${surfaceSize / 4}" ${nonScaling}/>` +
    keylineRect(surfaceSize - 6 * cell, surfaceSize - 6 * cell) +
    keylineRect(surfaceSize - 10 * cell, outerKeyline) +
    keylineRect(outerKeyline, surfaceSize - 10 * cell);

const fine: string[] = [];
const major: string[] = [];
const strong: string[] = [
    line(0, 0, surfaceSize, surfaceSize),
    line(surfaceSize, 0, 0, surfaceSize),
    keylines
];

for (let at = cell; at < surfaceSize; at += cell) {
    const group = at === center ? strong : at % (4 * cell) === 0 ? major : fine;

    group.push(line(at, 0, at, surfaceSize), line(0, at, surfaceSize, at));
}

// the geometry never changes; only the line color follows the background
const shapes =
    `<g stroke-opacity="0.1">${fine.join('')}</g>` +
    `<g stroke-opacity="0.2">${major.join('')}</g>` +
    `<g stroke-opacity="0.4">${strong.join('')}</g>`;

function line(x1: number, y1: number, x2: number, y2: number): string {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${nonScaling}/>`;
}

function keylineRect(width: number, height: number): string {
    return `<rect x="${(surfaceSize - width) / 2}" y="${(surfaceSize - height) / 2}" width="${width}" height="${height}" rx="${cell}" ${nonScaling}/>`;
}

// positions count from the center, which lies on a grid line, so the lines sit at multiples of a
// cell; the pull reaches a quarter cell, so positions between the lines stay reachable. The anchor
// pulls first, so a rotation center finds back onto its layer's position between the lines
export function snapToGrid(position: number, anchor = 0): number {
    const pull = cell / 4;

    if (Math.abs(position - anchor) < pull) return anchor;

    const nearest = Math.round(position / cell) * cell;

    return Math.abs(position - nearest) < pull ? nearest : position;
}

export function renderGrid(background: Background): string {
    return (
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${surfaceSize} ${surfaceSize}" fill="none" stroke="${lineColor(background)}" stroke-width="1">` +
        shapes +
        `</svg>`
    );
}

// a translucent background shows the light transparency pattern, so it is mixed over white
export function lineColor(background: Background): string {
    const mixed = interpolateRgb('#fff', backgroundFill(background))(background.opacity);

    return lab(mixed).l > 50 ? '#000' : '#fff';
}
