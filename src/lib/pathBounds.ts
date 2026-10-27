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
    | { cmd: 'E'; rx: number; ry: number }
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

export function parsePath(d: string): Command[] {
    const lexer = new Lexer(d);
    const commands: Command[] = [];

    let cx = 0;
    let cy = 0;
    let sx = 0;
    let sy = 0;
    let prevCubicCtrl: { x: number; y: number } | null = null;
    let prevQuadCtrl: { x: number; y: number } | null = null;

    function readNumbers(count: 1): [number];
    function readNumbers(count: 2): [number, number];
    function readNumbers(count: 4): [number, number, number, number];
    function readNumbers(count: 6): [number, number, number, number, number, number];
    function readNumbers(count: number): number[] {
        const args: number[] = [];
        for (let i = 0; i < count; i += 1) {
            args.push(lexer.readNumber());
        }
        return args;
    }

    try {
        while (!lexer.atEnd()) {
            const command = lexer.readCommand();
            const relative = command === command.toLowerCase();
            const upper = command.toUpperCase();

            switch (upper) {
                case 'M': {
                    const [x, y] = readNumbers(2);
                    const absX = relative ? cx + x : x;
                    const absY = relative ? cy + y : y;
                    commands.push({ cmd: 'M', x: absX, y: absY });
                    cx = absX;
                    cy = absY;
                    sx = absX;
                    sy = absY;
                    prevCubicCtrl = null;
                    prevQuadCtrl = null;

                    // implicit lineto pairs after the first moveto
                    while (!lexer.atEnd() && !lexer.peekCommand()) {
                        const [lx, ly] = readNumbers(2);
                        const aX = relative ? cx + lx : lx;
                        const aY = relative ? cy + ly : ly;
                        commands.push({ cmd: 'L', x: aX, y: aY });
                        cx = aX;
                        cy = aY;
                        prevCubicCtrl = null;
                        prevQuadCtrl = null;
                    }
                    break;
                }
                case 'L': {
                    const [x, y] = readNumbers(2);
                    const absX = relative ? cx + x : x;
                    const absY = relative ? cy + y : y;
                    commands.push({ cmd: 'L', x: absX, y: absY });
                    cx = absX;
                    cy = absY;
                    prevCubicCtrl = null;
                    prevQuadCtrl = null;
                    break;
                }
                case 'H': {
                    const [x] = readNumbers(1);
                    const absX = relative ? cx + x : x;
                    commands.push({ cmd: 'L', x: absX, y: cy });
                    cx = absX;
                    prevCubicCtrl = null;
                    prevQuadCtrl = null;
                    break;
                }
                case 'V': {
                    const [y] = readNumbers(1);
                    const absY = relative ? cy + y : y;
                    commands.push({ cmd: 'L', x: cx, y: absY });
                    cy = absY;
                    prevCubicCtrl = null;
                    prevQuadCtrl = null;
                    break;
                }
                case 'C': {
                    const [x1, y1, x2, y2, x, y] = readNumbers(6);
                    const aX1 = relative ? cx + x1 : x1;
                    const aY1 = relative ? cy + y1 : y1;
                    const aX2 = relative ? cx + x2 : x2;
                    const aY2 = relative ? cy + y2 : y2;
                    const aX = relative ? cx + x : x;
                    const aY = relative ? cy + y : y;
                    commands.push({
                        cmd: 'C',
                        x1: aX1,
                        y1: aY1,
                        x2: aX2,
                        y2: aY2,
                        x: aX,
                        y: aY
                    });
                    prevCubicCtrl = { x: aX2, y: aY2 };
                    cx = aX;
                    cy = aY;
                    break;
                }
                case 'S': {
                    const [x2, y2, x, y] = readNumbers(4);
                    const reflectX = prevCubicCtrl ? 2 * cx - prevCubicCtrl.x : cx;
                    const reflectY = prevCubicCtrl ? 2 * cy - prevCubicCtrl.y : cy;
                    const aX2 = relative ? cx + x2 : x2;
                    const aY2 = relative ? cy + y2 : y2;
                    const aX = relative ? cx + x : x;
                    const aY = relative ? cy + y : y;
                    commands.push({
                        cmd: 'C',
                        x1: reflectX,
                        y1: reflectY,
                        x2: aX2,
                        y2: aY2,
                        x: aX,
                        y: aY
                    });
                    prevCubicCtrl = { x: aX2, y: aY2 };
                    cx = aX;
                    cy = aY;
                    break;
                }
                case 'Q': {
                    const [x1, y1, x, y] = readNumbers(4);
                    const aX1 = relative ? cx + x1 : x1;
                    const aY1 = relative ? cy + y1 : y1;
                    const aX = relative ? cx + x : x;
                    const aY = relative ? cy + y : y;
                    commands.push({ cmd: 'Q', x1: aX1, y1: aY1, x: aX, y: aY });
                    prevQuadCtrl = { x: aX1, y: aY1 };
                    cx = aX;
                    cy = aY;
                    break;
                }
                case 'T': {
                    const [x, y] = readNumbers(2);
                    const reflectX: number = prevQuadCtrl ? 2 * cx - prevQuadCtrl.x : cx;
                    const reflectY: number = prevQuadCtrl ? 2 * cy - prevQuadCtrl.y : cy;
                    const aX = relative ? cx + x : x;
                    const aY = relative ? cy + y : y;
                    commands.push({ cmd: 'Q', x1: reflectX, y1: reflectY, x: aX, y: aY });
                    prevQuadCtrl = { x: reflectX, y: reflectY };
                    cx = aX;
                    cy = aY;
                    break;
                }
                case 'A': {
                    const rx = lexer.readNumber();
                    const ry = lexer.readNumber();
                    const rot = lexer.readNumber();
                    const largeArc = lexer.readFlag();
                    const sweep = lexer.readFlag();
                    const [x, y] = readNumbers(2);
                    const aX = relative ? cx + x : x;
                    const aY = relative ? cy + y : y;

                    if (rx === 0 || ry === 0) {
                        commands.push({ cmd: 'L', x: aX, y: aY });
                    } else {
                        commands.push({
                            cmd: 'A',
                            rx,
                            ry,
                            rot,
                            largeArc,
                            sweep,
                            x: aX,
                            y: aY
                        });
                    }
                    cx = aX;
                    cy = aY;
                    prevCubicCtrl = null;
                    prevQuadCtrl = null;
                    break;
                }
                case 'Z': {
                    commands.push({ cmd: 'Z' });
                    cx = sx;
                    cy = sy;
                    prevCubicCtrl = null;
                    prevQuadCtrl = null;
                    break;
                }
                default:
                    throw new Error(`Unsupported command: ${command}`);
            }
        }
    } catch {
        return [];
    }

    return commands;
}

