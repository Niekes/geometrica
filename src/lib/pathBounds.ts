export type PathBounds = {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
};

export type Command =
    | { cmd: 'M'; x: number; y: number }
    | { cmd: 'L'; x: number; y: number }
    | { cmd: 'C'; x1: number; y1: number; x2: number; y2: number; x: number; y: number }
    | { cmd: 'Q'; x1: number; y1: number; x: number; y: number }
    | {
          cmd: 'A';
          rx: number;
          ry: number;
          rot: number;
          largeArc: 0 | 1;
          sweep: 0 | 1;
          x: number;
          y: number;
      }
    | { cmd: 'Z' };

const SAMPLING_STEPS = 64;

class Lexer {
    private pos = 0;
    private readonly s: string;

    constructor(d: string) {
        this.s = d;
    }

    private skipWs() {
        for (;;) {
            const char = this.s[this.pos];
            if (char === undefined || !/[\s,]/.test(char)) break;
            this.pos += 1;
        }
    }

    peekCommand(): string | null {
        this.skipWs();
        const char = this.s[this.pos];
        return char !== undefined && /[MmLlHhVvCcSsQqTtAaZz]/.test(char) ? char : null;
    }

    readCommand(): string {
        const char = this.peekCommand();
        if (char === null) throw new Error(`Expected command at ${this.pos}`);
        this.pos += 1;
        return char;
    }

    readNumber(): number {
        this.skipWs();
        const match = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(this.s.slice(this.pos));
        if (!match) throw new Error(`Expected number at ${this.pos}`);
        this.pos += match[0].length;
        return Number(match[0]);
    }

    readFlag(): 0 | 1 {
        this.skipWs();
        const char = this.s[this.pos];
        if (char !== '0' && char !== '1') throw new Error(`Expected flag at ${this.pos}`);
        this.pos += 1;
        return char === '1' ? 1 : 0;
    }

    atEnd(): boolean {
        this.skipWs();
        return this.pos >= this.s.length;
    }
}

type ParseState = {
    cx: number;
    cy: number;
    sx: number;
    sy: number;
    prevCubicCtrl: { x: number; y: number } | null;
    prevQuadCtrl: { x: number; y: number } | null;
};

type ParseContext = {
    lexer: Lexer;
    state: ParseState;
    commands: Command[];
    relative: boolean;
};

function readArgs(ctx: ParseContext, count: 1): [number];
function readArgs(ctx: ParseContext, count: 2): [number, number];
function readArgs(ctx: ParseContext, count: 4): [number, number, number, number];
function readArgs(ctx: ParseContext, count: 6): [number, number, number, number, number, number];
function readArgs(ctx: ParseContext, count: number): number[] {
    const args: number[] = [];

    for (let i = 0; i < count; i += 1) {
        args.push(ctx.lexer.readNumber());
    }

    return args;
}

const toAbsolute = (ctx: ParseContext, x: number, y: number): [number, number] =>
    ctx.relative ? [ctx.state.cx + x, ctx.state.cy + y] : [x, y];

const moveTo = (ctx: ParseContext, x: number, y: number) => {
    ctx.state.cx = x;
    ctx.state.cy = y;
};

function parseMove(ctx: ParseContext) {
    const [x, y] = readArgs(ctx, 2);
    const [absX, absY] = toAbsolute(ctx, x, y);

    ctx.commands.push({ cmd: 'M', x: absX, y: absY });
    moveTo(ctx, absX, absY);
    ctx.state.sx = absX;
    ctx.state.sy = absY;
    ctx.state.prevCubicCtrl = null;
    ctx.state.prevQuadCtrl = null;
}

function parseLine(ctx: ParseContext) {
    const [x, y] = readArgs(ctx, 2);
    const [aX, aY] = toAbsolute(ctx, x, y);

    ctx.commands.push({ cmd: 'L', x: aX, y: aY });
    moveTo(ctx, aX, aY);
    resetControlPoints(ctx);
}

