<template>
    <div class="polygon-control">
        <input-range
            v-model.number="polygon.amount"
            class="sliders__input"
            :min="2"
            :max="1000"
            :step="1"
            :label="$tc('home.amountOfPolygons', polygon.amount)"
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


        <input-range
            v-model.number="polygon.sides"
            class="sliders__input"
            :min="3"
            :max="16"
            :step="1"
            :label="$tc('home.sides', polygon.sides)"
            @input.native="$emit('polygon-update')"
            @add="(step) => { polygon.sides += step; $emit('polygon-update')}"
            @subtract="(step) => { polygon.sides -= step; $emit('polygon-update')}"
        />

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

        <input-radio
            :id="'how-to-draw-shape'"
            v-model="polygon.stroke"
            class="radio__input"
            :options="polygon.strokeOptions"
            :label="$t('home.howToDrawShape')"
            @change.native="$emit('polygon-update')"
        />

        <input-checkbox
            :id="'opacity'"
            v-model="polygon.calcOpacity"
            class="checkbox__input"
            :options="polygon.calcOpacityOptions"
            :label="$t('home.opacity')"
            @change.native="$emit('polygon-update')"
        />

        <input-checkbox
            :id="'stroke-width'"
            v-model="polygon.calcStrokeWidth"
            class="checkbox__input"
            :options="polygon.calcStrokeWidthOptions"
            :label="$t('home.strokeWidth')"
            @change.native="$emit('polygon-update')"
        />

        <input-radio
            :id="'flip-color-interpolator'"
            v-model="polygon.flipColorInterpolator"
            class="radio__input"
            :options="polygon.flipColorInterpolatorOptions"
            :label="$t('home.flipColorScheme')"
            @change.native="$emit('polygon-update')"
        />

        <!--         <div>
            <label>
                Bg
            </label>
            <input
                id="bg-color"
                v-model="polygon.bgColor"
                type="color"
                name="bg-color"
                @input="$emit('polygon-update')"
            >
        </div> -->

        <color-interpolator
            :active="polygon.colorInterPolator"
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

import config from '@/config';

const {
    colorInterPolators,
    format: f,
} = config;

export default {
    name: 'PolygonControl',

    components: {
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
        this.polygon.colorInterPolator = this.polygon.colorInterPolator || colorInterPolators[0];
    },

    methods: {
        setColorInterPolator(inter) {
            this.polygon.colorInterPolator = inter;

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
