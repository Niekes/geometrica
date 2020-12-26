<template>
    <div class="home">
        <div class="control">
            <div class="control__radio">
                <div
                    v-for="shape in shapes"
                    :key="shape.name"
                    class="radio__wrapper"
                >
                    <input
                        :id="shape.name"
                        v-model="selectedShape"
                        name="shape"
                        type="radio"
                        :value="shape.name"
                        @change="draw"
                    >
                    <label
                        :for="shape.name"
                    >
                        <svg-icon :xlink="`#${shape.name}`" />
                    </label>
                </div>
            </div>
            <div class="control__shapes">
                <rect-control
                    v-if="selectedShape === 'rectangle'"
                    class="shapes__rectangle"
                    :rect="rect"
                    @rect-update="draw"
                />

                <circle-control
                    v-if="selectedShape === 'circle'"
                    class="shapes__circle"
                    :circle="circle"
                    @circle-update="draw"
                />

                <polygon-control
                    v-if="selectedShape === 'polygon'"
                    class="shapes__polygon"
                    :polygon="polygon"
                    @polygon-update="draw"
                />
            </div>
        </div>

        <div
            class="context"
        >
            <canvas
                class="context__canvas"
            />
        </div>
    </div>
</template>

<script>
import {
    select,
} from 'd3';

import SvgIcon from '@/components/SvgIcon';
import RectControl from '@/components/RectControl';
import CircleControl from '@/components/CircleControl';
import PolygonControl from '@/components/PolygonControl';
import rectMixin from '@/mixins/rect-mixin';
import circleMixin from '@/mixins/circle-mixin';
import polygonMixin from '@/mixins/polygon-mixin';

