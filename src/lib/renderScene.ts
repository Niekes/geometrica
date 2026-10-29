import { color } from 'd3';
import { computeInstances, type Instance } from './computeInstances';
import {
    type Command,
    flattenPath,
    getPathBounds,
    normalizePath,
    type PathBounds,
    parsePath,
    round,
    serializePath
} from './pathBounds';
import { type SceneState } from './urlState';
import { colorInterPolators } from '../config/colorInterPolators';
import { type Background, defaultBackground } from '../config/defaults';
import { surfaceSize } from '../config/surface';
import { type Layer } from '../types/Layer';

const PI = Math.PI;
const TAU = PI * 2;
// keeps the sharp corners of existing artworks; SVG would default to 4
const MITER_LIMIT = 10;

type Geometry = {
    commands: Command[];
    width: number;
    height: number;
};

export function renderScene({ background, layers }: SceneState): string {
    const fill = backgroundFill(background);
    const rx = round((background.borderRadius / 100) * surfaceSize);
    const surfaceAttributes = `width="${surfaceSize}" height="${surfaceSize}" rx="${rx}"`;
    const fillOpacity =
        background.opacity < 1 ? ` fill-opacity="${round(background.opacity)}"` : '';

    // the first layer is the topmost one and is drawn last
    const defs: string[] = [];
    const content = [...layers]
        .reverse()
        .filter((layer) => layer.visible)
        .map((layer, index) => renderLayer(layer, `g${index}`, defs))
        .join('');

    return (
        `<svg xmlns="http://www.w3.org/2000/svg" width="${surfaceSize}" height="${surfaceSize}" viewBox="0 0 ${surfaceSize} ${surfaceSize}">` +
        `<defs><clipPath id="surface"><rect ${surfaceAttributes}/></clipPath>${defs.join('')}</defs>` +
        `<rect ${surfaceAttributes} fill="${fill}"${fillOpacity}/>` +
        `<g clip-path="url(#surface)">${content}</g>` +
        `</svg>`
    );
}

// the background color comes from the URL and ends up in the DOM: only a parsed color passes
export function backgroundFill(background: Background): string {
    return color(background.color)?.formatHex() ?? defaultBackground.color;
}

// the frame around every instance as drawn, in surface units with y pointing down
export function layerBounds(layer: Layer): PathBounds | null {
    const frame = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    const include = ([x, y]: [number, number], reach: number) => {
        frame.minX = Math.min(frame.minX, x - reach);
        frame.minY = Math.min(frame.minY, y - reach);
        frame.maxX = Math.max(frame.maxX, x + reach);
        frame.maxY = Math.max(frame.maxY, y + reach);
    };

    for (const instance of computeInstances(layer)) {
        const geometry = buildGeometry(layer, instance.shrink);

        if (!geometry) continue;

        const { x, y, rotation } = placeInstance(layer, instance);
        const width = layer.strokeOpacity > 0 ? instanceStrokeWidth(layer, instance) : 0;
        const turned = geometry.commands.map((command) => rotateCommand(command, rotation));

        for (const subpath of flattenPath(turned)) {
            const points = subpath.points.map(([px, py]): [number, number] => [x + px, y + py]);

            // a stroke reaches half its width beyond the path, and further at a mitered corner
            points.forEach((point) => include(point, width / 2));

            if (layer.strokeJoin === 'miter') {
                miterTips(points, subpath.closed, width).forEach((tip) => include(tip, 0));
            }
        }
    }

    return frame.minX === Infinity ? null : frame;
}

// ponytail: sampled curve points count as corners, so a cusp within a curve gets a tip it lacks
function miterTips(points: [number, number][], closed: boolean, width: number): [number, number][] {
    const run = points.filter((p, i) => i === 0 || !samePoint(p, points[i - 1]!));

    if (closed && samePoint(run[0]!, run[run.length - 1]!)) run.pop();

    // a closed subpath turns a corner at every point, an open one between its ends
    const ring = closed ? [run[run.length - 1]!, ...run, run[0]!] : run;

    return ring.slice(1, -1).flatMap((p, i) => miterTip(ring[i]!, p, ring[i + 2]!, width));
}

