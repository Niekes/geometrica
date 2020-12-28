import {
    color,
} from 'd3';

export default {
    methods: {
        drawRect() {
            // this.ctx.fillStyle = this.rect.bgColor;
            this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

            const {
                amount,
                calcOpacity,
                calcStrokeWidth,
            } = this.rect;

            const radians = (this.rect.rotation * this.PI / 180);
            const adjustedAmount = amount - 1;

            const interpolateOpacity = calcOpacity.indexOf('interpolate') !== -1;
            const flipOpacity = calcOpacity.indexOf('flip') !== -1;

            const interpolateStrokeWidth = calcStrokeWidth.indexOf('interpolate') !== -1;
            const flipStrokeWidth = calcStrokeWidth.indexOf('flip') !== -1;

            for (let i = 0; i < this.rect.amount; i += 1) {
                if (this.rect.width - (i * this.rect.distance) < 0) return;
                if (this.rect.height - (i * this.rect.distance) < 0) return;

                const width = this.rect.width - (i * this.rect.distance);
                const height = this.rect.height - (i * this.rect.distance);
                const k = i / adjustedAmount;
                const flippedK = Math.abs(k - 1);
                const angle = radians / adjustedAmount * i;

                const cx = this.canvasHalfWidth + this.rect.cx;
                const cy = this.canvasHalfHeight + this.rect.cy * -1;
                const x = -width / 2;
                const y = -height / 2;

                const brTl = this.rect.borderRadius.tl * Math.min(width, height) / 2;
                const brTr = this.rect.borderRadius.tr * Math.min(width, height) / 2;
                const brBl = this.rect.borderRadius.bl * Math.min(width, height) / 2;
                const brBr = this.rect.borderRadius.br * Math.min(width, height) / 2;

                const c = color(this.rect.flipColorInterpolator
                    ? this.rect.colorInterPolator.fn(flippedK)
                    : this.rect.colorInterPolator.fn(k));

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
                    this.ctx.lineWidth = Math.max(this.rect.strokeWidth * k, 1e-10);
                }

                if (interpolateStrokeWidth && flipStrokeWidth) {
                    this.ctx.lineWidth = Math.max(this.rect.strokeWidth * flippedK, 1e-10);
                }

                if (!interpolateStrokeWidth) {
                    this.ctx.lineWidth = this.rect.strokeWidth;
                }

                this.ctx.moveTo(x + brTl, y);
                this.ctx.lineTo(x + width - brTr, y);
                this.ctx.quadraticCurveTo(x + width, y, x + width, y + brTr);
                this.ctx.lineTo(x + width, y + height - brBr);
                this.ctx.quadraticCurveTo(x + width, y + height, x + width - brBr, y + height);
                this.ctx.lineTo(x + brBl, y + height);
                this.ctx.quadraticCurveTo(x, y + height, x, y + height - brBl);
                this.ctx.lineTo(x, y + brTl);
                this.ctx.quadraticCurveTo(x, y, x + brTl, y);
                this.ctx.closePath();

                if (this.rect.stroke) {
                    this.ctx.strokeStyle = c.toString();
                    this.ctx.stroke();
                }

                if (!this.rect.stroke) {
                    this.ctx.fillStyle = c.toString();
                    this.ctx.fill();
                }
                this.ctx.restore();
            }
        },
    },
};