function parseHorizontal(ctx: ParseContext) {
    const [x] = readArgs(ctx, 1);
    const aX = ctx.relative ? ctx.state.cx + x : x;

    ctx.commands.push({ cmd: 'L', x: aX, y: ctx.state.cy });
    ctx.state.cx = aX;
    resetControlPoints(ctx);
}

function parseVertical(ctx: ParseContext) {
    const [y] = readArgs(ctx, 1);
    const aY = ctx.relative ? ctx.state.cy + y : y;

    ctx.commands.push({ cmd: 'L', x: ctx.state.cx, y: aY });
    ctx.state.cy = aY;
    resetControlPoints(ctx);
}

function resetControlPoints(ctx: ParseContext) {
    ctx.state.prevCubicCtrl = null;
    ctx.state.prevQuadCtrl = null;
}

function parseCubic(ctx: ParseContext) {
    const [x1, y1, x2, y2, x, y] = readArgs(ctx, 6);
    const [aX1, aY1] = toAbsolute(ctx, x1, y1);
    const [aX2, aY2] = toAbsolute(ctx, x2, y2);
    const [aX, aY] = toAbsolute(ctx, x, y);

    pushCubic(ctx.commands, aX1, aY1, aX2, aY2, aX, aY);
    ctx.state.prevCubicCtrl = { x: aX2, y: aY2 };
    moveTo(ctx, aX, aY);
}

function parseSmoothCubic(ctx: ParseContext) {
    const [x2, y2, x, y] = readArgs(ctx, 4);
    const reflectX: number = ctx.state.prevCubicCtrl
        ? 2 * ctx.state.cx - ctx.state.prevCubicCtrl.x
        : ctx.state.cx;
    const reflectY: number = ctx.state.prevCubicCtrl
        ? 2 * ctx.state.cy - ctx.state.prevCubicCtrl.y
        : ctx.state.cy;
    const [aX2, aY2] = toAbsolute(ctx, x2, y2);
    const [aX, aY] = toAbsolute(ctx, x, y);

    pushCubic(ctx.commands, reflectX, reflectY, aX2, aY2, aX, aY);
    ctx.state.prevCubicCtrl = { x: aX2, y: aY2 };
    moveTo(ctx, aX, aY);
}

function parseQuad(ctx: ParseContext) {
    const [x1, y1, x, y] = readArgs(ctx, 4);
    const [aX1, aY1] = toAbsolute(ctx, x1, y1);
    const [aX, aY] = toAbsolute(ctx, x, y);

    ctx.commands.push({ cmd: 'Q', x1: aX1, y1: aY1, x: aX, y: aY });
    ctx.state.prevQuadCtrl = { x: aX1, y: aY1 };
    moveTo(ctx, aX, aY);
}

function parseSmoothQuad(ctx: ParseContext) {
    const [x, y] = readArgs(ctx, 2);
    const reflectX: number = ctx.state.prevQuadCtrl
        ? 2 * ctx.state.cx - ctx.state.prevQuadCtrl.x
        : ctx.state.cx;
    const reflectY: number = ctx.state.prevQuadCtrl
        ? 2 * ctx.state.cy - ctx.state.prevQuadCtrl.y
        : ctx.state.cy;
    const [aX, aY] = toAbsolute(ctx, x, y);

    ctx.commands.push({ cmd: 'Q', x1: reflectX, y1: reflectY, x: aX, y: aY });
    ctx.state.prevQuadCtrl = { x: reflectX, y: reflectY };
    moveTo(ctx, aX, aY);
}

function parseArc(ctx: ParseContext) {
    const rx = ctx.lexer.readNumber();
    const ry = ctx.lexer.readNumber();
    const rot = ctx.lexer.readNumber();
    const largeArc = ctx.lexer.readFlag();
    const sweep = ctx.lexer.readFlag();
    const [x, y] = readArgs(ctx, 2);
    const [aX, aY] = toAbsolute(ctx, x, y);

    if (rx === 0 || ry === 0) {
        ctx.commands.push({ cmd: 'L', x: aX, y: aY });
    } else {
        ctx.commands.push({ cmd: 'A', rx, ry, rot, largeArc, sweep, x: aX, y: aY });
    }

    moveTo(ctx, aX, aY);
    resetControlPoints(ctx);
}

