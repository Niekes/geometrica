import {
    color,
} from 'd3';

export default {
    methods: {
        drawCircle() {
            for (let i = 0; i < this.circle.amount; i += 1) {
                if (this.circle.radiusX - (i * this.circle.distance) < 0) return;
                if (this.circle.radiusY - (i * this.circle.distance) < 0) return;

                const adjustedAmount = this.circle.amount - 1;
                const radiusX = this.circle.radiusX - (i * this.circle.distance);
                const radiusY = this.circle.radiusY - (i * this.circle.distance);
                const k = i / adjustedAmount;
                const angle = (this.circle.rotation * this.PI / 180) / (adjustedAmount) * i;

                const cx = this.canvasHalfWidth + this.cx;
                const cy = this.canvasHalfHeight + this.cy * -1;

                const x = -radiusX + this.circle.radiusX - (i * this.circle.distance);
                const y = -radiusY + this.circle.radiusY - (i * this.circle.distance);

                const flippedK = Math.abs(k - 1);

                const c = color(this.flipColorInterpolator
                    ? this.colorInterPolator(flippedK)
                    : this.colorInterPolator(k));

                if (this.circle.interpolateOpacity) {
                    c.opacity = k;
                }

                if (this.interpolateOpacity && this.flipOpacity) {
                    c.opacity = flippedK;
                }

                this.ctx.save();
                if (this.stroke) {
                    this.ctx.strokeStyle = c.toString();
                }

                if (!this.stroke) {
                    this.ctx.fillStyle = c.toString();
                }

                this.ctx.beginPath();

                this.ctx.translate(cx, cy);
                this.ctx.rotate(angle);

                if (this.interpolateLineWidth) {
                    this.ctx.lineWidth = this.circle.lineWidth * k + 0.00000001;
                }

                if (this.interpolateLineWidth && this.flipLineWidth) {
                    this.ctx.lineWidth = this.circle.lineWidth * flippedK + 0.00000001;
                }

                if (!this.interpolateLineWidth) {
                    this.ctx.lineWidth = this.circle.lineWidth;
                }

                this.ctx.ellipse(x, y, radiusX / 2, radiusY / 2, angle, 0, this.TAU);
                this.ctx.closePath();

                if (this.stroke) {
                    this.ctx.stroke();
                }

                if (!this.stroke) {
                    this.ctx.fill();
                }
                this.ctx.restore();
            }
        },
    },
};
