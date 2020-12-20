import {
    color,
} from 'd3';

export default {
    methods: {
        drawRect() {
            this.ctx.fillStyle = this.rect.bgColor;

            const {
                amount,
            } = this.rect;

            const radians = (this.rect.rotation * this.PI / 180);
            const adjustedAmount = amount - 1;

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

                const brTl = this.rect.borderRadius.tl / 100 * Math.min(width, height) / 2;
                const brTr = this.rect.borderRadius.tr / 100 * Math.min(width, height) / 2;
                const brBl = this.rect.borderRadius.bl / 100 * Math.min(width, height) / 2;
                const brBr = this.rect.borderRadius.br / 100 * Math.min(width, height) / 2;

                const c = color(this.rect.flipColorInterpolator
                    ? this.rect.colorInterPolator(flippedK)
                    : this.rect.colorInterPolator(k));

                if (this.rect.interpolateOpacity) {
                    c.opacity = k;
                }

                if (this.rect.interpolateOpacity && this.rect.flipOpacity) {
                    c.opacity = flippedK;
                }


                this.ctx.save();

                if (this.rect.stroke) {
                    this.ctx.strokeStyle = c.toString();
                }

                if (!this.rect.stroke) {
                    this.ctx.fillStyle = c.toString();
                }

                this.ctx.beginPath();

                this.ctx.translate(cx, cy);
                this.ctx.rotate(angle);

                if (this.rect.interpolateStrokeWidth) {
                    this.ctx.lineWidth = Math.max(this.rect.strokeWidth * k, 1e-10);
                }

                if (this.rect.interpolateStrokeWidth && this.rect.flipStrokeWidth) {
                    this.ctx.lineWidth = Math.max(this.rect.strokeWidth * flippedK, 1e-10);
                }

                if (!this.rect.interpolateStrokeWidth) {
                    this.ctx.lineWidth = this.rect.strokeWidth;
                }

                this.ctx.beginPath();
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
                    this.ctx.stroke();
                }

                if (!this.rect.stroke) {
                    this.ctx.fill();
                }
                this.ctx.restore();
            }
        },
    },
};
