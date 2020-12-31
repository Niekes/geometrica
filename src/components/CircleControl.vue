<template>
    <div class="circle-control">
        <div class="circle-control__general">
            <div
                class="general__caption"
                @click="toggle"
                v-text="$t('home.circles')"
            />

            <div class="general__content hidden">
                <input-range
                    v-model.number="circle.amount"
                    class="sliders__input"
                    :min="2"
                    :max="1000"
                    :step="1"
                    :label="$tc('home.amountN', circle.amount)"
                    @input.native="$emit('circle-update')"
                    @add="(step) => { circle.amount += step; $emit('circle-update')}"
                    @subtract="(step) => { circle.amount -= step; $emit('circle-update')}"
                />

                <input-range
                    v-model.number="circle.distance"
                    class="sliders__input"
                    :min="-64"
                    :max="64"
                    :step="0.1"
                    :label="$tc('home.distance', format(f.float)(circle.distance))"
                    @input.native="$emit('circle-update')"
                    @add="(step) => { circle.distance += step; $emit('circle-update')}"
                    @subtract="(step) => { circle.distance -= step; $emit('circle-update')}"
                />

                <input-range
                    v-model.number="circle.rotation"
                    class="sliders__input"
                    :min="-1440"
                    :max="1440"
                    :step="1"
                    :label="$tc('home.offsetRotation', circle.rotation)"
                    @input.native="$emit('circle-update')"
                    @add="(step) => { circle.rotation += step; $emit('circle-update')}"
                    @subtract="(step) => { circle.rotation -= step; $emit('circle-update')}"
                />

                <input-radio
                    :id="'how-to-draw-shape'"
                    v-model="circle.stroke"
                    class="radio__input"
                    :options="circle.strokeOptions"
                    :label="$t('home.howToDrawShape')"
                    @change.native="$emit('circle-update')"
                />

                <base-button
                    :text="$t('home.reset')"
                    @click.native="resetCircles"
                />
            </div>
        </div>

        <div class="circle-control__stroke-width">
            <div
                class="stroke-width__caption"
                @click="toggle"
                v-text="$t('home.strokeWidth')"
            />
            <div class="stroke-width__content hidden">
                <input-range
                    v-model.number="circle.strokeWidth"
                    class="sliders__input"
                    :min="1"
                    :max="30"
                    :step="0.1"
                    :label="$tc('home.strokeWidthN', format(f.float)(circle.strokeWidth))"
                    @input.native="$emit('circle-update')"
                    @add="(step) => { circle.strokeWidth += step; $emit('circle-update')}"
                    @subtract="(step) => { circle.strokeWidth -= step; $emit('circle-update')}"
                />

                <input-checkbox
                    :id="'stroke-width'"
                    v-model="circle.calcStrokeWidth"
                    class="checkbox__input"
                    :options="circle.calcStrokeWidthOptions"
                    :label="$t('home.strokeWidth')"
                    @change.native="$emit('circle-update')"
                />

                <base-button
                    :text="$t('home.reset')"
                    @click.native="resetStrokeWidth"
                />
            </div>
        </div>

        <div class="circle-control__color">
            <div
                class="color__caption"
                @click="toggle"
                v-text="$t('home.color')"
            />
            <div class="color__content hidden">
                <input-checkbox
                    :id="'opacity'"
                    v-model="circle.calcOpacity"
                    class="checkbox__input"
                    :options="circle.calcOpacityOptions"
                    :label="$t('home.opacity')"
                    @change.native="$emit('circle-update')"
                />

                <input-checkbox
                    :id="'flip-color-interpolator'"
                    v-model="circle.flipColorInterpolator"
                    class="radio__input"
                    :options="circle.flipColorInterpolatorOptions"
                    :label="$t('home.flipColorScheme')"
                    @change.native="$emit('circle-update')"
                />

                <!--         <div>
                    <label>
                        Bg
                    </label>
                    <input
                        id="bg-color"
                        v-model="circle.bgColor"
                        type="color"
                        name="bg-color"
                        @input="$emit('circle-update')"
                    >
                </div> -->

                <color-interpolator
                    :active="circle.colorInterPolator"
                    @update-color-interpolator="setColorInterPolator"
                />

                <base-button
                    :text="$t('home.reset')"
                    @click.native="resetColor"
                />
            </div>
        </div>

        <div class="circle-control__radius">
            <div
                class="radius__caption"
                @click="toggle"
                v-text="$t('home.radius')"
            />

            <div class="radius__content hidden">
                <input-range
                    v-model.number="circle.radiusX"
                    class="sliders__input x"
                    :min="1"
                    :max="512"
                    :step="1"
                    :label="$tc('home.radiusX', circle.radiusX / 2)"
                    @input.native="handleRadiusX"
                    @add="(step) => { circle.radiusX += step; handleRadiusX()}"
                    @subtract="(step) => { circle.radiusX -= step; handleRadiusX()}"
                />

                <input-range
                    v-model.number="circle.radiusY"
                    class="sliders__input y"
                    :min="1"
                    :max="512"
                    :step="1"
                    :label="$tc('home.radiusY', circle.radiusY / 2)"
                    @input.native="handleRadiusY"
                    @add="(step) => { circle.radiusY += step; handleRadiusY()}"
                    @subtract="(step) => { circle.radiusY -= step; handleRadiusY()}"
                />

                <button
                    class="radius__lock"
                    @click="circle.radiusIsLocked = !circle.radiusIsLocked"
                >
                    <svg-icon
                        :xlink="circle.radiusIsLocked ? '#lock-closed' : '#lock-open'"
                    />
                </button>

                <base-button
                    class="radius__reset"
                    :text="$t('home.reset')"
                    @click.native="resetRadius"
                />
            </div>
        </div>

        <div class="circle-control__position">
            <div
                class="position__caption"
                @click="toggle"
                v-text="$t('home.position')"
            />

            <div class="position__content hidden">
                <input-range
                    v-model.number="circle.cx"
                    class="sliders__input"
                    :min="-256"
                    :max="256"
                    :step="0.1"
                    :label="$tc('home.centerX', format(f.float)(circle.cx))"
                    @input.native="$emit('circle-update')"
                    @add="(step) => { circle.cx += step; $emit('circle-update')}"
                    @subtract="(step) => { circle.cx -= step; $emit('circle-update')}"
                />

                <input-range
                    v-model.number="circle.cy"
                    class="sliders__input"
                    :min="-256"
                    :max="256"
                    :step="0.1"
                    :label="$tc('home.centerY', format(f.float)(circle.cy))"
                    @input.native="$emit('circle-update')"
                    @add="(step) => { circle.cy += step; $emit('circle-update')}"
                    @subtract="(step) => { circle.cy -= step; $emit('circle-update')}"
                />

                <base-button
                    :text="$t('home.reset')"
                    @click.native="resetPosition"
                />
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
    name: 'CircleControl',

    components: {
        BaseButton,
        ColorInterpolator,
        InputCheckbox,
        InputRadio,
        InputRange,
        SvgIcon,
    },

    props: {
        circle: {
            type: Object,
            required: true,
        },
    },

    created() {
        this.f = f;
    },

    methods: {
        setColorInterPolator(inter) {
            this.circle.colorInterPolator = inter.name;

            this.$emit('circle-update');
        },
        handleRadiusX() {
            if (this.circle.radiusIsLocked) {
                this.circle.radiusY = this.circle.radiusX;
            }

            this.$emit('circle-update');
        },
        handleRadiusY() {
            if (this.circle.radiusIsLocked) {
                this.circle.radiusX = this.circle.radiusY;
            }

            this.$emit('circle-update');
        },
        toggle(e) {
            const isHidden = select(e.target.nextSibling).classed('hidden');

            select(e.target.nextSibling).classed('hidden', !isHidden);
        },
        resetCircles() {
            this.circle.amount = shapes.circle.amount;
            this.circle.distance = shapes.circle.distance;
            this.circle.rotation = shapes.circle.rotation;
            this.circle.stroke = shapes.circle.stroke;

            this.$emit('circle-update');
        },
        resetStrokeWidth() {
            this.circle.strokeWidth = shapes.circle.strokeWidth;
            this.circle.calcStrokeWidth = shapes.circle.calcStrokeWidth;

            this.$emit('circle-update');
        },
        resetColor() {
            this.circle.calcOpacity = shapes.circle.calcOpacity;
            this.circle.flipColorInterpolator = shapes.circle.flipColorInterpolator;
            this.circle.colorInterPolator = shapes.circle.colorInterPolator;

            this.$emit('circle-update');
        },
        resetRadius() {
            this.circle.radiusX = shapes.circle.radiusX;
            this.circle.radiusY = shapes.circle.radiusY;
            this.circle.radiusIsLocked = shapes.circle.radiusIsLocked;

            this.$emit('circle-update');
        },
        resetPosition() {
            this.circle.cx = shapes.circle.cx;
            this.circle.cy = shapes.circle.cy;

            this.$emit('circle-update');
        },
        format,
    },
};
</script>

<style lang="scss" scoped>
.circle-control {
    display: flex;
    flex-direction: column;

    &__general,
    &__radius,
    &__stroke-width,
    &__color,
    &__angle,
    &__position {
        border: $border-width solid $tertiary;
        border-radius: $border-radius;
        display: flex;
        flex-direction: column;
        margin-bottom: $margin-y;
        overflow: hidden;

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

    .radius__content {
        display: grid;
        gap: 0 $margin-x;
        grid-template-areas:
            "radius-x radius-lock"
            "radius-y radius-lock"
            "radius-reset radius-reset";
        grid-template-columns: 1fr min-content;
        grid-template-rows: 1fr 1fr min-content;
    }

    .x {
        grid-area: radius-x;
    }

    .y {
        grid-area: radius-y;
    }

    .radius__lock {
        background: transparent;
        border-bottom: $border-width solid $white-70;
        border-left: 0;
        border-radius: 0 $border-radius $border-radius 0;
        border-right: $border-width solid $white-70;
        border-top: $border-width solid $white-70;
        color: $white;
        cursor: pointer;
        grid-area: radius-lock;
        margin: $margin-y * 3.4 0 $margin-y 0;
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

    .radius__reset {
        grid-area: radius-reset;
    }
}
</style>
