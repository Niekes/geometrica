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
            :label="$tc('home.strokeWidth', format(f.float)(circle.strokeWidth))"
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

        <input-range
            v-model.number="circle.radiusX"
            class="sliders__input"
            :min="1"
            :max="512"
            :step="1"
            :label="$tc('home.radiusX', circle.radiusX / 2)"
            @input.native="$emit('circle-update')"
            @add="(step) => { circle.radiusX += step; $emit('circle-update')}"
            @subtract="(step) => { circle.radiusX -= step; $emit('circle-update')}"
        />

        <input-range
            v-model.number="circle.radiusY"
            class="sliders__input"
            :min="1"
            :max="512"
            :step="1"
            :label="$tc('home.radiusY', circle.radiusY / 2)"
            @input.native="$emit('circle-update')"
            @add="(step) => { circle.radiusY += step; $emit('circle-update')}"
            @subtract="(step) => { circle.radiusY -= step; $emit('circle-update')}"
        />

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
        format,
    },
};
</script>

<style lang="scss" scoped>
.circle-control {
    display: flex;
    flex-direction: column;

    .radio__input,
    .checkbox__input,
    .sliders__input {
        margin-bottom: $margin-y;
    }
}
</style>
