import { type Command, arcToCenterParams } from './pathBounds';

const TAU = Math.PI * 2;

export function tracePath(ctx: CanvasRenderingContext2D, commands: Command[]): void {
    let cx = 0;
    let cy = 0;

    ctx.beginPath();

    for (const command of commands) {
        switch (command.cmd) {
            case 'M':
                ctx.moveTo(command.x, command.y);
                cx = command.x;
                cy = command.y;
                break;
            case 'L':
                ctx.lineTo(command.x, command.y);
                cx = command.x;
                cy = command.y;
                break;
            case 'C':
                ctx.bezierCurveTo(
                    command.x1,
                    command.y1,
                    command.x2,
                    command.y2,
                    command.x,
                    command.y
                );
                cx = command.x;
                cy = command.y;
                break;
            case 'Q':
                ctx.quadraticCurveTo(command.x1, command.y1, command.x, command.y);
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
                ctx.ellipse(
                    arcCx,
                    arcCy,
                    command.rx,
                    command.ry,
                    phi,
                    startAngle,
                    startAngle + deltaAngle,
                    deltaAngle < 0
                );
                cx = command.x;
                cy = command.y;
                break;
            }
            case 'E':
                ctx.ellipse(0, 0, command.rx, command.ry, 0, 0, TAU);
                break;
            case 'Z':
                ctx.closePath();
                break;
        }
    }
}