function cubicAt(t: number, p0: number, p1: number, p2: number, p3: number): number {
    const mt = 1 - t;
    return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

function quadAt(t: number, p0: number, p1: number, p2: number): number {
    const mt = 1 - t;
    return mt * mt * p0 + 2 * mt * t * p1 + t * t * p2;
}

export function arcToCenterParams(
    x1: number,
    y1: number,
    rx: number,
    ry: number,
    rotDeg: number,
    largeArc: 0 | 1,
    sweep: 0 | 1,
    x2: number,
    y2: number
): { cx: number; cy: number; startAngle: number; deltaAngle: number } {
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

    let lambda = (x1pSq / rxSq + y1pSq / rySq) ** 0.5;
    const correction = lambda > 1 ? lambda : 1;
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

    return { cx, cy, startAngle, deltaAngle };
}

export function getPathBounds(commands: Command[]): PathBounds | null {
    if (commands.length === 0) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    const track = (x: number, y: number) => {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
    };

    let cx = 0;
    let cy = 0;

    for (const command of commands) {
        switch (command.cmd) {
            case 'M':
            case 'L':
                track(command.x, command.y);
                cx = command.x;
                cy = command.y;
                break;
            case 'C':
                for (let i = 0; i <= SAMPLING_STEPS; i += 1) {
                    const t = i / SAMPLING_STEPS;
                    track(
                        cubicAt(t, cx, command.x1, command.x2, command.x),
                        cubicAt(t, cy, command.y1, command.y2, command.y)
                    );
                }
                cx = command.x;
                cy = command.y;
                break;
            case 'Q':
                for (let i = 0; i <= SAMPLING_STEPS; i += 1) {
                    const t = i / SAMPLING_STEPS;
                    track(
                        quadAt(t, cx, command.x1, command.x),
                        quadAt(t, cy, command.y1, command.y)
                    );
                }
                cx = command.x;
                cy = command.y;
                break;
            case 'A': {
                const {
                    cx: arcCx,
                    cy: arcCy,
                    startAngle,
                    deltaAngle
                } = arcToCenterParams(
                    cx,
                    cy,
                    command.rx,
                    command.ry,
                    command.rot,
                    command.largeArc,
                    command.sweep,
                    command.x,
                    command.y
                );
                const phi = (command.rot * Math.PI) / 180;
                for (let i = 0; i <= SAMPLING_STEPS; i += 1) {
                    const theta = startAngle + (deltaAngle * i) / SAMPLING_STEPS;
                    const ellipseX = command.rx * Math.cos(theta);
                    const ellipseY = command.ry * Math.sin(theta);
                    track(
                        arcCx + ellipseX * Math.cos(phi) - ellipseY * Math.sin(phi),
                        arcCy + ellipseX * Math.sin(phi) + ellipseY * Math.cos(phi)
                    );
                }
                cx = command.x;
                cy = command.y;
                break;
            }
            case 'E':
                track(cx - command.rx, cy - command.ry);
                track(cx + command.rx, cy + command.ry);
                break;
            case 'Z':
                break;
        }
    }

    return { minX, minY, maxX, maxY };
}

const round = (n: number): number => Math.round(n * 1e4) / 1e4;

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
            case 'E':
                throw new Error('E cannot be serialized; it only exists for tracing');
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
            case 'E':
                return {
                    cmd: 'E' as const,
                    rx: round(command.rx * scale),
                    ry: round(command.ry * scale)
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
