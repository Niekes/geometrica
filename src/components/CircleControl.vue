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
            :label="$tc('home.radiusX', circle.radiusX)"
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
            :label="$tc('home.radiusY', circle.radiusY)"
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

        <div>
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
        </div>

        <div>
            <input
                id="stroke"
                v-model="circle.stroke"
                type="checkbox"
                name="stroke"
                @change="$emit('circle-update')"
            >
            <label for="stroke">stroke</label>
        </div>

        <div>
            <input
                id="interpolateOpacity"
                v-model="circle.interpolateOpacity"
                type="checkbox"
                name="interpolateOpacity"
                @change="$emit('circle-update')"
            >
            <label for="interpolateOpacity">interpolateOpacity</label>
            <input
                id="flipOpacity"
                v-model="circle.flipOpacity"
                type="checkbox"
                name="flipOpacity"
                @change="$emit('circle-update')"
            >
            <label for="flipOpacity">flipOpacity</label>
        </div>

        <div>
            <input
                id="interpolateStrokeWidth"
                v-model="circle.interpolateStrokeWidth"
                type="checkbox"
                name="interpolateStrokeWidth"
                @change="$emit('circle-update')"
            >l
            <label for="interpolateStrokeWidth">interpolateStrokeWidth</label>
            <input
                id="flipStrokeWidth"
                v-model="circle.flipStrokeWidth"
                type="checkbox"
                name="flipStrokeWidth"
                @change="$emit('circle-update')"
            >
            <label for="flipStrokeWidth">flipStrokeWidth</label>
        </div>

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

        <div class="control__color">
            <div>
                <input
                    id="circle-flip-color-interpolator"
                    v-model="circle.flipColorInterpolator"
                    type="checkbox"
                    name="circle-flip-color-interpolator"
                    @change="$emit('circle-update')"
                >
                <label for="circle-flip-color-interpolator">flipColorInterpolator</label>
            </div>

            <color-interpolator
                :active="circle.colorInterPolator"
                @update-color-interpolator="setColorInterPolator"
            />
        </div>
    </div>
</template>

<script>
import {
    format,
} from 'd3';

import InputRange from '@/components/InputRange';
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
}
</style>
