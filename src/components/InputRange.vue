<template>
    <div class="range">
        <span
            class="range__subtract"
            @click="value > min ? $emit('subtract', step) : null"
        >
            <svg-icon
                :xlink="'#minus'"
            />
        </span>
        <label
            class="range__label"
            v-text="label"
        />
        <input
            class="range__input"
            :value="value"
            :min="min"
            :max="max"
            :step="step"
            type="range"
            @input="handleInput"
        >
        <span
            class="range__add"
            @click="value < max ? $emit('add', step) : null"
        >
            <svg-icon
                :xlink="'#plus'"
            />
        </span>
    </div>
</template>

<script>
import {
    select,
    scaleLinear,
} from 'd3';

import SvgIcon from '@/components/SvgIcon';

// eslint-disable-next-line import/extensions
import localstyles from 'localstyles';

export default {
    name: 'InputRange',

    components: {
        SvgIcon,
    },

    props: {
        label: {
            type: String,
            default: '',
        },
        value: {
            type: Number,
            required: true,
        },
        min: {
            type: Number,
            default: 0,
        },
        max: {
            type: Number,
            default: 100,
        },
        step: {
            type: Number,
            default: 1,
        },
    },

    data() {
        return {
            p: 0,
        };
    },

    watch: {
        value() {
            this.adjustGradient();
        },
    },

    mounted() {
        this.scale = scaleLinear().domain([this.min, this.max]);

        this.slider = select(this.$el).select('.range__input');

        this.slider.dispatch('input');
    },

    methods: {
        handleInput(e) {
            this.adjustGradient();
            this.$emit('input', e.target.value);
        },
        adjustGradient() {
            this.p = this.scale(this.value) * 100;

            this.slider
                .style('background', `linear-gradient(90deg, ${localstyles.primary} 0%, ${localstyles.primary} ${this.p}%, rgba(255, 255, 255, 0.3) ${this.p}%)`);
        },
    },
};
</script>

<style lang="scss" scoped>
.range {
    display: grid;
    gap: 0 $margin-x / 2;
    grid-template-areas:
        "label label label label"
        "subtract input input add";
    grid-template-columns: min-content 1fr 1fr min-content;
    grid-template-rows: 1fr 1fr;

    &__subtract,
    &__add,
    &__label {
        align-items: center;
        display: flex;
    }

    &__subtract {
        grid-area: subtract;
        justify-content: flex-start;
    }

    &__add {
        grid-area: add;
        justify-content: flex-end;
    }

    &__subtract,
    &__add {
        background-color: $white-10;
        border: $border-width solid $white-70;
        border-radius: $border-radius;
        cursor: pointer;
        padding: $padding-y $padding-x;
        transition: background-color $transition-duration / 2 $transition-timing-function;

        svg {
            color: $white;
            height: 0.5rem;
            width: 0.5rem;
        }

        &:hover {
            background: $white-20;
        }

        &:active:hover {
            background: $white-50;
        }
    }

    &__label {
        align-self: flex-end;
        color: $white;
        font-size: $font-size * 0.7;
        font-weight: 700;
        grid-area: label;
        justify-content: center;
        letter-spacing: 0.5px;
        text-shadow: 1px 1px 2px $black-30, -1px -1px 2px $black-30;
        user-select: none;
        white-space: nowrap;
        z-index: 1;
    }

    &__input {
        grid-area: input;
        place-self: center;

        @include input-type-range($white, 1rem, 1rem, 100%, 0.5rem);
    }
}

@media (max-width: $breakpoint-sm) {
    .range {
        &__subtract,
        &__add {
            svg {
                height: 0.8rem;
                width: 0.8rem;
            }
        }

        &__input {
            @include input-type-range($white, 1.75rem, 1.75rem, 100%, 0.75rem);
        }
    }
}
</style>
