<template>
    <div class="rect-control">
        <div class="rect-control__general">
            <div
                class="general__caption"
                @click="toggle"
                v-text="$t('home.rectangles')"
            />
            <div class="general__content hidden">
                <input-range
                    v-model.number="rect.amount"
                    class="sliders__input"
                    :min="2"
                    :max="1000"
                    :step="1"
                    :label="$tc('home.amountN', rect.amount)"
                    @input.native="$emit('rect-update')"
                    @add="(step) => { rect.amount += step; $emit('rect-update')}"
                    @subtract="(step) => { rect.amount -= step; $emit('rect-update')}"
                />

                <input-range
                    v-model.number="rect.distance"
                    class="sliders__input"
                    :min="-64"
                    :max="64"
                    :step="0.1"
                    :label="$tc('home.distance', format(f.float)(rect.distance))"
                    @input.native="$emit('rect-update')"
                    @add="(step) => { rect.distance += step; $emit('rect-update')}"
                    @subtract="(step) => { rect.distance -= step; $emit('rect-update')}"
                />

                <input-range
                    v-model.number="rect.rotation"
                    class="sliders__input"
                    :min="-1440"
                    :max="1440"
                    :step="1"
                    :label="$tc('home.offsetRotation', rect.rotation)"
                    @input.native="$emit('rect-update')"
                    @add="(step) => { rect.rotation += step; $emit('rect-update')}"
                    @subtract="(step) => { rect.rotation -= step; $emit('rect-update')}"
                />

                <input-radio
                    :id="'how-to-draw-shape'"
                    v-model="rect.stroke"
                    class="radio__input"
                    :options="rect.strokeOptions"
                    :label="$t('home.howToDrawShape')"
                    @change.native="$emit('rect-update')"
                />

                <base-button
                    :text="$t('home.reset')"
                    @click.native="resetRectangles"
                />
            </div>
        </div>

        <div class="rect-control__border-radius">
            <div
                class="border-radius__caption"
                @click="toggle"
                v-text="$t('home.borderRadius')"
            />
            <div class="border-radius__content hidden">
                <input-range
                    v-model.number="rect.borderRadius.tl"
                    class="sliders__input border-radius__tl"
                    :min="0"
                    :max="1"
                    :step="0.01"
                    :label="$tc(
                        'home.topLeftN',
                        format(f.percent)(rect.borderRadius.tl / 2),
                    )"
                    @input.native="handleBorderRadiusTopLeft"
                    @add="(step) => {
                        rect.borderRadius.tl += step;
                        handleBorderRadiusTopLeft();
                    }"
                    @subtract="(step) => {
                        rect.borderRadius.tl -= step;
                        handleBorderRadiusTopLeft();
                    }"
                />

                <input-range
                    v-model.number="rect.borderRadius.tr"
                    class="sliders__input border-radius__tr"
                    :min="0"
                    :max="1"
                    :step="0.01"
                    :label="$tc(
                        'home.topRightN',
                        format(f.percent)(rect.borderRadius.tr / 2)
                    )"
                    @input.native="handleBorderRadiusTopRight"
                    @add="(step) => {
                        rect.borderRadius.tr += step;
                        handleBorderRadiusTopRight();
                    }"
                    @subtract="(step) => {
                        rect.borderRadius.tr -= step;
                        handleBorderRadiusTopRight();
                    }"
                />

                <input-range
                    v-model.number="rect.borderRadius.bl"
                    class="sliders__input border-radius__bl"
                    :min="0"
                    :max="1"
                    :step="0.01"
                    :label="$tc(
                        'home.bottomLeftN',
                        format(f.percent)(rect.borderRadius.bl / 2)
                    )"
                    @input.native="handleBorderRadiusBottomLeft"
                    @add="(step) => {
                        rect.borderRadius.bl += step;
                        handleBorderRadiusBottomLeft();
                    }"
                    @subtract="(step) => {
                        rect.borderRadius.bl -= step;
                        handleBorderRadiusBottomLeft();
                    }"
                />

                <input-range
                    v-model.number="rect.borderRadius.br"
                    class="sliders__input border-radius__br"
                    :min="0"
                    :max="1"
                    :step="0.01"
                    :label="$tc(
                        'home.bottomRightN',
                        format(f.percent)(rect.borderRadius.br / 2),
                    )"
                    @input.native="handleBorderRadiusBottomRight"
                    @add="(step) => {
                        rect.borderRadius.br += step;
                        handleBorderRadiusBottomRight();
                    }"
                    @subtract="(step) => {
                        rect.borderRadius.br -= step;
                        handleBorderRadiusBottomRight();
                    }"
                />

                <button
                    class="border-radius__lock"
                    @click="rect.borderRadiusIsLocked = !rect.borderRadiusIsLocked"
                >
                    <svg-icon
                        :xlink="rect.borderRadiusIsLocked ? '#lock-closed' : '#lock-open'"
                    />
                </button>

                <base-button
                    class="border-radius__reset"
                    :text="$t('home.reset')"
                    @click.native="resetBorderRadius"
                />
            </div>
        </div>

        <div
            class="rect-control__stroke-width"
            :class="{
                'rect-control__stroke-width--disabled': !rect.stroke,
            }"
        >
            <div
                class="stroke-width__caption"
                @click="toggle"
                v-text="$t('home.strokeWidth')"
            />
            <div class="stroke-width__content hidden">
                <input-range
                    v-model.number="rect.strokeWidth"
                    class="sliders__input"
                    :min="1"
                    :max="30"
                    :step="0.1"
                    :label="$tc('home.strokeWidthN', format(f.float)(rect.strokeWidth))"
                    @input.native="$emit('rect-update')"
                    @add="(step) => { rect.strokeWidth += step; $emit('rect-update')}"
                    @subtract="(step) => { rect.strokeWidth -= step; $emit('rect-update')}"
                />

                <input-checkbox
                    :id="'stroke-width'"
                    v-model="rect.calcStrokeWidth"
                    class="checkbox__input"
                    :options="rect.calcStrokeWidthOptions"
                    :label="$t('home.strokeWidth')"
                    @change.native="$emit('rect-update')"
                />

                <base-button
                    :text="$t('home.reset')"
                    @click.native="resetStrokeWidth"
                />
            </div>
        </div>

        <div class="rect-control__color">
            <div
                class="color__caption"
                @click="toggle"
                v-text="$t('home.color')"
            />
            <div class="color__content hidden">
                <input-checkbox
                    :id="'opacity'"
                    v-model="rect.calcOpacity"
                    class="checkbox__input"
                    :options="rect.calcOpacityOptions"
                    :label="$t('home.opacity')"
                    @change.native="$emit('rect-update')"
                />

                <input-checkbox
                    :id="'flip-color-interpolator'"
                    v-model="rect.flipColorInterpolator"
                    class="radio__input"
                    :options="rect.flipColorInterpolatorOptions"
                    :label="$t('home.flipColorScheme')"
                    @change.native="$emit('rect-update')"
                />

                <color-interpolator
                    :active="rect.colorInterPolator"
                    @update-color-interpolator="setColorInterPolator"
                />

                <base-button
                    :text="$t('home.reset')"
                    @click.native="resetColor"
                />
            </div>
        </div>

        <div class="rect-control__size">
            <div
                class="size__caption"
                @click="toggle"
                v-text="$t('home.size')"
            />
            <div class="size__content hidden">
                <input-range
                    v-model.number="rect.width"
                    class="sliders__input width"
                    :min="1"
                    :max="512"
                    :step="1"
                    :label="$tc('home.width', rect.width)"
                    @input.native="handleWidth"
                    @add="(step) => { rect.width += step; handleWidth()}"
                    @subtract="(step) => { rect.width -= step; handleWidth()}"
                />

                <input-range
                    v-model.number="rect.height"
                    class="sliders__input height"
                    :min="1"
                    :max="512"
                    :step="1"
                    :label="$tc('home.height', rect.height)"
                    @input.native="handleHeight"
                    @add="(step) => { rect.height += step; handleHeight()}"
                    @subtract="(step) => { rect.height -= step; handleHeight()}"
                />

                <button
                    class="size__lock"
                    @click="rect.sizeIsLocked = !rect.sizeIsLocked"
                >
                    <svg-icon
                        :xlink="rect.sizeIsLocked ? '#lock-closed' : '#lock-open'"
                    />
                </button>

                <base-button
                    class="size__reset"
                    :text="$t('home.reset')"
                    @click.native="resetSize"
                />
            </div>
        </div>
        <div class="rect-control__position">
            <div
                class="position__caption"
                @click="toggle"
                v-text="$t('home.position')"
            />

            <div class="position__content hidden">
                <input-range
                    v-model.number="rect.cx"
                    class="sliders__input"
                    :min="-256"
                    :max="256"
                    :step="0.1"
                    :label="$tc('home.centerX', format(f.float)(rect.cx))"
                    @input.native="$emit('rect-update')"
                    @add="(step) => { rect.cx += step; $emit('rect-update')}"
                    @subtract="(step) => { rect.cx -= step; $emit('rect-update')}"
                />

                <input-range
                    v-model.number="rect.cy"
                    class="sliders__input"
                    :min="-256"
                    :max="256"
                    :step="0.1"
                    :label="$tc('home.centerY', format(f.float)(rect.cy))"
                    @input.native="$emit('rect-update')"
                    @add="(step) => { rect.cy += step; $emit('rect-update')}"
                    @subtract="(step) => { rect.cy -= step; $emit('rect-update')}"
                />
                <base-button
                    :text="$t('home.reset')"
                    @click.native="resetPosition"
                />
            </div>
        </div>

        <div class="rect-control__background">
            <div
                class="background__caption"
                @click="toggle"
                v-text="$t('home.background')"
            />

            <div class="background__content hidden">
                <input
                    id="bg-color"
                    v-model="rect.bgColor"
                    type="color"
                    name="bg-color"
                    @input="$emit('rect-update')"
                >

                <input-range
                    v-model.number="rect.bgBorderRadius"
                    class="sliders__input"
                    :min="0"
                    :max="50"
                    :step="1"
                    :label="$tc(
                        'home.borderRadiusN',
                        format(f.percent)(rect.bgBorderRadius / 100),
                    )"
                    @input.native="$emit('rect-update')"
                    @add="(step) => { rect.bgBorderRadius += step; $emit('rect-update')}"
                    @subtract="(step) => { rect.bgBorderRadius -= step; $emit('rect-update')}"
                />

                <span v-text="$t('home.bgHint')" />
            </div>
        </div>
    </div>
