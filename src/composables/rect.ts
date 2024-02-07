import { ref, onMounted } from 'vue';
import { color } from 'd3';
import { type Rect } from '../types/Rect';
import { colorInterPolators } from '@/config/colorInterPolators';

export default function useRectDrawing(
    canvasRef: { value: HTMLCanvasElement | null },
    rect: Rect,
    canvasWidth: number,
    canvasHeight: number,
    PI: number
) {
    const ctx = ref<CanvasRenderingContext2D | null>(null);

    const drawRect = () => {
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
        } = rect;

        const radians: number = (rotation * PI) / 180;
        const adjustedAmount: number = amount - 1;

        const interpolateOpacity: boolean = calcOpacity.includes('interpolate');
        const flipOpacity: boolean = calcOpacity.includes('flip');

        const interpolateStrokeWidth: boolean = calcStrokeWidth.includes('interpolate');
        const flipStrokeWidth: boolean = calcStrokeWidth.includes('flip');

        const cx: number = canvasWidth / 4 + rect.cx;
        const cy: number = canvasHeight / 4 + rect.cy * -1;

        const colorIp: Function =
            colorInterPolators.find((c) => colorInterPolator === c.name)?.fn ||
            colorInterPolators[0].fn;

        for (let i = 0; i < amount; i += 1) {
            if (rect.width - i * rect.distance < 0) return;
            if (rect.height - i * rect.distance < 0) return;

            const width = rect.width - i * rect.distance;
            const height = rect.height - i * rect.distance;
            const k = i / adjustedAmount;
            const flippedK = Math.abs(k - 1);
            const angle = (radians / adjustedAmount) * i;
            const x = -width / 2;
            const y = -height / 2;
            const brTl = (rect.borderRadiusTl * Math.min(width, height)) / 2;
            const brTr = (rect.borderRadiusTr * Math.min(width, height)) / 2;
            const brBl = (rect.borderRadiusBl * Math.min(width, height)) / 2;
            const brBr = (rect.borderRadiusBr * Math.min(width, height)) / 2;
            const c = color(flipColorInterpolator ? colorIp(flippedK) : colorIp(k));
            let gradient;

            if (applyColorSchemeToEachShape) {
                gradient = ctx.value.createLinearGradient(x, 0, x + width, 0);

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
                ctx.value.lineWidth = Math.max(rect.strokeWidth * k, 1e-10);
            }

            if (interpolateStrokeWidth && flipStrokeWidth) {
                ctx.value.lineWidth = Math.max(rect.strokeWidth * flippedK, 1e-10);
            }

            if (!interpolateStrokeWidth) {
                ctx.value.lineWidth = rect.strokeWidth;
            }

            ctx.value.moveTo(x + brTl, y);
            ctx.value.lineTo(x + width - brTr, y);
            ctx.value.quadraticCurveTo(x + width, y, x + width, y + brTr);
            ctx.value.lineTo(x + width, y + height - brBr);
            ctx.value.quadraticCurveTo(x + width, y + height, x + width - brBr, y + height);
            ctx.value.lineTo(x + brBl, y + height);
            ctx.value.quadraticCurveTo(x, y + height, x, y + height - brBl);
            ctx.value.lineTo(x, y + brTl);
            ctx.value.quadraticCurveTo(x, y, x + brTl, y);
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
        drawRect
    };
}
