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
        />

        <input-range
            v-model.number="rect.distance"
            class="sliders__input"
            :min="-30"
            :max="30"
            :step="0.1"
            :label="$tc('home.distance', rect.distance)"
            @input.native="$emit('rect-update')"
        />

        <input-range
            v-model.number="rect.strokeWidth"
            class="sliders__input"
            :min="1"
            :max="30"
            :step="0.1"
            :label="$tc('home.strokeWidth', rect.strokeWidth)"
            @input.native="$emit('rect-update')"
        />

        <input-range
            v-model.number="rect.rotation"
            class="sliders__input"
            :min="-1440"
            :max="1440"
            :step="1"
            :label="$tc('home.rotation', rect.rotation)"
            @input.native="$emit('rect-update')"
        />

        <input-range
            v-model.number="rect.borderRadius.tl"
            class="sliders__input"
            :min="0"
            :max="100"
            :step="0.01"
            :label="$tc('home.borderRadius', rect.borderRadius.tl / 2)"
            @input.native="$emit('rect-update')"
        />

        <input-range
            v-model.number="rect.borderRadius.tr"
            class="sliders__input"
            :min="0"
            :max="100"
            :step="0.01"
            :label="$tc('home.borderRadius', rect.borderRadius.tr / 2)"
            @input.native="$emit('rect-update')"
        />

        <input-range
            v-model.number="rect.borderRadius.bl"
            class="sliders__input"
            :min="0"
            :max="100"
            :step="0.01"
            :label="$tc('home.borderRadius', rect.borderRadius.bl / 2)"
            @input.native="$emit('rect-update')"
        />

        <input-range
            v-model.number="rect.borderRadius.br"
            class="sliders__input"
            :min="0"
            :max="100"
            :step="0.01"
            :label="$tc('home.borderRadius', rect.borderRadius.br / 2)"
            @input.native="$emit('rect-update')"
        />

        <input-range
            v-model.number="rect.width"
            class="sliders__input"
            :min="1"
            :max="512"
            :step="1"
            :label="$tc('home.width', rect.width)"
            @input.native="$emit('rect-update')"
        />

        <input-range
            v-model.number="rect.height"
            class="sliders__input"
            :min="1"
            :max="512"
            :step="1"
            :label="$tc('home.height', rect.height)"
            @input.native="$emit('rect-update')"
        />
        <div>
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
        </div>

        <div>
            <input
                id="stroke"
                v-model="rect.stroke"
                type="checkbox"
                name="stroke"
                @change="$emit('rect-update')"
            >
            <label for="stroke">stroke</label>
        </div>

        <div>
            <input
                id="interpolateOpacity"
                v-model="rect.interpolateOpacity"
                type="checkbox"
                name="interpolateOpacity"
                @change="$emit('rect-update')"
            >
            <label for="interpolateOpacity">interpolateOpacity</label>
            <input
                id="flipOpacity"
                v-model="rect.flipOpacity"
                type="checkbox"
                name="flipOpacity"
                @change="$emit('rect-update')"
            >
            <label for="flipOpacity">flipOpacity</label>
        </div>

        <div>
            <input
                id="interpolateStrokeWidth"
                v-model="rect.interpolateStrokeWidth"
                type="checkbox"
                name="interpolateStrokeWidth"
                @change="$emit('rect-update')"
            >
            <label for="interpolateStrokeWidth">interpolateStrokeWidth</label>
            <input
                id="flipStrokeWidth"
                v-model="rect.flipStrokeWidth"
                type="checkbox"
                name="flipStrokeWidth"
                @change="$emit('rect-update')"
            >
            <label for="flipStrokeWidth">flipStrokeWidth</label>
        </div>

        <input-range
            v-model.number="rect.cx"
            class="sliders__input"
            :min="-256"
            :max="256"
            :step="0.1"
            :label="$tc('home.centerX', rect.cx)"
            @input.native="$emit('rect-update')"
        />

        <input-range
            v-model.number="rect.cy"
            class="sliders__input"
            :min="-256"
            :max="256"
            :step="0.1"
            :label="$tc('home.centerY', rect.cy)"
            @input.native="$emit('rect-update')"
        />

        <div class="control__color">
            <div>
                <input
                    id="rect-flip-color-interpolator"
                    v-model="rect.flipColorInterpolator"
                    type="checkbox"
                    name="rect-flip-color-interpolator"
                    @change="$emit('rect-update')"
                >
                <label for="rect-flip-color-interpolator">flipColorInterpolator</label>
            </div>

            <color-interpolator
                :active="rect.colorInterPolator"
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
    name: 'RectControl',

    components: {
        ColorInterpolator,
        InputRange,
    },

    props: {
        rect: {
            type: Object,
            required: true,
        },
    },

    created() {
        this.rect.colorInterPolator = this.rect.colorInterPolator || colorInterPolators[0];
    },

    methods: {
        setColorInterPolator(inter) {
            this.rect.colorInterPolator = inter;

            this.$emit('rect-update');
        },
    },
};
</script>

<style lang="scss" scoped>
.rect-control {
    display: flex;
    flex-direction: column;
}
</style>