// a sharp corner juts out along its bisector by the width over twice the sine of half its angle,
// until SVG bevels it past the miter limit; a bevel stays within half the width
function miterTip(
    from: [number, number],
    [px, py]: [number, number],
    to: [number, number],
    width: number
): [number, number][] {
    const [ux, uy] = direction(from, [px, py]);
    const [vx, vy] = direction([px, py], to);
    // twice the sine of half the corner angle, and the length of the outward bisector
    const sine2 = Math.hypot(ux + vx, uy + vy);
    const outward = Math.hypot(ux - vx, uy - vy);

    if (outward === 0 || 2 / sine2 > MITER_LIMIT) return [];

    return [
        [px + ((ux - vx) / outward) * (width / sine2), py + ((uy - vy) / outward) * (width / sine2)]
    ];
}

// sampled arcs miss their endpoints by a rounding error, which must not read as a corner
const samePoint = ([ax, ay]: [number, number], [bx, by]: [number, number]): boolean =>
    Math.hypot(ax - bx, ay - by) < 1e-6;

function direction([ax, ay]: [number, number], [bx, by]: [number, number]): [number, number] {
    const length = Math.hypot(bx - ax, by - ay);

    return [(bx - ax) / length, (by - ay) / length];
}

// turning around the rotation center swings the instance center along a circle around it,
// while the polygon offset only turns the shape in place
function placeInstance(
    layer: Layer,
    { angle }: Instance
): { x: number; y: number; rotation: number } {
    const cx = surfaceSize / 2 + layer.cx;
    const cy = surfaceSize / 2 - layer.cy;
    // the rotation center is an offset from the position; svg counts y downwards
    const ox = layer.rotationCx;
    const oy = -layer.rotationCy;
    const polygonOffset = layer.shape === 'polygon' ? -PI / 2 : 0;

    return {
        x: round(cx + ox - (ox * Math.cos(angle) - oy * Math.sin(angle))),
        y: round(cy + oy - (ox * Math.sin(angle) + oy * Math.cos(angle))),
        rotation: round(((angle + polygonOffset) * 180) / PI)
    };
}

function renderLayer(layer: Layer, idPrefix: string, defs: string[]): string {
    const colorIp = resolveInterpolator(layer);

    let markup = '';

    for (const instance of computeInstances(layer)) {
        const geometry = buildGeometry(layer, instance.shrink);

        if (!geometry) continue;

        let paint = instanceColor(layer, instance, colorIp);

        if (layer.applyColorSchemeToEachShape) {
            const id = `${idPrefix}-${instance.index}`;

            defs.push(buildGradient(id, layer, geometry, colorIp));
            paint = `url(#${id})`;
        }

        const instanceOpacity = layer.opacity * sequenceOpacity(layer, instance);
        const { x, y, rotation } = placeInstance(layer, instance);

        let attributes = `transform="translate(${x} ${y}) rotate(${rotation})"`;

        // a zero opacity drops the paint entirely, so exports carry no invisible fills or strokes
        attributes +=
            layer.fillOpacity > 0
                ? ` fill="${paint}" fill-opacity="${round(instanceOpacity * layer.fillOpacity)}"`
                : ' fill="none"';

        if (layer.strokeOpacity > 0) {
            attributes += ` stroke="${paint}" stroke-opacity="${round(instanceOpacity * layer.strokeOpacity)}" stroke-width="${round(instanceStrokeWidth(layer, instance))}"`;

            // miter is the SVG default, so existing exports keep their markup; a limit only
            // applies to it
            attributes +=
                layer.strokeJoin === 'miter'
                    ? ` stroke-miterlimit="${MITER_LIMIT}"`
                    : ` stroke-linejoin="${layer.strokeJoin}"`;
        }

        markup += `<path d="${serializePath(geometry.commands)}" ${attributes}/>`;
    }

    return markup;
}

