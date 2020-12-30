<template>
    <div
        :id="id"
        class="radio"
    >
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
    </div>
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
    display: flex;
    justify-content: space-between;
    padding: $padding-y 0;

    &__content {
        .content__input {
            display: none;

            &:checked + label {
                &::after {
                    background: $white;
                    transform: scale(0.5);
                }
            }
        }

        .content__label {
            align-items: center;
            color: $white;
            cursor: pointer;
            display: flex;
            font-size: $font-size * 0.7;
            font-weight: 700;
            letter-spacing: 0.5px;
            padding-left: $font-size * 0.7 + $padding-x;
            position: relative;
            user-select: none;
            white-space: nowrap;
            z-index: 1;

            &::before {
                border: $border-width solid;
                border-color: $white;
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
