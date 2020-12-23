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
                .style('background', `linear-gradient(90deg, rgba(0, 0, 0, 0.10) 0%, ${localstyles.secondary} ${this.p}%, white ${this.p}%)`);
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

    &__subtract,
    &__add {
        background-color: $white;
        border-radius: $border-radius;
        cursor: pointer;
        padding: 0 $padding-x;

        svg {
            color: $black-75;
            height: 0.4rem;
            width: 0.4rem;
        }
    }

    &__subtract {
        grid-area: subtract;
        justify-content: flex-start;

        &:hover {
            background: $white-75;
        }

        &:active:hover {
            background: $black-10;
        }
    }

    &__add {
        grid-area: add;
        justify-content: flex-end;

        &:hover {
            background: $white-75;
        }

        &:active:hover {
            background: $black-10;
        }
    }

    &__label {
        color: $primary;
        font-size: $font-size * 0.7;
        font-weight: bolder;
        grid-area: label;
        justify-content: center;
        text-transform: uppercase;
        user-select: none;
        white-space: nowrap;
        z-index: 1;
    }

    &__input {
        grid-area: input;

        @include input-type-range;
    }
}

@media (max-width: $breakpoint-sm) {
    .range {
        &__subtract,
        &__add {
            color: green;

            svg {
                height: 0.7rem;
                width: 0.7rem;
            }
        }

        &__input {
            @include input-type-range($white, 1.75rem, 1.75rem, 100%, 1.5rem);
        }
    }
}
</style>
