<template>
    <div class="circle-control">
        <input-range
            v-model.number="circle.amount"
            class="sliders__input"
            :min="2"
            :max="1000"
            :step="1"
            :label="$tc('home.amountOfCircles', circle.amount)"
            @change.native="$emit('change', $event.target.value)"
            @input.native="$emit('input', $event.target.value)"
        />

        <input-range
            v-model.number="circle.distance"
            class="sliders__input"
            :min="-30"
            :max="30"
            :step="0.1"
            :label="$tc('home.distance', circle.distance)"
            @change.native="$emit('change', $event.target.value)"
            @input.native="$emit('input', $event.target.value)"
        />

        <input-range
            v-model.number="circle.lineWidth"
            class="sliders__input"
            :min="1"
            :max="30"
            :step="0.1"
            :label="$tc('home.lineWidth', circle.lineWidth)"
            @change.native="$emit('change', $event.target.value)"
            @input.native="$emit('input', $event.target.value)"
        />

        <input-range
            v-model.number="circle.rotation"
            class="sliders__input"
            :min="-1440"
            :max="1440"
            :step="1"
            :label="$tc('home.rotation', circle.rotation)"
            @change.native="$emit('change', $event.target.value)"
            @input.native="$emit('input', $event.target.value)"
        />

        <input-range
            v-model.number="circle.radiusX"
            class="sliders__input"
            :min="1"
            :max="512"
            :step="1"
            :label="$tc('home.radiusX', circle.radiusX)"
            @change.native="$emit('change', $event.target.value)"
            @input.native="$emit('input', $event.target.value)"
        />

        <input-range
            v-model.number="circle.radiusY"
            class="sliders__input"
            :min="1"
            :max="512"
            :step="1"
            :label="$tc('home.radiusY', circle.radiusY)"
            @change.native="$emit('change', $event.target.value)"
            @input.native="$emit('input', $event.target.value)"
        />
    </div>
</template>

<script>
import InputRange from '@/components/InputRange';

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
};
</script>

<style lang="scss" scoped>
.circle-control {
    display: flex;
    flex-direction: column;
}
</style>
