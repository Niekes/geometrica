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
                    v-if="selectedShape === 'rect'"
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

                <div class="shapes__actions">
                    <base-button
                        :text="$t('home.openGallery').toUpperCase()"
                        @click.native="$store.dispatch('modal/openGallery')"
                    />
                    <base-button
                        :variant="2"
                        :text="$t('home.download')"
                        @click.native="$store.dispatch('modal/openDownload')"
                    />
                </div>
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
import BaseButton from '@/components/BaseButton';
import RectControl from '@/components/RectControl';
import CircleControl from '@/components/CircleControl';
import PolygonControl from '@/components/PolygonControl';
import rectMixin from '@/mixins/rect-mixin';
import circleMixin from '@/mixins/circle-mixin';
import polygonMixin from '@/mixins/polygon-mixin';

import config from '@/config';

export default {
    name: 'Home',

    components: {
        BaseButton,
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
                ...Object.assign({}, config.shapes.rect),
                borderRadius: Object.assign({}, config.shapes.rect.borderRadius),
            },
            circle: Object.assign({}, config.shapes.circle),
            polygon: Object.assign({}, config.shapes.polygon),
            selectedShape: config.shapes.selected,
            shapes: [
                { name: 'rect' },
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
        this.ctx.imageSmoothingEnabled = false;

        this.draw();

        this.$root.$on('apply-icon', this.apply);
    },

    methods: {
        async draw() {
            await this.$nextTick();

            switch (this.selectedShape) {
            case 'rect':
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
        apply(icon) {
            this.selectedShape = icon.shape;

            if (icon.shape === 'rect') {
                this.rect = {
                    ...Object.assign({}, config.shapes.rect),
                    ...icon.parameters,
                    borderRadius: {
                        ...icon.parameters.borderRadius,
                    },
                };
            }

            if (icon.shape === 'circle') {
                this.circle = {
                    ...Object.assign({}, config.shapes.circle),
                    ...icon.parameters,
                };
            }

            if (icon.shape === 'polygon') {
                this.polygon = {
                    ...Object.assign({}, config.shapes.polygon),
                    ...icon.parameters,
                };
            }

            this.draw();
        },
    },
};
</script>

<style lang="scss" scoped>
.home {
    display: grid;
    grid-template-areas: "control context";
    grid-template-columns: minmax(0, 21rem) 1fr;
    grid-template-rows: minmax(0, 1fr);
    height: 100%;
}

.control {
    background-color: $primary;
    display: flex;
    flex-direction: column;
    overflow: auto;
    padding: $padding-y $padding-x;

    &__radio {
        border: $border-width solid $tertiary;
        border-radius: $border-radius;
        display: flex;
        flex-shrink: 0;
        margin-bottom: $margin-y;
        overflow: hidden;

        .radio__wrapper {
            display: flex;
            flex: 1;

            input {
                display: none;

                + label {
                    background: $secondary;
                    color: $white-50;
                    cursor: pointer;
                    display: flex;
                    justify-content: center;
                    padding: $padding;
                    transition:
                        background $transition-duration $transition-timing-function,
                        color $transition-duration $transition-timing-function;
                    width: 100%;

                    &:hover {
                        background: rgba($primary, 0.9);
                        color: rgba($tertiary, 0.75);
                    }

                    svg {
                        height: 1rem;
                        width: 1rem;
                    }
                }

                &:checked + label {
                    background: $primary;
                    color: $tertiary;
                }
            }
        }
    }

    &__shapes {
        display: flex;
        flex-direction: column;
        height: 100%;
        justify-content: space-between;

        .shapes__rectangle,
        .shapes__circle,
        .shapes__polygon {
            width: 100%;
        }

        .shapes__actions {
            width: 100%;

            button {
                width: 100%;

                &:not(:last-child) {
                    margin-bottom: $margin-y;
                }
            }
        }
    }
}

.context {
    align-items: center;
    background-color: $white;
    display: flex;
    justify-content: center;

    &__canvas {
        background: $black;
        border: $border-width solid $black-50;
        border-radius: 10%;
        box-shadow: $box-shadow;
    }
}
</style>
