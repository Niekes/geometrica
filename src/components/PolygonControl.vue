<template>
    <div class="polygon-control">
        <div class="polygon-control__general">
            <div
                class="general__caption"
                @click="toggle"
                v-text="$t('home.polygons')"
            />
            <div class="general__content hidden">
                <input-range
                    v-model.number="polygon.amount"
                    class="sliders__input"
                    :min="2"
                    :max="1000"
                    :step="1"
                    :label="$tc('home.amountN', polygon.amount)"
                    @input.native="$emit('polygon-update')"
                    @add="(step) => { polygon.amount += step; $emit('polygon-update')}"
                    @subtract="(step) => { polygon.amount -= step; $emit('polygon-update')}"
                />

                <input-range
                    v-model.number="polygon.distance"
                    class="sliders__input"
                    :min="-64"
                    :max="64"
                    :step="0.1"
                    :label="$tc('home.distance', format(f.float)(polygon.distance))"
                    @input.native="$emit('polygon-update')"
                    @add="(step) => { polygon.distance += step; $emit('polygon-update')}"
                    @subtract="(step) => { polygon.distance -= step; $emit('polygon-update')}"
                />

                <input-range
                    v-model.number="polygon.rotation"
                    class="sliders__input"
                    :min="-1440"
                    :max="1440"
                    :step="1"
                    :label="$tc('home.offsetRotation', polygon.rotation)"
                    @input.native="$emit('polygon-update')"
                    @add="(step) => { polygon.rotation += step; $emit('polygon-update')}"
                    @subtract="(step) => { polygon.rotation -= step; $emit('polygon-update')}"
                />

                <input-radio
                    :id="'how-to-draw-shape'"
                    v-model="polygon.stroke"
                    class="radio__input"
                    :options="polygon.strokeOptions"
                    :label="$t('home.howToDrawShape')"
                    @change.native="$emit('polygon-update')"
                />

                <base-button
                    :text="$t('home.reset')"
                    @click.native="resetPolygons"
                />
            </div>
        </div>

        <div class="polygon-control__border-radius">
            <div
                class="border-radius__caption"
                @click="toggle"
                v-text="$t('home.borderRadius')"
            />
            <div class="border-radius__content hidden">
                <input-range
                    v-model.number="polygon.borderRadius"
                    class="sliders__input"
                    :min="0"
                    :max="1"
                    :step="0.01"
                    :label="$tc('home.borderRadiusN', format(f.percent)(polygon.borderRadius / 2))"
                    @input.native="$emit('polygon-update')"
                    @add="(step) => { polygon.borderRadius += step; $emit('polygon-update')}"
                    @subtract="(step) => { polygon.borderRadius -= step; $emit('polygon-update')}"
                />
                <base-button
                    :text="$t('home.reset')"
                    @click.native="resetBorderRadius"
                />
            </div>
        </div>

        <div
            class="polygon-control__stroke-width"
            :class="{
                'polygon-control__stroke-width--disabled': !polygon.stroke,
            }"
        >
            <div
                class="stroke-width__caption"
                @click="toggle"
                v-text="$t('home.strokeWidth')"
            />
            <div class="stroke-width__content hidden">
                <input-range
                    v-model.number="polygon.strokeWidth"
                    class="sliders__input"
                    :min="1"
                    :max="30"
                    :step="0.1"
                    :label="$tc('home.strokeWidthN', format(f.float)(polygon.strokeWidth))"
                    @input.native="$emit('polygon-update')"
                    @add="(step) => { polygon.strokeWidth += step; $emit('polygon-update')}"
                    @subtract="(step) => { polygon.strokeWidth -= step; $emit('polygon-update')}"
                />
                <input-checkbox
                    :id="'stroke-width'"
                    v-model="polygon.calcStrokeWidth"
                    class="checkbox__input"
                    :options="polygon.calcStrokeWidthOptions"
                    :label="$t('home.strokeWidth')"
                    @change.native="$emit('polygon-update')"
                />
                <base-button
                    :text="$t('home.reset')"
                    @click.native="resetStrokeWidth"
                />
            </div>
        </div>

        <div class="polygon-control__color">
            <div
                class="color__caption"
                @click="toggle"
                v-text="$t('home.color')"
            />
            <div class="color__content hidden">
                <input-checkbox
                    :id="'opacity'"
                    v-model="polygon.calcOpacity"
                    class="checkbox__input"
                    :options="polygon.calcOpacityOptions"
                    :label="$t('home.opacity')"
                    @change.native="$emit('polygon-update')"
                />

                <input-checkbox
                    :id="'flip-color-interpolator'"
                    v-model="polygon.flipColorInterpolator"
                    class="radio__input"
                    :options="polygon.flipColorInterpolatorOptions"
                    :label="$t('home.flipColorScheme')"
                    @change.native="$emit('polygon-update')"
                />

                <color-interpolator
                    :active="polygon.colorInterPolator"
                    @update-color-interpolator="setColorInterPolator"
                />

                <base-button
                    :text="$t('home.reset')"
                    @click.native="resetColor"
                />
            </div>
        </div>

        <div class="polygon-control__sides">
            <div
                class="size__caption"
                @click="toggle"
                v-text="$t('home.sides')"
            />
            <div class="size__content hidden">
                <input-range
                    v-model.number="polygon.sides"
                    class="sliders__input"
                    :min="3"
                    :max="16"
                    :step="1"
                    :label="$tc('home.sidesN', polygon.sides)"
                    @input.native="$emit('polygon-update')"
                    @add="(step) => { polygon.sides += step; $emit('polygon-update')}"
                    @subtract="(step) => { polygon.sides -= step; $emit('polygon-update')}"
                />
                <base-button
                    :text="$t('home.reset')"
                    @click.native="resetSides"
                />
            </div>
        </div>

        <div class="polygon-control__size">
            <div
                class="size__caption"
                @click="toggle"
                v-text="$t('home.size')"
            />
            <div class="size__content hidden">
                <input-range
                    v-model.number="polygon.size"
                    class="sliders__input"
                    :min="1"
                    :max="512"
                    :step="1"
                    :label="$tc('home.sizeN', polygon.size)"
                    @input.native="$emit('polygon-update')"
                    @add="(step) => { polygon.size += step; $emit('polygon-update')}"
                    @subtract="(step) => { polygon.size -= step; $emit('polygon-update')}"
                />

                <base-button
                    :text="$t('home.reset')"
                    @click.native="resetSize"
                />
            </div>
        </div>

        <div class="polygon-control__position">
            <div
                class="position__caption"
                @click="toggle"
                v-text="$t('home.position')"
            />

            <div class="position__content hidden">
                <input-range
                    v-model.number="polygon.cx"
                    class="sliders__input"
                    :min="-256"
                    :max="256"
                    :step="0.1"
                    :label="$tc('home.centerX', format(f.float)(polygon.cx))"
                    @input.native="$emit('polygon-update')"
                    @add="(step) => { polygon.cx += step; $emit('polygon-update')}"
                    @subtract="(step) => { polygon.cx -= step; $emit('polygon-update')}"
                />

                <input-range
                    v-model.number="polygon.cy"
                    class="sliders__input"
                    :min="-256"
                    :max="256"
                    :step="0.1"
                    :label="$tc('home.centerY', format(f.float)(polygon.cy))"
                    @input.native="$emit('polygon-update')"
                    @add="(step) => { polygon.cy += step; $emit('polygon-update')}"
                    @subtract="(step) => { polygon.cy -= step; $emit('polygon-update')}"
                />

                <base-button
                    :text="$t('home.reset')"
                    @click.native="resetPosition"
                />
            </div>
        </div>
        <div class="polygon-control__background-color">
            <div
                class="background-color__caption"
                @click="toggle"
                v-text="$t('home.backgroundColor')"
            />

            <div class="background-color__content hidden">
                <input
                    id="bg-color"
                    v-model="polygon.bgColor"
                    type="color"
                    name="bg-color"
                    @input="$emit('polygon-update')"
                >
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