</template>

<script>
import {
    select,
    format,
} from 'd3';

import BaseButton from '@/components/BaseButton';
import InputRange from '@/components/InputRange';
import InputRadio from '@/components/InputRadio';
import InputCheckbox from '@/components/InputCheckbox';
import ColorInterpolator from '@/components/ColorInterpolator';
import SvgIcon from '@/components/SvgIcon';

import config from '@/config';

const {
    format: f,
    shapes,
} = config;

export default {
    name: 'RectControl',

    components: {
        BaseButton,
        ColorInterpolator,
        InputCheckbox,
        InputRadio,
        InputRange,
        SvgIcon,
    },

    props: {
        rect: {
            type: Object,
            required: true,
        },
    },

    created() {
        this.f = f;
    },

    methods: {
        setColorInterPolator(interpolator) {
            this.rect.colorInterPolator = interpolator.name;

            this.$emit('rect-update');
        },
        handleBorderRadiusTopLeft() {
            if (this.rect.borderRadiusIsLocked) {
                this.rect.borderRadius.tr = this.rect.borderRadius.tl;
                this.rect.borderRadius.bl = this.rect.borderRadius.tl;
                this.rect.borderRadius.br = this.rect.borderRadius.tl;
            }

            this.$emit('rect-update');
        },
        handleBorderRadiusTopRight() {
            if (this.rect.borderRadiusIsLocked) {
                this.rect.borderRadius.tl = this.rect.borderRadius.tr;
                this.rect.borderRadius.bl = this.rect.borderRadius.tr;
                this.rect.borderRadius.br = this.rect.borderRadius.tr;
            }

            this.$emit('rect-update');
        },
        handleBorderRadiusBottomLeft() {
            if (this.rect.borderRadiusIsLocked) {
                this.rect.borderRadius.tl = this.rect.borderRadius.bl;
                this.rect.borderRadius.tr = this.rect.borderRadius.bl;
                this.rect.borderRadius.br = this.rect.borderRadius.bl;
            }

            this.$emit('rect-update');
        },
        handleBorderRadiusBottomRight() {
            if (this.rect.borderRadiusIsLocked) {
                this.rect.borderRadius.tl = this.rect.borderRadius.br;
                this.rect.borderRadius.tr = this.rect.borderRadius.br;
                this.rect.borderRadius.bl = this.rect.borderRadius.br;
            }

            this.$emit('rect-update');
        },
        handleWidth() {
            if (this.rect.sizeIsLocked) {
                this.rect.height = this.rect.width;
            }

            this.$emit('rect-update');
        },
        handleHeight() {
            if (this.rect.sizeIsLocked) {
                this.rect.width = this.rect.height;
            }

            this.$emit('rect-update');
        },
        toggle(e) {
            const isHidden = select(e.target.nextSibling).classed('hidden');

            select(e.target.nextSibling).classed('hidden', !isHidden);
        },
        resetRectangles() {
            this.rect.amount = shapes.rect.amount;
            this.rect.distance = shapes.rect.distance;
            this.rect.rotation = shapes.rect.rotation;
            this.rect.stroke = shapes.rect.stroke;

            this.$emit('rect-update');
        },
        resetBorderRadius() {
            this.rect.borderRadius.tl = shapes.rect.borderRadius.tl;
            this.rect.borderRadius.tr = shapes.rect.borderRadius.tr;
            this.rect.borderRadius.bl = shapes.rect.borderRadius.bl;
            this.rect.borderRadius.br = shapes.rect.borderRadius.br;
            this.rect.borderRadiusIsLocked = shapes.rect.borderRadiusIsLocked;

            this.$emit('rect-update');
        },
        resetStrokeWidth() {
            this.rect.strokeWidth = shapes.rect.strokeWidth;
            this.rect.calcStrokeWidth = shapes.rect.calcStrokeWidth;

            this.$emit('rect-update');
        },
        resetColor() {
            this.rect.calcOpacity = shapes.rect.calcOpacity;
            this.rect.flipColorInterpolator = shapes.rect.flipColorInterpolator;
            this.rect.colorInterPolator = shapes.rect.colorInterPolator;

            this.$emit('rect-update');
        },
        resetSize() {
            this.rect.width = shapes.rect.width;
            this.rect.height = shapes.rect.height;
            this.rect.sizeIsLocked = shapes.rect.sizeIsLocked;

            this.$emit('rect-update');
        },
        resetPosition() {
            this.rect.cx = shapes.rect.cx;
            this.rect.cy = shapes.rect.cy;

            this.$emit('rect-update');
        },
        format,
    },
};
</script>

