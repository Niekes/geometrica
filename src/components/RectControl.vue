<template>
    <div class="rect-control">
        <input-range
            v-model.number="rect.amount"
            class="sliders__input"
            :min="2"
            :max="1000"
            :step="1"
            :label="$tc('home.amountOfRectangles', rect.amount)"
            @change.native="$emit('change', $event.target.value)"
            @input.native="$emit('input', $event.target.value)"
        />

        <input-range
            v-model.number="rect.distance"
            class="sliders__input"
            :min="-30"
            :max="30"
            :step="0.1"
            :label="$tc('home.distance', rect.distance)"
            @change.native="$emit('change', $event.target.value)"
            @input.native="$emit('input', $event.target.value)"
        />

        <input-range
            v-model.number="rect.lineWidth"
            class="sliders__input"
            :min="1"
            :max="30"
            :step="0.1"
            :label="$tc('home.lineWidth', rect.lineWidth)"
            @change.native="$emit('change', $event.target.value)"
            @input.native="$emit('input', $event.target.value)"
        />

        <input-range
            v-model.number="rect.rotation"
            class="sliders__input"
            :min="-1440"
            :max="1440"
            :step="1"
            :label="$tc('home.rotation', rect.rotation)"
            @change.native="$emit('change', $event.target.value)"
            @input.native="$emit('input', $event.target.value)"
        />

        <input-range
            v-model.number="rect.borderRadius.tl"
            class="sliders__input"
            :min="0"
            :max="100"
            :step="1"
            :label="$tc('home.borderRadius', rect.borderRadius.tl / 2)"
            @change.native="$emit('change', $event.target.value)"
            @input.native="$emit('input', $event.target.value)"
        />

        <input-range
            v-model.number="rect.borderRadius.tr"
            class="sliders__input"
            :min="0"
            :max="100"
            :step="1"
            :label="$tc('home.borderRadius', rect.borderRadius.tr / 2)"
            @change.native="$emit('change', $event.target.value)"
            @input.native="$emit('input', $event.target.value)"
        />

        <input-range
            v-model.number="rect.borderRadius.bl"
            class="sliders__input"
            :min="0"
            :max="100"
            :step="1"
            :label="$tc('home.borderRadius', rect.borderRadius.bl / 2)"
            @change.native="$emit('change', $event.target.value)"
            @input.native="$emit('input', $event.target.value)"
        />

        <input-range
            v-model.number="rect.borderRadius.br"
            class="sliders__input"
            :min="0"
            :max="100"
            :step="1"
            :label="$tc('home.borderRadius', rect.borderRadius.br / 2)"
            @change.native="$emit('change', $event.target.value)"
            @input.native="$emit('input', $event.target.value)"
        />

        <input-range
            v-model.number="rect.width"
            class="sliders__input"
            :min="1"
            :max="512"
            :step="1"
            :label="$tc('home.width', rect.width)"
            @change.native="$emit('change', $event.target.value)"
            @input.native="$emit('input', $event.target.value)"
        />

        <input-range
            v-model.number="rect.height"
            class="sliders__input"
            :min="1"
            :max="512"
            :step="1"
            :label="$tc('home.height', rect.height)"
            @change.native="$emit('change', $event.target.value)"
            @input.native="$emit('input', $event.target.value)"
        />
    </div>
</template>

<script>
import InputRange from '@/components/InputRange';

export default {
    name: 'RectControl',

    components: {
        InputRange,
    },

    props: {
        rect: {
            type: Object,
            required: true,
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