import config from '@/config';

const {
    format: f,
    shapes,
} = config;

export default {
    name: 'PolygonControl',

    components: {
        BaseButton,
        ColorInterpolator,
        InputCheckbox,
        InputRadio,
        InputRange,
    },

    props: {
        polygon: {
            type: Object,
            required: true,
        },
    },

    created() {
        this.f = f;
    },

    methods: {
        setColorInterPolator(inter) {
            this.polygon.colorInterPolator = inter.name;

            this.$emit('polygon-update');
        },
        toggle(e) {
            const isHidden = select(e.target.nextSibling).classed('hidden');

            select(e.target.nextSibling).classed('hidden', !isHidden);
        },
        resetPolygons() {
            this.polygon.amount = shapes.polygon.amount;
            this.polygon.distance = shapes.polygon.distance;
            this.polygon.rotation = shapes.polygon.rotation;
            this.polygon.stroke = shapes.polygon.stroke;

            this.$emit('polygon-update');
        },
        resetBorderRadius() {
            this.polygon.borderRadius = shapes.polygon.borderRadius;

            this.$emit('polygon-update');
        },
        resetStrokeWidth() {
            this.polygon.strokeWidth = shapes.polygon.strokeWidth;
            this.polygon.calcStrokeWidth = shapes.polygon.calcStrokeWidth;

            this.$emit('polygon-update');
        },
        resetColor() {
            this.polygon.calcOpacity = shapes.polygon.calcOpacity;
            this.polygon.flipColorInterpolator = shapes.polygon.flipColorInterpolator;
            this.polygon.colorInterPolator = shapes.polygon.colorInterPolator;

            this.$emit('polygon-update');
        },
        resetSides() {
            this.polygon.sides = shapes.polygon.sides;

            this.$emit('polygon-update');
        },
        resetSize() {
            this.polygon.size = shapes.polygon.size;

            this.$emit('polygon-update');
        },
        resetPosition() {
            this.polygon.cx = shapes.polygon.cx;
            this.polygon.cy = shapes.polygon.cy;

            this.$emit('polygon-update');
        },
        format,
    },
};
</script>

<style lang="scss" scoped>
.polygon-control {
    display: flex;
    flex-direction: column;

    &__general,
    &__border-radius,
    &__stroke-width,
    &__color,
    &__sides,
    &__size,
    &__background-color,
    &__position {
        border: $border-width solid $tertiary;
        border-radius: $border-radius;
        display: flex;
        flex-direction: column;
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

    &__background-color {
        div[class$="__content"] {
            display: flex;
            flex-direction: column;
        }

        span {
            color: $white-75;
            font-size: $font-size * 0.75;
            padding-top: $padding-y / 2;
        }
    }
}
</style>
