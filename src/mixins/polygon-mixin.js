import {
    color,
} from 'd3';

export default {
    methods: {
        drawPolygon() {
            this.ctx.fillStyle = this.polygon.bgColor;

            const {
                amount,
            } = this.polygon;

            const radians = (this.polygon.rotation * this.PI / 180);
            const adjustedAmount = amount - 1;

            for (let i = 0; i < amount; i += 1) {
                if (this.polygon.size - (i * this.polygon.distance) < 0) return;

                const size = this.polygon.size - (-i * this.polygon.distance);
                const k = i / adjustedAmount;
                const flippedK = Math.abs(k - 1);
                const angle = radians / (adjustedAmount) * i;

                const cx = this.canvasHalfWidth + this.polygon.cx;
                const cy = this.canvasHalfHeight + this.polygon.cy * -1;
                const x = -size / 2;
                const y = -size / 2;

                const c = color(this.polygon.flipColorInterpolator
                    ? this.polygon.colorInterPolator(flippedK)
                    : this.polygon.colorInterPolator(k));

                if (this.polygon.interpolateOpacity) {
                    c.opacity = k;
                }

                if (this.polygon.interpolateOpacity && this.polygon.flipOpacity) {
                    c.opacity = flippedK;
                }


                this.ctx.save();
                if (this.polygon.stroke) {
                    this.ctx.strokeStyle = c.toString();
                }

                if (!this.polygon.stroke) {
                    this.ctx.fillStyle = c.toString();
                }

                this.ctx.beginPath();

                this.ctx.translate(cx, cy);
                this.ctx.rotate(angle - this.PI / 2);

                if (this.polygon.interpolateStrokeWidth) {
                    this.ctx.lineWidth = this.polygon.strokeWidth * k + 0.00000001;
                }

                if (this.polygon.interpolateStrokeWidth && this.flipStrokeWidth) {
                    this.ctx.lineWidth = this.polygon.strokeWidth * flippedK + 0.00000001;
                }

                if (!this.polygon.interpolateStrokeWidth) {
                    this.ctx.lineWidth = this.polygon.strokeWidth;
                }

                this.ctx.moveTo(
                    ((x + this.polygon.size) * Math.cos(0)),
                    (y + this.polygon.size) * Math.sin(0),
                );

                for (let side = 0; side < this.polygon.sides + 1; side += 1) {
                    this.ctx.lineTo(
                        (x + this.polygon.size) * Math.cos(side * 2 * this.PI / this.polygon.sides),
                        (y + this.polygon.size) * Math.sin(side * 2 * this.PI / this.polygon.sides),
                    );
                }

                this.ctx.closePath();

                if (this.polygon.stroke) {
                    this.ctx.stroke();
                }

                if (!this.polygon.stroke) {
                    this.ctx.fill();
                }

                this.ctx.restore();
            }
        },
    },
};