export default {
    name: 'Home',

    components: {
        SvgIcon,
        CircleControl,
        RectControl,
        PolygonControl,
    },

    mixins: [
        rectMixin,
        circleMixin,
        polygonMixin,
    ],

    data() {
        return {
            rect: {
                amount: 16,
                bgColor: '#000000',
                borderRadius: {
                    tl: 0, tr: 0, bl: 0, br: 0,
                },
                colorInterPolator: null,
                cx: 0,
                cy: 0,
                distance: 16,
                height: 256,
                calcOpacity: [],
                calcOpacityOptions: [
                    {
                        value: 'interpolate',
                        text: this.$t('home.interpolate'),
                    },
                    {
                        value: 'flip',
                        text: this.$t('home.flip'),
                    },
                ],
                flipColorInterpolator: false,
                flipColorInterpolatorOptions: [
                    {
                        value: true,
                        text: this.$t('home.yes'),
                    },
                    {
                        value: false,
                        text: this.$t('home.no'),
                    },
                ],
                rotation: 0,
                stroke: true,
                strokeOptions: [
                    {
                        value: true,
                        text: this.$t('home.stroke'),
                    },
                    {
                        value: false,
                        text: this.$t('home.fill'),
                    },
                ],
                strokeWidth: 3,
                calcStrokeWidth: [],
                calcStrokeWidthOptions: [
                    {
                        value: 'interpolate',
                        text: this.$t('home.interpolate'),
                    },
                    {
                        value: 'flip',
                        text: this.$t('home.flip'),
                    },
                ],
                width: 256,
            },
            circle: {
                amount: 16,
                bgColor: '#000000',
                colorInterPolator: null,
                cx: 0,
                cy: 0,
                distance: 16,
                flipColorInterpolator: false,
                flipColorInterpolatorOptions: [
                    {
                        value: true,
                        text: this.$t('home.yes'),
                    },
                    {
                        value: false,
                        text: this.$t('home.no'),
                    },
                ],
                strokeWidth: 3,
                calcStrokeWidth: [],
                calcStrokeWidthOptions: [
                    {
                        value: 'interpolate',
                        text: this.$t('home.interpolate'),
                    },
                    {
                        value: 'flip',
                        text: this.$t('home.flip'),
                    },
                ],
                calcOpacity: [],
                calcOpacityOptions: [
                    {
                        value: 'interpolate',
                        text: this.$t('home.interpolate'),
                    },
                    {
                        value: 'flip',
                        text: this.$t('home.flip'),
                    },
                ],
                radiusX: 256,
                radiusY: 256,
                rotation: 0,
                stroke: true,
                strokeOptions: [
                    {
                        value: true,
                        text: this.$t('home.stroke'),
                    },
                    {
                        value: false,
                        text: this.$t('home.fill'),
                    },
                ],
                startAngle: 0,
                endAngle: 360,
            },
            polygon: {
                amount: 16,
                bgColor: '#000000',
                borderRadius: 0,
                colorInterPolator: null,
                cx: 0,
                cy: 0,
                distance: 16,
                flipColorInterpolator: false,
                flipColorInterpolatorOptions: [
                    {
                        value: true,
                        text: this.$t('home.yes'),
                    },
                    {
                        value: false,
                        text: this.$t('home.no'),
                    },
                ],
                strokeWidth: 3,
                calcStrokeWidth: [],
                calcStrokeWidthOptions: [
                    {
                        value: 'interpolate',
                        text: this.$t('home.interpolate'),
                    },
                    {
                        value: 'flip',
                        text: this.$t('home.flip'),
                    },
                ],
                calcOpacity: [],
                calcOpacityOptions: [
                    {
                        value: 'interpolate',
                        text: this.$t('home.interpolate'),
                    },
                    {
                        value: 'flip',
                        text: this.$t('home.flip'),
                    },
                ],
                rotation: 0,
                sides: 5,
                size: 256,
                stroke: true,
                strokeOptions: [
                    {
                        value: true,
                        text: this.$t('home.stroke'),
                    },
                    {
                        value: false,
                        text: this.$t('home.fill'),
                    },
                ],
            },
            selectedShape: 'rectangle',
            shapes: [
                { name: 'rectangle' },
                { name: 'circle' },
                { name: 'polygon' },
            ],
        };
    },
    created() {
        this.PI = Math.PI;
        this.HALF_PI = this.PI / 2;
        this.TAU = this.PI * 2;
    },

    mounted() {
        const canvasSelection = select(this.$el).select('.context__canvas');

        canvasSelection.node().width = 1024;
        canvasSelection.node().height = 1024;

        this.canvasWidth = canvasSelection.node().width / 2;
        this.canvasHeight = canvasSelection.node().height / 2;
        this.canvasHalfWidth = this.canvasWidth / 2;
        this.canvasHalfHeight = this.canvasHeight / 2;

        canvasSelection.style('width', `${this.canvasWidth}px`);
        canvasSelection.style('height', `${this.canvasHeight}px`);

        this.ctx = canvasSelection.node().getContext('2d');

        this.ctx.scale(2, 2);

        this.draw();
    },

    methods: {
        async draw() {
            await this.$nextTick();

            switch (this.selectedShape) {
            case 'rectangle':
                this.drawRect();
                break;

            case 'circle':
                this.drawCircle();
                break;

            case 'polygon':
                this.drawPolygon();
                break;
            default:
                this.drawRect();
                break;
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.home {
    display: grid;
    grid-template-areas: "control context";
    grid-template-columns: minmax(0, 24rem) 1fr;
    grid-template-rows: minmax(0, 1fr);
    height: 100%;
}

.control {
    background-color: rgba($primary, 0.2);
    display: flex;
    flex-direction: column;
    overflow: auto;
    padding: $padding-y * 2 $padding-x * 2;

    &__radio {
        display: flex;
        padding-bottom: $padding-y * 2;

        .radio__wrapper {
            display: flex;
            flex: 1;

            input {
                display: none;

                + label {
                    background: $black-10;
                    color: $secondary;
                    cursor: pointer;
                    display: flex;
                    justify-content: center;
                    padding: $padding;
                    transition:
                        background $transition-duration $transition-timing-function,
                        color $transition-duration $transition-timing-function;
                    width: 100%;

                    &:hover {
                        background: rgba($black, 0.15);
                        color: $black-90;
                    }

                    svg {
                        height: 1rem;
                        width: 1rem;
                    }
                }

                &:checked + label {
                    background: $black-20;
                    color: $primary;
                }
            }

            &:first-child input + label {
                border-radius: $border-radius 0 0 $border-radius;
            }

            &:last-child input + label {
                border-radius: 0 $border-radius $border-radius 0;
            }
        }
    }

    &__shapes {
        display: flex;

        .shapes__rectangle,
        .shapes__circle,
        .shapes__polygon {
            width: 100%;
        }
    }
}

.context {
    align-items: center;
    background-color: $white;
    display: flex;
    justify-content: center;

    &__canvas {
        border: $border-width solid $black-50;
        border-radius: 10%;
        box-shadow: $box-shadow;
    }
}
</style>
