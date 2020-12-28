<template>
    <div class="rect-control">
        <input-range
            v-model.number="rect.amount"
            class="sliders__input"
            :min="2"
            :max="1000"
            :step="1"
            :label="$tc('home.amountOfRectangles', rect.amount)"
            @input.native="$emit('rect-update')"
            @add="(step) => { rect.amount += step; $emit('rect-update')}"
            @subtract="(step) => { rect.amount -= step; $emit('rect-update')}"
        />

        <input-range
            v-model.number="rect.distance"
            class="sliders__input"
            :min="-30"
            :max="30"
            :step="0.1"
            :label="$tc('home.distance', format(f.float)(rect.distance))"
            @input.native="$emit('rect-update')"
            @add="(step) => { rect.distance += step; $emit('rect-update')}"
            @subtract="(step) => { rect.distance -= step; $emit('rect-update')}"
        />

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

        <input-range
            v-model.number="rect.rotation"
            class="sliders__input"
            :min="-1440"
            :max="1440"
            :step="1"
            :label="$tc('home.rotation', rect.rotation)"
            @input.native="$emit('rect-update')"
            @add="(step) => { rect.rotation += step; $emit('rect-update')}"
            @subtract="(step) => { rect.rotation -= step; $emit('rect-update')}"
        />

        <div class="border-radius">
            <input-range
                v-model.number="rect.borderRadius.tl"
                class="sliders__input border-radius__tl"
                :min="0"
                :max="1"
                :step="0.01"
                :label="$tc(
                    'home.borderRadiusTopLeft',
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
                    'home.borderRadiusTopRight',
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
                    'home.borderRadiusBottomLeft',
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
                    'home.borderRadiusBottomRight',
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
        </div>

        <div class="size">
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
        </div>


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

        <input-radio
            :id="'how-to-draw-shape'"
            v-model="rect.stroke"
            class="radio__input"
            :options="rect.strokeOptions"
            :label="$t('home.howToDrawShape')"
            @change.native="$emit('rect-update')"
        />

        <input-checkbox
            :id="'opacity'"
            v-model="rect.calcOpacity"
            class="checkbox__input"
            :options="rect.calcOpacityOptions"
            :label="$t('home.opacity')"
            @change.native="$emit('rect-update')"
        />

        <input-checkbox
            :id="'stroke-width'"
            v-model="rect.calcStrokeWidth"
            class="checkbox__input"
            :options="rect.calcStrokeWidthOptions"
            :label="$t('home.strokeWidth')"
            @change.native="$emit('rect-update')"
        />

        <input-radio
            :id="'flip-color-interpolator'"
            v-model="rect.flipColorInterpolator"
            class="radio__input"
            :options="rect.flipColorInterpolatorOptions"
            :label="$t('home.flipColorScheme')"
            @change.native="$emit('rect-update')"
        />

        <!--         <div>
            <label>
                Bg
            </label>
            <input
                id="bg-color"
                v-model="rect.bgColor"
                type="color"
                name="bg-color"
                @input="$emit('rect-update')"
            >
        </div> -->

        <color-interpolator
            :active="rect.colorInterPolator"
            @update-color-interpolator="setColorInterPolator"
        />
    </div>
</template>

<script>
import {
    format,
} from 'd3';

import InputRange from '@/components/InputRange';
import InputRadio from '@/components/InputRadio';
import InputCheckbox from '@/components/InputCheckbox';
import ColorInterpolator from '@/components/ColorInterpolator';
import SvgIcon from '@/components/SvgIcon';

import config from '@/config';

const {
    colorInterPolators,
    format: f,
} = config;

export default {
    name: 'RectControl',

    components: {
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
        this.rect.colorInterPolator = this.rect.colorInterPolator || colorInterPolators[0];
    },

    methods: {
        setColorInterPolator(inter) {
            this.rect.colorInterPolator = inter;

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
        format,
    },
};
</script>

<style lang="scss" scoped>
.rect-control {
    display: flex;
    flex-direction: column;

    .border-radius {
        display: grid;
        gap: 0 $margin-x;
        grid-template-areas:
            "border-radius-tl border-radius-lock"
            "border-radius-tr border-radius-lock"
            "border-radius-bl border-radius-lock"
            "border-radius-br border-radius-lock";
        grid-template-columns: 1fr min-content;
        grid-template-rows: 1fr 1fr 1fr 1fr;
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

    .size {
        display: grid;
        gap: 0 $margin-x;
        grid-template-areas:
            "width size-lock"
            "height size-lock";
        grid-template-columns: 1fr min-content;
        grid-template-rows: 1fr 1fr;
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

    .border-radius__lock {
        grid-area: border-radius-lock;
    }

    .size__lock,
    .border-radius__lock {
        background: transparent;
        border-bottom: $border-width solid $black-50;
        border-left: 0;
        border-radius: 0 $border-radius $border-radius 0;
        border-right: $border-width solid $black-50;
        border-top: $border-width solid $black-50;
        cursor: pointer;
        margin: $margin-y * 2 0 $margin-y 0;
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
            background: $black-10;
        }
    }

    .radio__input,
    .checkbox__input {
        margin-top: $margin-y;
    }

    .radio__input,
    .checkbox__input,
    .sliders__input {
        margin-bottom: $margin-y;
    }
}
</style>
