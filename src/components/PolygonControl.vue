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
        />

        <input-range
            v-model.number="polygon.distance"
            class="sliders__input"
            :min="-30"
            :max="30"
            :step="0.1"
            :label="$tc('home.distance', polygon.distance)"
            @input.native="$emit('polygon-update')"
        />

        <input-range
            v-model.number="polygon.strokeWidth"
            class="sliders__input"
            :min="1"
            :max="30"
            :step="0.1"
            :label="$tc('home.strokeWidth', polygon.strokeWidth)"
            @input.native="$emit('polygon-update')"
        />

        <input-range
            v-model.number="polygon.rotation"
            class="sliders__input"
            :min="-1440"
            :max="1440"
            :step="1"
            :label="$tc('home.rotation', polygon.rotation)"
            @input.native="$emit('polygon-update')"
        />

        <input-range
            v-model.number="polygon.borderRadius"
            class="sliders__input"
            :min="0"
            :max="100"
            :step="1"
            :label="$tc('home.borderRadius', polygon.borderRadius / 2)"
            @input.native="$emit('polygon-update')"
        />


        <input-range
            v-model.number="polygon.sides"
            class="sliders__input"
            :min="3"
            :max="16"
            :step="1"
            :label="$tc('home.sides', polygon.sides)"
            @input.native="$emit('polygon-update')"
        />

        <input-range
            v-model.number="polygon.size"
            class="sliders__input"
            :min="1"
            :max="512"
            :step="1"
            :label="$tc('home.size', polygon.size)"
            @input.native="$emit('polygon-update')"
        />
        <div>
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
        </div>

        <div>
            <input
                id="stroke"
                v-model="polygon.stroke"
                type="checkbox"
                name="stroke"
                @change="$emit('polygon-update')"
            >
            <label for="stroke">stroke</label>
        </div>

        <div>
            <input
                id="interpolateOpacity"
                v-model="polygon.interpolateOpacity"
                type="checkbox"
                name="interpolateOpacity"
                @change="$emit('polygon-update')"
            >
            <label for="interpolateOpacity">interpolateOpacity</label>
            <input
                id="flipOpacity"
                v-model="polygon.flipOpacity"
                type="checkbox"
                name="flipOpacity"
                @change="$emit('polygon-update')"
            >
            <label for="flipOpacity">flipOpacity</label>
        </div>

        <div>
            <input
                id="interpolateStrokeWidth"
                v-model="polygon.interpolateStrokeWidth"
                type="checkbox"
                name="interpolateStrokeWidth"
                @change="$emit('polygon-update')"
            >
            <label for="interpolateStrokeWidth">interpolateStrokeWidth</label>
            <input
                id="flipStrokeWidth"
                v-model="polygon.flipStrokeWidth"
                type="checkbox"
                name="flipStrokeWidth"
                @change="$emit('polygon-update')"
            >
            <label for="flipStrokeWidth">flipStrokeWidth</label>
        </div>

        <input-range
            v-model.number="polygon.cx"
            class="sliders__input"
            :min="-256"
            :max="256"
            :step="0.1"
            :label="$tc('home.centerX', polygon.cx)"
            @input.native="$emit('polygon-update')"
        />

        <input-range
            v-model.number="polygon.cy"
            class="sliders__input"
            :min="-256"
            :max="256"
            :step="0.1"
            :label="$tc('home.centerY', polygon.cy)"
            @input.native="$emit('polygon-update')"
        />

        <div class="control__color">
            <div>
                <input
                    id="polygon-flip-color-interpolator"
                    v-model="polygon.flipColorInterpolator"
                    type="checkbox"
                    name="polygon-flip-color-interpolator"
                    @change="$emit('polygon-update')"
                >
                <label for="polygon-flip-color-interpolator">flipColorInterpolator</label>
            </div>

            <color-interpolator
                :active="polygon.colorInterPolator"
                @update-color-interpolator="setColorInterPolator"
            />
        </div>
    </div>
</template>

<script>
import InputRange from '@/components/InputRange';
import ColorInterpolator from '@/components/ColorInterpolator';

import config from '@/config';

const {
    colorInterPolators,
} = config;

export default {
    name: 'PolygonControl',

    components: {
        ColorInterpolator,
        InputRange,
    },

    props: {
        polygon: {
            type: Object,
            required: true,
        },
    },

    created() {
        this.polygon.colorInterPolator = this.polygon.colorInterPolator || colorInterPolators[0];
    },

    methods: {
        setColorInterPolator(inter) {
            this.polygon.colorInterPolator = inter;

            this.$emit('polygon-update');
        },
    },
};
</script>

<style lang="scss" scoped>
.polygon-control {
    display: flex;
    flex-direction: column;
}
</style>
