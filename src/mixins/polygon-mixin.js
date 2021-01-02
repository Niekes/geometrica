import {
    color,
} from 'd3';

import config from '@/config';

const { colorInterPolators } = config;

export default {
    methods: {
        setPath(numberOfVertices, borderRadius, size) {
            let p = '';

            const br = Math.min(borderRadius, size - (size / 2));
            const alpha = (numberOfVertices - 2) * this.PI / numberOfVertices;
            const epsilon = size - br / Math.sin(alpha / 2);
            const beta = 2 * this.PI / numberOfVertices;
            const gamma = (this.PI - alpha) / 2;

            const o = {};
            const posS = {};
            const posE = {};

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

                p += `${((i === 0) ? 'M' : 'L') + posS.x} ${posS.y}A${br} ${br} 0 0 1 ${posE.x} ${posE.y}`;
            }

            return `${p}z`;
        },
        drawPolygon() {
            this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

            const {
                amount,
                borderRadius,
                distance,
                size,
                calcOpacity,
                calcStrokeWidth,
                colorInterPolator,
                flipColorInterpolator,
                applyColorSchemeToEachShape,
            } = this.polygon;

            const radians = (this.polygon.rotation * this.PI / 180);
            const adjustedAmount = amount - 1;

            const interpolateOpacity = calcOpacity.indexOf('interpolate') !== -1;
            const flipOpacity = calcOpacity.indexOf('flip') !== -1;

            const interpolateStrokeWidth = calcStrokeWidth.indexOf('interpolate') !== -1;
            const flipStrokeWidth = calcStrokeWidth.indexOf('flip') !== -1;

            const cx = this.canvasHalfWidth + this.polygon.cx;
            const cy = this.canvasHalfHeight + this.polygon.cy * -1;

            const colorIp = colorInterPolators.find(c => colorInterPolator === c.name).fn;

            for (let i = 0; i < amount; i += 1) {
                if (size - (i * distance) < 0) return;

                const s = (size - (i * distance)) / 2;
                const k = i / adjustedAmount;
                const flippedK = Math.abs(k - 1);
                const angle = radians / (adjustedAmount) * i;
                const c = color(flipColorInterpolator ? colorIp(flippedK) : colorIp(k));
                let gradient = null;

                if (applyColorSchemeToEachShape) {
                    gradient = this.ctx.createLinearGradient(0, -s, 0, s);

                    for (let j = 0; j < 1; j += 0.1) {
                        const gc = color(
                            flipColorInterpolator
                                ? colorIp(Math.abs(j - 1))
                                : colorIp(j),
                        );

                        if (interpolateOpacity) {
                            gc.opacity = k;
                        }

                        if (interpolateOpacity && flipOpacity) {
                            gc.opacity = flippedK;
                        }

                        gradient.addColorStop(j, gc);
                    }
                }

                if (interpolateOpacity) {
                    c.opacity = k;
                }

                if (interpolateOpacity && flipOpacity) {
                    c.opacity = flippedK;
                }

                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.translate(cx, cy);
                this.ctx.rotate(angle - this.PI / 2);

                if (interpolateStrokeWidth) {
                    this.ctx.lineWidth = Math.max(this.polygon.strokeWidth * k, 1e-10);
                }

                if (interpolateStrokeWidth && flipStrokeWidth) {
                    this.ctx.lineWidth = Math.max(this.polygon.strokeWidth * flippedK, 1e-10);
                }

                if (!interpolateStrokeWidth) {
                    this.ctx.lineWidth = this.polygon.strokeWidth;
                }

                const path = new Path2D(this.setPath(this.polygon.sides, borderRadius * 100, s, i));

                this.ctx.closePath();

                if (this.polygon.stroke) {
                    this.ctx.strokeStyle = applyColorSchemeToEachShape
                        ? gradient
                        : c.toString();

                    this.ctx.stroke(path);
                }

                if (!this.polygon.stroke) {
                    this.ctx.fillStyle = applyColorSchemeToEachShape
                        ? gradient
                        : c.toString();
                    this.ctx.fill(path);
                }

                this.ctx.restore();
            }
        },
    },
};
