import { ref, onMounted } from 'vue';
import { color } from 'd3';
import { type Circle } from '../types/Circle';
import { canvasHeight, canvasWidth } from '../config/canvas';
import { colorInterPolators } from '@/config/colorInterPolators';

export default function useRectDrawing(
    canvasRef: { value: HTMLCanvasElement | null },
    circle: Circle
) {
    const ctx = ref<CanvasRenderingContext2D | null>(null);
    const PI: number = Math.PI;
    const TAU: number = PI * 2;

    const drawCircle = () => {
        if (!ctx.value) return;

        ctx.value.clearRect(0, 0, canvasWidth, canvasHeight);

        const {
            amount,
            calcOpacity,
            calcStrokeWidth,
            colorInterPolator,
            flipColorInterpolator,
            applyColorSchemeToEachShape,
            rotation
        } = circle;

        const radians: number = (rotation * PI) / 180;
        const adjustedAmount: number = amount - 1;

        const interpolateOpacity: boolean = calcOpacity.includes('interpolate');
        const flipOpacity: boolean = calcOpacity.includes('flip');

        const interpolateStrokeWidth: boolean = calcStrokeWidth.includes('interpolate');
        const flipStrokeWidth: boolean = calcStrokeWidth.includes('flip');

        const cx: number = canvasWidth / 4 + circle.cx;
        const cy: number = canvasHeight / 4 + circle.cy * -1;

        const colorIp: Function =
            colorInterPolators.find((c) => colorInterPolator === c.name)?.fn ||
            colorInterPolators[0].fn;

        for (let i = 0; i < amount; i += 1) {
            if (circle.radiusX - i * circle.distance < 0) return;
            if (circle.radiusY - i * circle.distance < 0) return;

            const radiusX = circle.radiusX - i * circle.distance;
            const radiusY = circle.radiusY - i * circle.distance;

            const k = i / adjustedAmount;
            const angle = (radians / adjustedAmount) * i;

            const x = -radiusX + circle.radiusX - i * circle.distance;
            const y = -radiusY + circle.radiusY - i * circle.distance;

            const flippedK = Math.abs(k - 1);
            const c = color(flipColorInterpolator ? colorIp(flippedK) : colorIp(k));

            let gradient: CanvasGradient | undefined = undefined;

            if (applyColorSchemeToEachShape) {
                gradient = ctx.value.createLinearGradient(x - radiusX / 2, 0, x + radiusX / 2, 0);

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
            ctx.value.rotate(angle);

            if (interpolateStrokeWidth) {
                ctx.value.lineWidth = Math.max(circle.strokeWidth * k, 1e-10);
            }

            if (interpolateStrokeWidth && flipStrokeWidth) {
                ctx.value.lineWidth = Math.max(circle.strokeWidth * flippedK, 1e-10);
            }

            if (!interpolateStrokeWidth) {
                ctx.value.lineWidth = circle.strokeWidth;
            }

            ctx.value.ellipse(x, y, radiusX / 2, radiusY / 2, angle, 0, TAU);
            ctx.value.closePath();

            ctx.value.strokeStyle = applyColorSchemeToEachShape
                ? gradient || '#000'
                : c?.toString() || '#000';

            ctx.value.stroke();
            ctx.value.restore();
        }
    };

    onMounted(() => {
        if (canvasRef.value) {
            ctx.value = canvasRef.value.getContext('2d');
        }
    });

    return {
        drawCircle
    };
}