function parseClose(ctx: ParseContext) {
    ctx.commands.push({ cmd: 'Z' });
    moveTo(ctx, ctx.state.sx, ctx.state.sy);
    resetControlPoints(ctx);
}

const COMMAND_HANDLERS: Record<string, (ctx: ParseContext) => void> = {
    M: parseMove,
    L: parseLine,
    H: parseHorizontal,
    V: parseVertical,
    C: parseCubic,
    S: parseSmoothCubic,
    Q: parseQuad,
    T: parseSmoothQuad,
    A: parseArc,
    Z: parseClose
};

export function parsePath(d: string): Command[] {
    const lexer = new Lexer(d);
    const commands: Command[] = [];
    const state: ParseState = {
        cx: 0,
        cy: 0,
        sx: 0,
        sy: 0,
        prevCubicCtrl: null,
        prevQuadCtrl: null
    };

    try {
        while (!lexer.atEnd()) {
            const command = lexer.readCommand();
            const name = command.toUpperCase();
            const ctx = { lexer, state, commands, relative: command === command.toLowerCase() };

            COMMAND_HANDLERS[name]!(ctx);

            // a command repeats while arguments follow without a letter; pairs after a moveto are linetos
            const repeat = COMMAND_HANDLERS[name === 'M' ? 'L' : name]!;
            while (name !== 'Z' && !lexer.atEnd() && !lexer.peekCommand()) repeat(ctx);
        }
    } catch {
        return [];
    }

    return commands;
}

function pushCubic(
    commands: Command[],
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x: number,
    y: number
) {
    commands.push({ cmd: 'C', x1, y1, x2, y2, x, y });
}

function cubicAt(t: number, p0: number, p1: number, p2: number, p3: number): number {
    const mt = 1 - t;
    return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

function quadAt(t: number, p0: number, p1: number, p2: number): number {
    const mt = 1 - t;
    return mt * mt * p0 + 2 * mt * t * p1 + t * t * p2;
}

function arcToCenterParams(
    x1: number,
    y1: number,
    rx: number,
    ry: number,
    rotDeg: number,
    largeArc: 0 | 1,
    sweep: 0 | 1,
    x2: number,
    y2: number
): { cx: number; cy: number; startAngle: number; deltaAngle: number; rx: number; ry: number } {
    const phi = (rotDeg * Math.PI) / 180;
    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);

    const dx = (x1 - x2) / 2;
    const dy = (y1 - y2) / 2;
    const x1p = cosPhi * dx + sinPhi * dy;
    const y1p = -sinPhi * dx + cosPhi * dy;

    const rxSq = rx * rx;
    const rySq = ry * ry;
    const x1pSq = x1p * x1p;
    const y1pSq = y1p * y1p;

    // degenerate arcs have their radii scaled up to reach the endpoint
    const lambda = x1pSq / rxSq + y1pSq / rySq;
    const correction = lambda > 1 ? Math.sqrt(lambda) : 1;
    const rxc = rx * correction;
    const ryc = ry * correction;

    const sign = largeArc !== sweep ? 1 : -1;
    const numerator = rxc * rxc * ryc * ryc - rxc * rxc * y1pSq - ryc * ryc * x1pSq;
    const denominator = rxc * rxc * y1pSq + ryc * ryc * x1pSq;
    const coFactor = Math.sqrt(Math.max(0, numerator / denominator)) * sign;

    const cxp = (coFactor * rxc * y1p) / ryc;
    const cyp = (coFactor * -ryc * x1p) / rxc;

    const cx = cosPhi * cxp - sinPhi * cyp + (x1 + x2) / 2;
    const cy = sinPhi * cxp + cosPhi * cyp + (y1 + y2) / 2;

    const angle = (ux: number, uy: number, vx: number, vy: number): number => {
        const dot = ux * vx + uy * vy;
        const len = (ux * ux + uy * uy) ** 0.5 * (vx * vx + vy * vy) ** 0.5;
        let ang = Math.acos(Math.min(1, Math.max(-1, dot / len)));
        if (ux * vy - uy * vx < 0) ang = -ang;
        return ang;
    };

    const startAngle = angle(1, 0, (x1p - cxp) / rxc, (y1p - cyp) / ryc);
    let deltaAngle = angle(
        (x1p - cxp) / rxc,
        (y1p - cyp) / ryc,
        (-x1p - cxp) / rxc,
        (-y1p - cyp) / ryc
    );

    if (sweep === 0 && deltaAngle > 0) deltaAngle -= 2 * Math.PI;
    if (sweep === 1 && deltaAngle < 0) deltaAngle += 2 * Math.PI;

    return { cx, cy, startAngle, deltaAngle, rx: rxc, ry: ryc };
}

