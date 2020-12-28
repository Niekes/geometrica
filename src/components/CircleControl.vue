<template>
    <div class="circle-control">
        <input-range
            v-model.number="circle.amount"
            class="sliders__input"
            :min="2"
            :max="1000"
            :step="1"
            :label="$tc('home.amountOfCircles', circle.amount)"
            @input.native="$emit('circle-update')"
            @add="(step) => { circle.amount += step; $emit('circle-update')}"
            @subtract="(step) => { circle.amount -= step; $emit('circle-update')}"
        />

        <input-range
            v-model.number="circle.distance"
            class="sliders__input"
            :min="-30"
            :max="30"
            :step="0.1"
            :label="$tc('home.distance', format(f.float)(circle.distance))"
            @input.native="$emit('circle-update')"
            @add="(step) => { circle.distance += step; $emit('circle-update')}"
            @subtract="(step) => { circle.distance -= step; $emit('circle-update')}"
        />

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

        <input-range
            v-model.number="circle.rotation"
            class="sliders__input"
            :min="-1440"
            :max="1440"
            :step="1"
            :label="$tc('home.rotation', circle.rotation)"
            @input.native="$emit('circle-update')"
            @add="(step) => { circle.rotation += step; $emit('circle-update')}"
            @subtract="(step) => { circle.rotation -= step; $emit('circle-update')}"
        />

        <div class="radius">
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
        </div>


        <input-range
            v-model.number="circle.startAngle"
            class="sliders__input"
            :min="0"
            :max="360"
            :step="1"
            :label="$tc('home.startAngle', circle.startAngle)"
            @input.native="$emit('circle-update')"
            @add="(step) => { circle.startAngle += step; $emit('circle-update')}"
            @subtract="(step) => { circle.startAngle -= step; $emit('circle-update')}"
        />

        <input-range
            v-model.number="circle.endAngle"
            class="sliders__input"
            :min="0"
            :max="360"
            :step="1"
            :label="$tc('home.endAngle', circle.endAngle)"
            @input.native="$emit('circle-update')"
            @add="(step) => { circle.endAngle += step; $emit('circle-update')}"
            @subtract="(step) => { circle.endAngle -= step; $emit('circle-update')}"
        />

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

        <input-radio
            :id="'how-to-draw-shape'"
            v-model="circle.stroke"
            class="radio__input"
            :options="circle.strokeOptions"
            :label="$t('home.howToDrawShape')"
            @change.native="$emit('circle-update')"
        />

        <input-checkbox
            :id="'opacity'"
            v-model="circle.calcOpacity"
            class="checkbox__input"
            :options="circle.calcOpacityOptions"
            :label="$t('home.opacity')"
            @change.native="$emit('circle-update')"
        />

        <input-checkbox
            :id="'stroke-width'"
            v-model="circle.calcStrokeWidth"
            class="checkbox__input"
            :options="circle.calcStrokeWidthOptions"
            :label="$t('home.strokeWidth')"
            @change.native="$emit('circle-update')"
        />

        <input-radio
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
    name: 'CircleControl',

    components: {
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
        this.circle.colorInterPolator = this.circle.colorInterPolator || colorInterPolators[0];
    },

    methods: {
        setColorInterPolator(inter) {
            this.circle.colorInterPolator = inter;

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
        format,
    },
};
</script>

<style lang="scss" scoped>
.circle-control {
    display: flex;
    flex-direction: column;

    .radius {
        display: grid;
        gap: 0 $margin-x;
        grid-template-areas:
            "radius-x radius-lock"
            "radius-y radius-lock";
        grid-template-columns: 1fr min-content;
        grid-template-rows: 1fr 1fr;
    }

    .x {
        grid-area: radius-x;
    }

    .y {
        grid-area: radius-y;
    }

    .radius__lock {
        background: transparent;
        border-bottom: $border-width solid $black-50;
        border-left: 0;
        border-radius: 0 $border-radius $border-radius 0;
        border-right: $border-width solid $black-50;
        border-top: $border-width solid $black-50;
        cursor: pointer;
        grid-area: radius-lock;
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