function resolveInterpolator(layer: Layer): (t: number) => string {
    return (
        colorInterPolators.find((c) => layer.colorInterPolator === c.name) ?? colorInterPolators[0]!
    ).fn;
}

const hex = (value: string): string => color(value)?.formatHex() ?? '#000';

function instanceColor(layer: Layer, instance: Instance, colorIp: (t: number) => string): string {
    return hex(colorIp(layer.flipColorInterpolator ? instance.flippedK : instance.k));
}

// one complete gradient per instance: design tools do not reliably resolve shared stops
function buildGradient(
    id: string,
    layer: Layer,
    geometry: Geometry,
    colorIp: (t: number) => string
): string {
    const r = round(Math.max(geometry.width, geometry.height) / 2);

    let stops = '';

    for (let j = 0; j <= 10; j += 1) {
        const t = j / 10;
        stops += `<stop offset="${t}" stop-color="${hex(colorIp(layer.flipColorInterpolator ? 1 - t : t))}"/>`;
    }

    if (layer.gradientType === 'radial') {
        return `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="${r}">${stops}</radialGradient>`;
    }

    const theta = (layer.gradientAngle * PI) / 180;
    const x = round(r * Math.cos(theta));
    const y = round(r * Math.sin(theta));

    return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${-x}" y1="${-y}" x2="${x}" y2="${y}">${stops}</linearGradient>`;
}

// opacity applies per instance, never to the layer as a group, so overlapping instances add up
function sequenceOpacity(layer: Layer, instance: Instance): number {
    if (!layer.calcOpacity.includes('interpolate')) return 1;

    return layer.calcOpacity.includes('flip') ? instance.flippedK : instance.k;
}

function instanceStrokeWidth(layer: Layer, instance: Instance): number {
    const interpolate = layer.calcStrokeWidth.includes('interpolate');
    const flip = layer.calcStrokeWidth.includes('flip');
    const base = flip ? instance.flippedK : instance.k;

    return interpolate || flip ? layer.strokeWidth * base : layer.strokeWidth;
}

function buildGeometry(layer: Layer, shrink: number): Geometry | null {
    switch (layer.shape) {
        case 'rect':
            return buildRectGeometry(layer, shrink);
        case 'circle':
            return buildCircleGeometry(layer, shrink);
        case 'polygon':
            return buildPolygonGeometry(layer, shrink);
        case 'custom':
            return buildCustomGeometry(layer, shrink);
    }
}

function withBounds(commands: Command[]): Geometry | null {
    const bounds = getPathBounds(commands);

    if (!bounds) return null;

    return {
        commands,
        width: bounds.maxX - bounds.minX,
        height: bounds.maxY - bounds.minY
    };
}

function buildRectGeometry(layer: Layer, shrink: number): Geometry | null {
    const width = layer.width - shrink;
    const height = layer.height - shrink;

    if (width < 0 || height < 0) return null;

    const x = -width / 2;
    const y = -height / 2;
    const minDim = Math.min(width, height);
    const brTl = (layer.borderRadiusTl * minDim) / 2;
    const brTr = (layer.borderRadiusTr * minDim) / 2;
    const brBl = (layer.borderRadiusBl * minDim) / 2;
    const brBr = (layer.borderRadiusBr * minDim) / 2;

    const commands: Command[] = [
        { cmd: 'M', x: x + brTl, y },
        { cmd: 'L', x: x + width - brTr, y },
        { cmd: 'Q', x1: x + width, y1: y, x: x + width, y: y + brTr },
        { cmd: 'L', x: x + width, y: y + height - brBr },
        { cmd: 'Q', x1: x + width, y1: y + height, x: x + width - brBr, y: y + height },
        { cmd: 'L', x: x + brBl, y: y + height },
        { cmd: 'Q', x1: x, y1: y + height, x, y: y + height - brBl },
        { cmd: 'L', x, y: y + brTl },
        { cmd: 'Q', x1: x, y1: y, x: x + brTl, y },
        { cmd: 'Z' }
    ];

    return { commands, width, height };
}

