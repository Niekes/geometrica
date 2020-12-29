import {
    color,
} from 'd3';

export default {
    methods: {
        drawCircle() {
            // this.ctx.fillStyle = this.circle.bgColor;
            this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

            const {
                amount,
                startAngle,
                endAngle,
                calcOpacity,
                calcStrokeWidth,
            } = this.circle;

            const radians = (this.circle.rotation * this.PI / 180);
            const adjustedAmount = amount - 1;

            const interpolateOpacity = calcOpacity.indexOf('interpolate') !== -1;
            const flipOpacity = calcOpacity.indexOf('flip') !== -1;

            const interpolateStrokeWidth = calcStrokeWidth.indexOf('interpolate') !== -1;
            const flipStrokeWidth = calcStrokeWidth.indexOf('flip') !== -1;

            const cx = this.canvasHalfWidth + this.circle.cx;
            const cy = this.canvasHalfHeight + this.circle.cy * -1;

            for (let i = 0; i < amount; i += 1) {
                if (this.circle.radiusX - (i * this.circle.distance) < 0) return;
                if (this.circle.radiusY - (i * this.circle.distance) < 0) return;

                const radiusX = this.circle.radiusX - (i * this.circle.distance);
                const radiusY = this.circle.radiusY - (i * this.circle.distance);
                const k = i / adjustedAmount;
                const angle = radians / adjustedAmount * i;

                const x = -radiusX + this.circle.radiusX - (i * this.circle.distance);
                const y = -radiusY + this.circle.radiusY - (i * this.circle.distance);

                const flippedK = Math.abs(k - 1);

                const c = color(this.circle.flipColorInterpolator
                    ? this.circle.colorInterPolator.fn(flippedK)
                    : this.circle.colorInterPolator.fn(k));

                if (interpolateOpacity) {
                    c.opacity = k;
                }

                if (interpolateOpacity && flipOpacity) {
                    c.opacity = flippedK;
                }

                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.translate(cx, cy);
                this.ctx.rotate(angle);

                if (interpolateStrokeWidth) {
                    this.ctx.lineWidth = Math.max(this.circle.strokeWidth * k, 1e-10);
                }

                if (interpolateStrokeWidth && flipStrokeWidth) {
                    this.ctx.lineWidth = Math.max(this.circle.strokeWidth * flippedK, 1e-10);
                }

                if (!interpolateStrokeWidth) {
                    this.ctx.lineWidth = this.circle.strokeWidth;
                }

                this.ctx.ellipse(
                    x,
                    y,
                    radiusX / 2,
                    radiusY / 2,
                    angle,
                    startAngle * this.PI / 180,
                    endAngle * this.PI / 180,
                );

                if (Math.abs(this.circle.startAngle - this.circle.endAngle) === 360) {
                    this.ctx.closePath();
                }

                if (this.circle.stroke) {
                    this.ctx.strokeStyle = c.toString();
                    this.ctx.stroke();
                }

                if (!this.circle.stroke) {
                    this.ctx.fillStyle = c.toString();
                    this.ctx.fill();
                }

                this.ctx.restore();
            }
        },
    },
};