<style lang="scss" scoped>
.rect-control {
    display: flex;
    flex-direction: column;

    &__general,
    &__border-radius,
    &__stroke-width,
    &__color,
    &__size,
    &__background,
    &__position {
        border: $border-width solid $tertiary;
        border-radius: $border-radius;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        margin-bottom: $margin-y;
        overflow: hidden;

        &--disabled {
            cursor: not-allowed;
            opacity: 0.75;
            pointer-events: none;
        }

        div[class$="__caption"] {
            background: $tertiary;
            color: $primary;
            cursor: pointer;
            font-weight: 400;
            padding: $padding-y $padding-x;
            text-transform: uppercase;
            transition: background $transition-duration $transition-timing-function;

            &:hover {
                background: rgba($tertiary, 0.9);
            }
        }

        div[class$="__content"] {
            background:
                linear-gradient(
                    45deg,
                    rgba($tertiary, 0.5),
                    rgba(lighten($tertiary, 10%), 0.5),
                );
            cursor: pointer;
            padding: $padding-y $padding-x;

            .sliders__input,
            .radio__input,
            .checkbox__input {
                &:not(:last-child) {
                    margin-bottom: $margin-y;
                }
            }
        }
    }

    &__background {
        div[class$="__content"] {
            display: flex;
            flex-direction: column;
        }

        span {
            color: $white-75;
            font-size: $font-size * 0.75;
            padding-top: $padding-y / 2;
            text-align: center;
        }
    }

    .border-radius__content {
        display: grid;
        gap: 0 $margin-x;
        grid-template-areas:
            "border-radius-tl border-radius-lock"
            "border-radius-tr border-radius-lock"
            "border-radius-bl border-radius-lock"
            "border-radius-br border-radius-lock"
            "border-radius-reset border-radius-reset";
        grid-template-columns: 1fr min-content;
        grid-template-rows: 1fr 1fr 1fr 1fr min-content;
    }

    .border-radius__tl {
        grid-area: border-radius-tl;
    }

    .border-radius__tr {
        grid-area: border-radius-tr;
    }

    .border-radius__bl {
        grid-area: border-radius-bl;
    }

    .border-radius__br {
        grid-area: border-radius-br;
    }

    .border-radius__reset {
        grid-area: border-radius-reset;
    }

    .size__content {
        display: grid;
        gap: 0 $margin-x;
        grid-template-areas:
            "width size-lock"
            "height size-lock"
            "size-reset size-reset";
        grid-template-columns: 1fr min-content;
        grid-template-rows: 1fr 1fr min-content;
    }

    .width {
        grid-area: width;
    }

    .height {
        grid-area: height;
    }

    .size__lock {
        grid-area: size-lock;
    }

    .size__reset {
        grid-area: size-reset;
    }

    .border-radius__lock {
        grid-area: border-radius-lock;
    }

    .size__lock,
    .border-radius__lock {
        background: transparent;
        border-bottom: $border-width solid $white-70;
        border-left: 0;
        border-radius: 0 $border-radius $border-radius 0;
        border-right: $border-width solid $white-70;
        border-top: $border-width solid $white-70;
        color: $white;
        cursor: pointer;
        margin: $margin-y * 1.6 0 $margin-y 0;
        padding: 0 $padding-x / 4;
        transition: background $transition-duration / 2 $transition-timing-function;

        svg {
            height: 1rem;
            width: 1rem;
        }

        &:focus {
            outline: none;
        }

        &:hover {
            background: $white-10;
        }
    }
}
</style>
