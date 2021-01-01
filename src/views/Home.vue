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
            </div>
            <div class="control__actions">
                <base-button
                    v-if="selectedShape === 'rect'"
                    :text="$t('home.resetRectangle').toUpperCase()"
                    @click.native="reset"
                />
                <base-button
                    v-if="selectedShape === 'circle'"
                    :text="$t('home.resetCircle').toUpperCase()"
                    @click.native="reset"
                />
                <base-button
                    v-if="selectedShape === 'polygon'"
                    :text="$t('home.resetPolygon').toUpperCase()"
                    @click.native="reset"
                />
                <base-button
                    :text="$t('home.copyLink').toUpperCase()"
                    @click.native="copyLink"
                />
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

        <div
            class="context"
        >
            <canvas
                class="context__canvas"
                :style="{
                    'background-color': canvasBackgroundColor,
                }"
                @contextmenu.prevent.stop
            />
        </div>
    </div>
</template>

<script>
import {
    select,
} from 'd3';

import {
    stringify,
} from 'qs';

import SvgIcon from '@/components/SvgIcon';
import BaseButton from '@/components/BaseButton';
import RectControl from '@/components/RectControl';
import CircleControl from '@/components/CircleControl';
import PolygonControl from '@/components/PolygonControl';
import rectMixin from '@/mixins/rect-mixin';
import circleMixin from '@/mixins/circle-mixin';
import polygonMixin from '@/mixins/polygon-mixin';
import clipboardMixin from '@/mixins/clipboard-mixin';

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
        clipboardMixin,
    ],

    data() {
        return {
            canvasBackgroundColor: '#000',
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

        this.ctx = canvasSelection.node().getContext('2d');

        this.ctx.scale(2, 2);
        this.ctx.imageSmoothingEnabled = false;

        this.draw();

        this.$root.$on('apply-icon', this.apply);

        this.$router.replace({
            ...this.$router.currentRoute,
            query: null,
        }).catch(() => {});
    },

    methods: {
        async draw() {
            await this.$nextTick();

            switch (this.selectedShape) {
            case 'rect':
                this.canvasBackgroundColor = this.rect.bgColor;
                this.drawRect();
                break;

            case 'circle':
                this.canvasBackgroundColor = this.circle.bgColor;
                this.drawCircle();
                break;

            case 'polygon':
                this.canvasBackgroundColor = this.polygon.bgColor;
                this.drawPolygon();
                break;
            default:
                this.canvasBackgroundColor = this.rect.bgColor;
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
        reset() {
            if (this.selectedShape === 'rect') {
                this.rect = {
                    ...Object.assign({}, config.shapes.rect),
                    borderRadius: Object.assign({}, config.shapes.rect.borderRadius),
                };
            }

            if (this.selectedShape === 'circle') {
                this.circle = {
                    ...Object.assign({}, config.shapes.circle),
                };
            }

            if (this.selectedShape === 'polygon') {
                this.polygon = {
                    ...Object.assign({}, config.shapes.polygon),
                };
            }

            this.draw();
        },
        copyLink() {
            if (this.selectedShape === 'rect') {
                const rect = this.removeOptions(this.rect);
                const link = stringify({ shape: 'rect', ...rect }, { arrayFormat: 'comma' });

                this.copyToClipboard({
                    text: `${config.url}?${link}`,
                });
            }

            if (this.selectedShape === 'circle') {
                const circle = this.removeOptions(this.circle);
                const link = stringify({ shape: 'circle', ...circle }, { arrayFormat: 'comma' });

                this.copyToClipboard({
                    text: `${config.url}?${link}`,
                });
            }

            if (this.selectedShape === 'polygon') {
                const polygon = this.removeOptions(this.polygon);
                const link = stringify({ shape: 'polygon', ...polygon }, { arrayFormat: 'comma' });

                this.copyToClipboard({
                    text: `${config.url}?${link}`,
                });
            }
        },

        removeOptions(obj) {
            const object = Object.assign({}, obj);

            delete object.calcOpacityOptions;
            delete object.calcStrokeWidthOptions;
            delete object.strokeOptions;
            delete object.flipColorInterpolatorOptions;

            return object;
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
}

.control {
    background-color: $primary;
    display: grid;
    gap: 0;
    grid-area: control;
    grid-template-areas: "radio" "shapes" "actions";
    grid-template-columns: 1fr;
    grid-template-rows: min-content 1fr min-content;
    overflow: auto;
    padding: $padding-y $padding-x;

    &__radio {
        border: $border-width solid $tertiary;
        border-radius: $border-radius;
        display: flex;
        grid-area: radio;
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
        grid-area: shapes;

        .shapes__rectangle,
        .shapes__circle,
        .shapes__polygon {
            width: 100%;
        }
    }

    &__actions {
        grid-area: actions;

        button {
            width: 100%;

            &:not(:last-child) {
                margin-bottom: $margin-y;
            }
        }
    }
}

.context {
    align-items: center;
    background-color: $white;
    display: flex;
    grid-area: context;
    justify-content: center;
    padding: $padding-y * 2 $padding-x * 2;

    &__canvas {
        border: $border-width solid $black-50;
        border-radius: 10%;
        box-shadow: $box-shadow;
        max-height: 75%;
        max-width: 75%;
    }
}

@media (max-width: $breakpoint-md) {
    .home {
        display: grid;
        grid-template-areas: "context" "control";
        grid-template-columns: 1fr;
        grid-template-rows: minmax(0, 1.5fr) minmax(0, 3fr);
    }

    .context {
        border-bottom: $border-width solid $black-50;
        border-radius: 0;

        &__canvas {
            height: auto !important;
            max-height: 100%;
            width: auto !important;
        }
    }
}
</style>
