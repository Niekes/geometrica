<template>
    <fieldset
        :id="id"
        class="radio"
    >
        <legend
            v-if="label"
            class="radio__legend"
            v-text="label"
        />
        <div
            v-for="(option, index) in options"
            :key="option.text"
            class="radio__content"
        >
            <input
                :id="`${id}-${index}`"
                :name="id"
                type="radio"
                :value="option.value"
                :checked="option.value === value"
                class="content__input"
                :disabled="disabled"
                @change="$emit('change', option.value)"
            >
            <label
                class="content__label"
                :for="`${id}-${index}`"
                v-text="option.text"
            />
        </div>
    </fieldset>
</template>

<script>
export default {
    model: {
        event: 'change',
    },
    props: {
        id: {
            type: String,
            required: true,
        },
        label: {
            type: String,
            required: true,
        },
        value: {
            type: [String, Number, Boolean, Object],
            default: null,
        },
        options: {
            type: [Array],
            required: true,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
};
</script>

<style lang="scss" scoped>
.radio {
    border: $border-width solid $secondary;
    border-radius: $border-radius;
    display: flex;
    justify-content: space-around;
    margin: 0;
    padding: $padding;

    &__legend {
        color: $secondary;
        font-size: $font-size * 0.7;
        font-weight: bolder;
        margin-left: auto;
        margin-right: auto;
        padding: 0 $padding-x;
        text-transform: uppercase;
        user-select: none;
        white-space: nowrap;
        width: auto;
        z-index: 1;
    }

    &__content {
        .content__input {
            display: none;

            &:checked + label {
                &::after {
                    background: $primary;
                    transform: scale(0.5);
                }
            }
        }

        .content__label {
            align-items: center;
            color: $primary;
            cursor: pointer;
            display: flex;
            font-size: $font-size * 0.7;
            font-weight: bolder;
            padding-left: $font-size * 0.7 + $padding-x;
            position: relative;
            text-transform: uppercase;
            user-select: none;
            white-space: nowrap;
            z-index: 1;

            &::before {
                border: $border-width solid;
                border-color: $primary;
                border-radius: 50%;
                bottom: 0;
                content: '';
                height: $font-size;
                left: 0;
                margin: auto;
                position: absolute;
                top: 0;
                transform: scale(0.8);
                width: $font-size;
            }

            &::after {
                border-radius: 50%;
                bottom: 0;
                content: '';
                height: $font-size;
                left: 0;
                margin: auto;
                position: absolute;
                top: 0;
                transform: scale(0);
                transition:
                    background $transition-duration / 2 $transition-timing-function,
                    transform $transition-duration / 2 $transition-timing-function;
                width: $font-size;
            }
        }
    }
}
</style>