type ArcParams = {
    cx: number;
    cy: number;
    startAngle: number;
    deltaAngle: number;
    phi: number;
    rx: number;
    ry: number;
};

function arcParams(x0: number, y0: number, command: Extract<Command, { cmd: 'A' }>): ArcParams {
    const { cx, cy, startAngle, deltaAngle, rx, ry } = arcToCenterParams(
        x0,
        y0,
        command.rx,
        command.ry,
        command.rot,
        command.largeArc,
        command.sweep,
        command.x,
        command.y
    );

    return { cx, cy, startAngle, deltaAngle, phi: (command.rot * Math.PI) / 180, rx, ry };
}

const sampleCurve = (at: (t: number) => [number, number]): [number, number][] =>
    Array.from({ length: SAMPLING_STEPS + 1 }, (_, i) => at(i / SAMPLING_STEPS));

// as in SVG, zero radii draw a line, and an arc back onto its start draws nothing;
// a polygon with sharp corners builds both without a parser that would catch them
function sampleArc(
    x0: number,
    y0: number,
    command: Extract<Command, { cmd: 'A' }>
): [number, number][] {
    if (command.rx === 0 || command.ry === 0 || (command.x === x0 && command.y === y0)) {
        return [[command.x, command.y]];
    }

    const { cx, cy, startAngle, deltaAngle, phi, rx, ry } = arcParams(x0, y0, command);

    return sampleCurve((t) => {
        const ellipseX = rx * Math.cos(startAngle + deltaAngle * t);
        const ellipseY = ry * Math.sin(startAngle + deltaAngle * t);

        return [
            cx + ellipseX * Math.cos(phi) - ellipseY * Math.sin(phi),
            cy + ellipseX * Math.sin(phi) + ellipseY * Math.cos(phi)
        ];
    });
}

// the points a command passes from the current point on, curves sampled along their bulge
function samplePoints(x0: number, y0: number, command: Command): [number, number][] {
    switch (command.cmd) {
        case 'M':
        case 'L':
            return [[command.x, command.y]];
        case 'C':
            return sampleCurve((t) => [
                cubicAt(t, x0, command.x1, command.x2, command.x),
                cubicAt(t, y0, command.y1, command.y2, command.y)
            ]);
        case 'Q':
            return sampleCurve((t) => [
                quadAt(t, x0, command.x1, command.x),
                quadAt(t, y0, command.y1, command.y)
            ]);
        case 'A':
            return sampleArc(x0, y0, command);
        case 'Z':
            return [];
    }
}

export type Subpath = { points: [number, number][]; closed: boolean };