function buildCircleGeometry(layer: Layer, shrink: number): Geometry | null {
    const rx = (layer.radiusX - shrink) / 2;
    const ry = (layer.radiusY - shrink) / 2;

    if (rx <= 0 || ry <= 0) return null;

    const arc = (x: number): Command => ({
        cmd: 'A',
        rx,
        ry,
        rot: 0,
        largeArc: 1,
        sweep: 1,
        x,
        y: 0
    });

    return {
        commands: [{ cmd: 'M', x: rx, y: 0 }, arc(-rx), arc(rx), { cmd: 'Z' }],
        width: rx * 2,
        height: ry * 2
    };
}

function buildPolygonGeometry(layer: Layer, shrink: number): Geometry | null {
    const s = (layer.size - shrink) / 2;

    if (s <= 0) return null;

    const br = Math.min(layer.borderRadius * 100, s / 2);
    const alpha = ((layer.sides - 2) * PI) / layer.sides;
    const epsilon = s - br / Math.sin(alpha / 2);
    const beta = TAU / layer.sides;
    const gamma = (PI - alpha) / 2;

    const commands: Command[] = [];

    for (let i = 0; i < layer.sides; i += 1) {
        const delta = i * beta;
        const ox = epsilon * Math.cos(delta);
        const oy = epsilon * Math.sin(delta);

        const startAngle = delta - gamma;
        const sx = ox + br * Math.cos(startAngle);
        const sy = oy + br * Math.sin(startAngle);

        const endAngle = delta + gamma;
        const ex = ox + br * Math.cos(endAngle);
        const ey = oy + br * Math.sin(endAngle);

        commands.push(i === 0 ? { cmd: 'M', x: sx, y: sy } : { cmd: 'L', x: sx, y: sy });
        commands.push({
            cmd: 'A',
            rx: br,
            ry: br,
            rot: 0,
            largeArc: 0,
            sweep: 1,
            x: ex,
            y: ey
        });
    }

    commands.push({ cmd: 'Z' });

    return withBounds(commands);
}

function buildCustomGeometry(layer: Layer, shrink: number): Geometry | null {
    if (!layer.path) return null;

    const normalized = normalizePath(layer.path, layer.size);

    if (!normalized) return null;

    const scale = (layer.size - shrink) / layer.size;

    const commands: Command[] = parsePath(normalized.d).map((command) =>
        scaleCommand(command, scale)
    );

    return {
        commands,
        width: normalized.width * scale,
        height: normalized.height * scale
    };
}

function scaleCommand(command: Command, scale: number): Command {
    const scaled = mapPoints(command, (x, y) => [x * scale, y * scale]);

    return scaled.cmd === 'A'
        ? { ...scaled, rx: scaled.rx * scale, ry: scaled.ry * scale }
        : scaled;
}

function rotateCommand(command: Command, degrees: number): Command {
    const cos = Math.cos((degrees * PI) / 180);
    const sin = Math.sin((degrees * PI) / 180);
    const rotated = mapPoints(command, (x, y) => [x * cos - y * sin, x * sin + y * cos]);

    // an arc keeps its radii and turns its axis along
    return rotated.cmd === 'A' ? { ...rotated, rot: rotated.rot + degrees } : rotated;
}

function mapPoints(command: Command, map: (x: number, y: number) => [number, number]): Command {
    switch (command.cmd) {
        case 'M':
        case 'L':
        case 'A': {
            const [x, y] = map(command.x, command.y);

            return { ...command, x, y };
        }
        case 'C': {
            const [x1, y1] = map(command.x1, command.y1);
            const [x2, y2] = map(command.x2, command.y2);
            const [x, y] = map(command.x, command.y);

            return { ...command, x1, y1, x2, y2, x, y };
        }
        case 'Q': {
            const [x1, y1] = map(command.x1, command.y1);
            const [x, y] = map(command.x, command.y);

            return { ...command, x1, y1, x, y };
        }
        case 'Z':
            return command;
    }
}
