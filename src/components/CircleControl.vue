<template>
    <div class="circle-control">
        <input-range
            v-model.number="circle.amount"
            class="sliders__input"
            :min="2"
            :max="1000"
            :step="1"
            :label="$tc('home.amountOfCircles', circle.amount)"
            @input.native="$emit('circle-update', $event.target.value)"
        />

        <input-range
            v-model.number="circle.distance"
            class="sliders__input"
            :min="-30"
            :max="30"
            :step="0.1"
            :label="$tc('home.distance', circle.distance)"
            @input.native="$emit('circle-update', $event.target.value)"
        />

        <input-range
            v-model.number="circle.strokeWidth"
            class="sliders__input"
            :min="1"
            :max="30"
            :step="0.1"
            :label="$tc('home.strokeWidth', circle.strokeWidth)"
            @input.native="$emit('circle-update', $event.target.value)"
        />

        <input-range
            v-model.number="circle.rotation"
            class="sliders__input"
            :min="-1440"
            :max="1440"
            :step="1"
            :label="$tc('home.rotation', circle.rotation)"
            @input.native="$emit('circle-update', $event.target.value)"
        />

        <input-range
            v-model.number="circle.radiusX"
            class="sliders__input"
            :min="1"
            :max="512"
            :step="1"
            :label="$tc('home.radiusX', circle.radiusX)"
            @input.native="$emit('circle-update', $event.target.value)"
        />

        <input-range
            v-model.number="circle.radiusY"
            class="sliders__input"
            :min="1"
            :max="512"
            :step="1"
            :label="$tc('home.radiusY', circle.radiusY)"
            @input.native="$emit('circle-update', $event.target.value)"
        />

        <input-range
            v-model.number="circle.startAngle"
            class="sliders__input"
            :min="0"
            :max="6.283185307179586"
            :step="0.01"
            :label="$tc('home.startAngle', circle.startAngle)"
            @input.native="$emit('circle-update', $event.target.value)"
        />

        <input-range
            v-model.number="circle.endAngle"
            class="sliders__input"
            :min="0"
            :max="6.283185307179586"
            :step="0.01"
            :label="$tc('home.endAngle', circle.endAngle)"
            @input.native="$emit('circle-update', $event.target.value)"
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
                @input="$emit('circle-update', $event.target.value)"
            >
        </div>

        <div>
            <input
                id="stroke"
                v-model="circle.stroke"
                type="checkbox"
                name="stroke"
                @change="$emit('circle-update', $event.target.value)"
            >
            <label for="stroke">stroke</label>
        </div>

        <div>
            <input
                id="interpolateOpacity"
                v-model="circle.interpolateOpacity"
                type="checkbox"
                name="interpolateOpacity"
                @change="$emit('circle-update', $event.target.value)"
            >
            <label for="interpolateOpacity">interpolateOpacity</label>
            <input
                id="flipOpacity"
                v-model="circle.flipOpacity"
                type="checkbox"
                name="flipOpacity"
                @change="$emit('circle-update', $event.target.value)"
            >
            <label for="flipOpacity">flipOpacity</label>
        </div>

        <div>
            <input
                id="interpolateStrokeWidth"
                v-model="circle.interpolateStrokeWidth"
                type="checkbox"
                name="interpolateStrokeWidth"
                @change="$emit('circle-update', $event.target.value)"
            >l
            <label for="interpolateStrokeWidth">interpolateStrokeWidth</label>
            <input
                id="flipStrokeWidth"
                v-model="circle.flipStrokeWidth"
                type="checkbox"
                name="flipStrokeWidth"
                @change="$emit('circle-update', $event.target.value)"
            >
            <label for="flipStrokeWidth">flipStrokeWidth</label>
        </div>

        <input-range
            v-model.number="circle.cx"
            class="sliders__input"
            :min="-256"
            :max="256"
            :step="0.1"
            :label="$tc('home.centerX', circle.cx)"
            @input.native="$emit('circle-update', $event.target.value)"
        />

        <input-range
            v-model.number="circle.cy"
            class="sliders__input"
            :min="-256"
            :max="256"
            :step="0.1"
            :label="$tc('home.centerY', circle.cy)"
            @input.native="$emit('circle-update', $event.target.value)"
        />

        <div class="control__color">
            <div>
                <input
                    id="circle-flip-color-interpolator"
                    v-model="circle.flipColorInterpolator"
                    type="checkbox"
                    name="circle-flip-color-interpolator"
                    @change="$emit('circle-update', $event.target.value)"
                >
                <label for="circle-flip-color-interpolator">flipColorInterpolator</label>
            </div>

            <div
                v-if="colorInterPolators"
                class="color-interpolators"
            >
                <div
                    v-for="cip in colorInterPolators"
                    :key="cip.name"
                    class="color-interpolators__values"
                >
                    <button
                        class="interpolator"
                        :class="{
                            'interpolator--active': cip.fn === circle.colorInterPolator,
                        }"
                        @click="setColorInterPolator(cip.fn)"
                        v-text="cip.name"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import InputRange from '@/components/InputRange';

import config from '@/config';

export default {
    name: 'CircleControl',

    components: {
        InputRange,
    },

    props: {
        circle: {
            type: Object,
            required: true,
        },
    },

    created() {
        this.colorInterPolators = config.colorInterPolators;
        this.circle.colorInterPolator = this.circle.colorInterPolator
            || this.colorInterPolators[0].fn;
    },

    methods: {
        setColorInterPolator(inter) {
            this.circle.colorInterPolator = inter;

            this.$emit('circle-update', inter);
        },
    },
};
</script>

<style lang="scss" scoped>
.circle-control {
    display: flex;
    flex-direction: column;
}

.color-interpolators {
    display: flex;
    flex-wrap: wrap;
}

.interpolator {
    font-size: $font-size;

    &--active {
        font-weight: 900;
    }
}
</style>