// every subpath as the points it passes, so a stroke can find its corners; as in SVG, a path
// goes on from the start of a subpath it closed
export function flattenPath(commands: Command[]): Subpath[] {
    const subpaths: Subpath[] = [];
    let current: Subpath | undefined;
    let [x, y] = [0, 0];

    for (const command of commands) {
        if (command.cmd === 'Z') {
            if (current) [x, y] = current.points[0]!;
            if (current) current.closed = true;
            current = undefined;
            continue;
        }

        if (command.cmd === 'M' || !current) {
            current = { points: command.cmd === 'M' ? [] : [[x, y]], closed: false };
            subpaths.push(current);
        }

        current.points.push(...samplePoints(x, y, command));
        x = command.x;
        y = command.y;
    }

    return subpaths;
}

export function getPathBounds(commands: Command[]): PathBounds | null {
    const points = flattenPath(commands).flatMap((subpath) => subpath.points);

    if (points.length === 0) return null;

    const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };

    for (const [x, y] of points) {
        bounds.minX = Math.min(bounds.minX, x);
        bounds.minY = Math.min(bounds.minY, y);
        bounds.maxX = Math.max(bounds.maxX, x);
        bounds.maxY = Math.max(bounds.maxY, y);
    }

    return bounds;
}

export const round = (n: number): number => Math.round(n * 1e4) / 1e4;

export function serializePath(commands: Command[]): string {
    let d = '';

    for (const command of commands) {
        switch (command.cmd) {
            case 'M':
                d += `M${round(command.x)} ${round(command.y)}`;
                break;
            case 'L':
                d += `L${round(command.x)} ${round(command.y)}`;
                break;
            case 'C':
                d += `C${round(command.x1)} ${round(command.y1)} ${round(command.x2)} ${round(
                    command.y2
                )} ${round(command.x)} ${round(command.y)}`;
                break;
            case 'Q':
                d += `Q${round(command.x1)} ${round(command.y1)} ${round(command.x)} ${round(
                    command.y
                )}`;
                break;
            case 'A':
                d += `A${round(command.rx)} ${round(command.ry)} ${round(command.rot)} ${
                    command.largeArc
                } ${command.sweep} ${round(command.x)} ${round(command.y)}`;
                break;
            case 'Z':
                d += 'Z';
                break;
        }
    }

    return d;
}

export type NormalizedPath = {
    d: string;
    width: number;
    height: number;
};

export function normalizePath(d: string, targetSize: number): NormalizedPath | null {
    const commands = parsePath(d);
    const bounds = getPathBounds(commands);

    if (!bounds) return null;

    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    const scale = targetSize / Math.max(width, height);

    const transformX = (x: number): number =>
        round(x * scale - ((bounds.minX + bounds.maxX) / 2) * scale);
    const transformY = (y: number): number =>
        round(y * scale - ((bounds.minY + bounds.maxY) / 2) * scale);

    const transformed: Command[] = commands.map((command) => {
        switch (command.cmd) {
            case 'M':
                return { cmd: 'M' as const, x: transformX(command.x), y: transformY(command.y) };
            case 'L':
                return { cmd: 'L' as const, x: transformX(command.x), y: transformY(command.y) };
            case 'C':
                return {
                    cmd: 'C' as const,
                    x1: transformX(command.x1),
                    y1: transformY(command.y1),
                    x2: transformX(command.x2),
                    y2: transformY(command.y2),
                    x: transformX(command.x),
                    y: transformY(command.y)
                };
            case 'Q':
                return {
                    cmd: 'Q' as const,
                    x1: transformX(command.x1),
                    y1: transformY(command.y1),
                    x: transformX(command.x),
                    y: transformY(command.y)
                };
            case 'A':
                return {
                    cmd: 'A' as const,
                    rx: round(command.rx * scale),
                    ry: round(command.ry * scale),
                    rot: command.rot,
                    largeArc: command.largeArc,
                    sweep: command.sweep,
                    x: transformX(command.x),
                    y: transformY(command.y)
                };
            case 'Z':
                return { cmd: 'Z' as const };
        }
    });

    return {
        d: serializePath(transformed),
        width: round(width * scale),
        height: round(height * scale)
    };
}
