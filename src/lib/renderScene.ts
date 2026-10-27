import { color } from 'd3';
import { computeInstances } from './computeInstances';
import { type Command, getPathBounds, normalizePath, parsePath } from './pathBounds';
import { tracePath } from './tracePath';
import { canvasHeight, canvasWidth } from '../config/canvas';
import { colorInterPolators } from '../config/colorInterPolators';
import { type Layer } from '../types/Layer';

const PI = Math.PI;
const TAU = PI * 2;

export type SceneOptions = {
    width?: number;
    height?: number;
};

type Geometry = {
    commands: Command[];
    width: number;
    height: number;
};

export function renderScene(
    ctx: CanvasRenderingContext2D,
    layers: Layer[],
    options: SceneOptions = {}
): void {
    const width = options.width ?? canvasWidth / 2;
    const height = options.height ?? canvasHeight / 2;

    ctx.clearRect(0, 0, width, height);

    // the first layer is the topmost one and is drawn last
    for (let i = layers.length - 1; i >= 0; i -= 1) {
        const layer = layers[i];

        if (!layer || !layer.visible) continue;

        renderLayer(ctx, layer, width, height);
    }
}

function renderLayer(
    ctx: CanvasRenderingContext2D,
    layer: Layer,
    width: number,
    height: number
): void {
    const cx = width / 2 + layer.cx;
    const cy = height / 2 + layer.cy * -1;

    const colorIp = (colorInterPolators.find((c) => layer.colorInterPolator === c.name)?.fn ??
        colorInterPolators[0]?.fn ??
        ((t: number) => '#000')) as (t: number) => string;

    const interpolateOpacity = layer.calcOpacity.includes('interpolate');
    const flipOpacity = layer.calcOpacity.includes('flip');
    const flipStrokeWidth = layer.calcStrokeWidth.includes('flip');
    const interpolateStrokeWidth = layer.calcStrokeWidth.includes('interpolate') || flipStrokeWidth;

    const wantsFill = layer.fillMode === 'fill' || layer.fillMode === 'fillStroke';
    const wantsStroke = layer.fillMode === 'stroke' || layer.fillMode === 'fillStroke';

    for (const instance of computeInstances(layer)) {
        const geometry = buildGeometry(layer, instance.shrink);

        if (!geometry) continue;

        const solid = color(
            layer.flipColorInterpolator ? colorIp(instance.flippedK) : colorIp(instance.k)
        );

        if (interpolateOpacity && solid) solid.opacity = instance.k;
        if (interpolateOpacity && flipOpacity && solid) solid.opacity = instance.flippedK;

        ctx.save();
        ctx.globalAlpha = layer.opacity;
        ctx.translate(cx, cy);
        ctx.rotate(instance.angle + (layer.shape === 'polygon' ? -PI / 2 : 0));

        if (wantsStroke) {
            const base = flipStrokeWidth ? instance.flippedK : instance.k;
            ctx.lineWidth = interpolateStrokeWidth
                ? Math.max(layer.strokeWidth * base, 1e-10)
                : layer.strokeWidth;
        }

        tracePath(ctx, geometry.commands);

        const style = layer.applyColorSchemeToEachShape
            ? buildGradient(
                  ctx,
                  layer,
                  instance,
                  geometry,
                  interpolateOpacity,
                  flipOpacity,
                  colorIp
              )
            : solid?.toString() || '#000';

        if (wantsFill) {
            ctx.fillStyle = style;
            ctx.fill();
        }

        if (wantsStroke) {
            ctx.strokeStyle = style;
            ctx.stroke();
        }

        ctx.restore();
    }
}

function buildGradient(
    ctx: CanvasRenderingContext2D,
    layer: Layer,
    instance: { k: number; flippedK: number },
    geometry: Geometry,
    interpolateOpacity: boolean,
    flipOpacity: boolean,
    colorIp: (t: number) => string
): CanvasGradient {
    const r = Math.max(geometry.width, geometry.height) / 2;

    let gradient: CanvasGradient;

    if (layer.gradientType === 'radial') {
        gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    } else {
        const theta = (layer.gradientAngle * PI) / 180;
        gradient = ctx.createLinearGradient(
            -r * Math.cos(theta),
            -r * Math.sin(theta),
            r * Math.cos(theta),
            r * Math.sin(theta)
        );
    }

    for (let j = 0; j <= 10; j += 1) {
        const t = j / 10;
        const stop = color(layer.flipColorInterpolator ? colorIp(1 - t) : colorIp(t));

        if (interpolateOpacity && stop) stop.opacity = instance.k;
        if (interpolateOpacity && flipOpacity && stop) stop.opacity = instance.flippedK;

        gradient.addColorStop(t, stop?.toString() || '#000');
    }

    return gradient;
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

    return {
        commands: [{ cmd: 'E', rx, ry }],
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
        case 'E':
            return { ...command, rx: command.rx * scale, ry: command.ry * scale };
        case 'Z':
            return command;
    }
}
