import { ref, onMounted } from 'vue';
import { color } from 'd3';
import { type Polygon } from '../types/Polygon';
import { canvasHeight, canvasWidth } from '../config/canvas';
import { colorInterPolators } from '../config/colorInterPolators';

export default function usePolygonDrawing(
    canvasRef: { value: HTMLCanvasElement | null },
    polygon: Polygon
) {
    const ctx = ref<CanvasRenderingContext2D | null>(null);
    const PI: number = Math.PI;

    function setPath(numberOfVertices: number, borderRadius: number, size: number): string {
        let p = '';

        const br = Math.min(borderRadius, size - size / 2);
        const alpha = ((numberOfVertices - 2) * PI) / numberOfVertices;
        const epsilon = size - br / Math.sin(alpha / 2);
        const beta = (2 * PI) / numberOfVertices;
        const gamma = (PI - alpha) / 2;

        const o = { x: 0, y: 0 };
        const posS = { x: 0, y: 0 };
        const posE = { x: 0, y: 0 };

        let delta = 0;
        let startAngle = 0;
        let endAngle = 0;

        for (let i = 0; i < numberOfVertices; i += 1) {
            delta = i * beta;
            o.x = epsilon * Math.cos(delta);
            o.y = epsilon * Math.sin(delta);

            startAngle = delta - gamma;
            posS.x = o.x + br * Math.cos(startAngle);
            posS.y = o.y + br * Math.sin(startAngle);

            endAngle = delta + gamma;
            posE.x = o.x + br * Math.cos(endAngle);
            posE.y = o.y + br * Math.sin(endAngle);

            p += `${(i === 0 ? 'M' : 'L') + posS.x} ${posS.y}A${br} ${br} 0 0 1 ${posE.x} ${
                posE.y
            }`;
        }

        return `${p}z`;
    }

    const drawPolygon = () => {
        if (!ctx.value) return;

        ctx.value.clearRect(0, 0, canvasWidth, canvasHeight);

        const {
            amount,
            distance,
            calcOpacity,
            borderRadius,
            calcStrokeWidth,
            colorInterPolator,
            flipColorInterpolator,
            applyColorSchemeToEachShape,
            rotation,
            size
        } = polygon;

        const radians: number = (rotation * PI) / 180;
        const adjustedAmount: number = amount - 1;

        const interpolateOpacity: boolean = calcOpacity.includes('interpolate');
        const flipOpacity: boolean = calcOpacity.includes('flip');

        const interpolateStrokeWidth: boolean = calcStrokeWidth.includes('interpolate');
        const flipStrokeWidth: boolean = calcStrokeWidth.includes('flip');

        const cx: number = canvasWidth / 4 + polygon.cx;
        const cy: number = canvasHeight / 4 + polygon.cy * -1;

        const colorIp: Function =
            colorInterPolators.find((c) => colorInterPolator === c.name)?.fn ||
            colorInterPolators[0].fn;

        for (let i = 0; i < amount; i += 1) {
            if (size - i * distance < 0) return;

            const s = (size - i * distance) / 2;
            const k = i / adjustedAmount;

            const angle = (radians / adjustedAmount) * i;
            const flippedK = Math.abs(k - 1);

            const c = color(flipColorInterpolator ? colorIp(flippedK) : colorIp(k));

            let gradient: CanvasGradient | undefined = undefined;

            if (applyColorSchemeToEachShape) {
                gradient = ctx.value.createLinearGradient(0, -s, 0, s);

                for (let j = 0; j < 1; j += 0.1) {
                    const gc = color(flipColorInterpolator ? colorIp(Math.abs(j - 1)) : colorIp(j));

                    if (interpolateOpacity) {
                        gc ? (gc.opacity = k) : 0;
                    }

                    if (interpolateOpacity && flipOpacity) {
                        gc ? (gc.opacity = flippedK) : 0;
                    }

                    gradient.addColorStop(j, gc?.toString() || '#000');
                }
            }

            if (interpolateOpacity) {
                c ? (c.opacity = k) : 0;
            }

            if (interpolateOpacity && flipOpacity) {
                c ? (c.opacity = flippedK) : 0;
            }

            ctx.value.save();
            ctx.value.beginPath();
            ctx.value.translate(cx, cy);
            ctx.value.rotate(angle - PI / 2);

            if (interpolateStrokeWidth) {
                ctx.value.lineWidth = Math.max(polygon.strokeWidth * k, 1e-10);
            }

            if (interpolateStrokeWidth && flipStrokeWidth) {
                ctx.value.lineWidth = Math.max(polygon.strokeWidth * flippedK, 1e-10);
            }

            if (!interpolateStrokeWidth) {
                ctx.value.lineWidth = polygon.strokeWidth;
            }

            const path = new Path2D(setPath(polygon.sides, borderRadius * 100, s));

            ctx.value.closePath();

            ctx.value.strokeStyle = applyColorSchemeToEachShape
                ? gradient || '#000'
                : c?.toString() || '#000';

            ctx.value.stroke(path);
            ctx.value.restore();
        }
    };

    onMounted(() => {
        if (canvasRef.value) {
            ctx.value = canvasRef.value.getContext('2d');
        }
    });

    return {
        drawPolygon
    };
}
