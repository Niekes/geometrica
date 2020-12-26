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

        <input-range
            v-model.number="rect.borderRadius.tl"
            class="sliders__input"
            :min="0"
            :max="1"
            :step="0.01"
            :label="$tc('home.borderRadius', format(f.percent)(rect.borderRadius.tl / 2))"
            @input.native="$emit('rect-update')"
            @add="(step) => { rect.borderRadius.tl += step; $emit('rect-update')}"
            @subtract="(step) => { rect.borderRadius.tl -= step; $emit('rect-update')}"
        />

        <input-range
            v-model.number="rect.borderRadius.tr"
            class="sliders__input"
            :min="0"
            :max="1"
            :step="0.01"
            :label="$tc('home.borderRadius', format(f.percent)(rect.borderRadius.tr / 2))"
            @input.native="$emit('rect-update')"
            @add="(step) => { rect.borderRadius.tr += step; $emit('rect-update')}"
            @subtract="(step) => { rect.borderRadius.tr -= step; $emit('rect-update')}"
        />

        <input-range
            v-model.number="rect.borderRadius.bl"
            class="sliders__input"
            :min="0"
            :max="1"
            :step="0.01"
            :label="$tc('home.borderRadius', format(f.percent)(rect.borderRadius.bl / 2))"
            @input.native="$emit('rect-update')"
            @add="(step) => { rect.borderRadius.bl += step; $emit('rect-update')}"
            @subtract="(step) => { rect.borderRadius.bl -= step; $emit('rect-update')}"
        />

        <input-range
            v-model.number="rect.borderRadius.br"
            class="sliders__input"
            :min="0"
            :max="1"
            :step="0.01"
            :label="$tc('home.borderRadius', format(f.percent)(rect.borderRadius.br / 2))"
            @input.native="$emit('rect-update')"
            @add="(step) => { rect.borderRadius.br += step; $emit('rect-update')}"
            @subtract="(step) => { rect.borderRadius.br -= step; $emit('rect-update')}"
        />

        <input-range
            v-model.number="rect.width"
            class="sliders__input"
            :min="1"
            :max="512"
            :step="1"
            :label="$tc('home.width', rect.width)"
            @input.native="$emit('rect-update')"
            @add="(step) => { rect.width += step; $emit('rect-update')}"
            @subtract="(step) => { rect.width -= step; $emit('rect-update')}"
        />

        <input-range
            v-model.number="rect.height"
            class="sliders__input"
            :min="1"
            :max="512"
            :step="1"
            :label="$tc('home.height', rect.height)"
            @input.native="$emit('rect-update')"
            @add="(step) => { rect.height += step; $emit('rect-update')}"
            @subtract="(step) => { rect.height -= step; $emit('rect-update')}"
        />

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
        format,
    },
};
</script>

<style lang="scss" scoped>
.rect-control {
    display: flex;
    flex-direction: column;

    .radio__input,
    .checkbox__input,
    .sliders__input {
        margin-bottom: $margin-y;
    }
}
</style>
