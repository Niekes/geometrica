import { color } from 'd3';
import { computeInstances, type Instance } from './computeInstances';
import {
    type Command,
    getPathBounds,
    normalizePath,
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

type Geometry = {
    commands: Command[];
    width: number;
    height: number;
};

export function renderScene({ background, layers }: SceneState): string {
    const fill = backgroundFill(background);
    const rx = round((background.borderRadius / 100) * surfaceSize);
    const surfaceAttributes = `width="${surfaceSize}" height="${surfaceSize}" rx="${rx}"`;
    const fillOpacity = background.opacity < 1 ? ` fill-opacity="${round(background.opacity)}"` : '';

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

function renderLayer(layer: Layer, idPrefix: string, defs: string[]): string {
    const cx = round(surfaceSize / 2 + layer.cx);
    const cy = round(surfaceSize / 2 - layer.cy);
    const colorIp = resolveInterpolator(layer);
    const polygonOffset = layer.shape === 'polygon' ? -PI / 2 : 0;

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
        const rotation = round(((instance.angle + polygonOffset) * 180) / PI);

        let attributes = `transform="translate(${cx} ${cy}) rotate(${rotation})"`;

        // a zero opacity drops the paint entirely, so exports carry no invisible fills or strokes
        attributes +=
            layer.fillOpacity > 0
                ? ` fill="${paint}" fill-opacity="${round(instanceOpacity * layer.fillOpacity)}"`
                : ' fill="none"';

        // miter limit 10 keeps the sharp corners of existing artworks; SVG would default to 4
        if (layer.strokeOpacity > 0) {
            attributes += ` stroke="${paint}" stroke-opacity="${round(instanceOpacity * layer.strokeOpacity)}" stroke-width="${round(instanceStrokeWidth(layer, instance))}" stroke-miterlimit="10"`;
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
    switch (command.cmd) {
        case 'M':
        case 'L':
            return { ...command, x: command.x * scale, y: command.y * scale };
        case 'C':
            return {
                ...command,
                x1: command.x1 * scale,
                y1: command.y1 * scale,
                x2: command.x2 * scale,
                y2: command.y2 * scale,
                x: command.x * scale,
                y: command.y * scale
            };
        case 'Q':
            return {
                ...command,
                x1: command.x1 * scale,
                y1: command.y1 * scale,
                x: command.x * scale,
                y: command.y * scale
            };
        case 'A':
            return {
                ...command,
                rx: command.rx * scale,
                ry: command.ry * scale,
                x: command.x * scale,
                y: command.y * scale
            };
        case 'Z':
            return command;
    }
}
