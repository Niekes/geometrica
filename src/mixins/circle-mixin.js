import {
    color,
} from 'd3';

export default {
    methods: {
        drawCircle() {
            this.ctx.fillStyle = this.circle.bgColor;

            const {
                amount,
            } = this.circle;

            const radians = (this.circle.rotation * this.PI / 180);
            const adjustedAmount = amount - 1;

            for (let i = 0; i < amount; i += 1) {
                if (this.circle.radiusX - (i * this.circle.distance) < 0) return;
                if (this.circle.radiusY - (i * this.circle.distance) < 0) return;

                const radiusX = this.circle.radiusX - (i * this.circle.distance);
                const radiusY = this.circle.radiusY - (i * this.circle.distance);
                const k = i / adjustedAmount;
                const angle = radians / adjustedAmount * i;

                const cx = this.canvasHalfWidth + this.circle.cx;
                const cy = this.canvasHalfHeight + this.circle.cy * -1;

                const x = -radiusX + this.circle.radiusX - (i * this.circle.distance);
                const y = -radiusY + this.circle.radiusY - (i * this.circle.distance);

                const flippedK = Math.abs(k - 1);

                const c = color(this.circle.flipColorInterpolator
                    ? this.circle.colorInterPolator(flippedK)
                    : this.circle.colorInterPolator(k));

                if (this.circle.interpolateOpacity) {
                    c.opacity = k;
                }

                if (this.circle.interpolateOpacity && this.circle.flipOpacity) {
                    c.opacity = flippedK;
                }

                this.ctx.save();
                if (this.circle.stroke) {
                    this.ctx.strokeStyle = c.toString();
                }

                if (!this.circle.stroke) {
                    this.ctx.fillStyle = c.toString();
                }

                this.ctx.beginPath();

                this.ctx.translate(cx, cy);
                this.ctx.rotate(angle);

                if (this.circle.interpolateStrokeWidth) {
                    this.ctx.lineWidth = this.circle.strokeWidth * k + 0.00000001;
                }

                if (this.circle.interpolateStrokeWidth && this.circle.flipStrokeWidth) {
                    this.ctx.lineWidth = this.circle.strokeWidth * flippedK + 0.00000001;
                }

                if (!this.circle.interpolateStrokeWidth) {
                    this.ctx.lineWidth = this.circle.strokeWidth;
                }

                this.ctx.ellipse(
                    x,
                    y,
                    radiusX / 2,
                    radiusY / 2,
                    angle,
                    this.circle.startAngle,
                    this.circle.endAngle,
                );

                if (this.circle.stroke) {
                    this.ctx.stroke();
                }

                if (!this.circle.stroke) {
                    this.ctx.fill();
                }
                this.ctx.restore();
            }
        },
    },
};
