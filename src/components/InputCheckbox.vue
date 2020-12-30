<template>
    <div
        :id="id"
        class="checkbox"
    >
        <div
            v-for="(option, index) in options"
            :key="option.text"
            class="checkbox__content"
        >
            <input
                :id="`${id}-${index}`"
                v-model="localValue"
                class="content__input"
                :value="option.value"
                type="checkbox"
                :name="id"
            >
            <label
                :for="`${id}-${index}`"
                class="content__label"
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
        label: {
            type: String,
            required: true,
        },
        options: {
            type: Array,
            default: () => [],
        },
        value: {
            type: [Boolean, String, Number, Array],
            default: '',
        },
        id: {
            type: String,
            required: true,
        },
    },

    computed: {
        localValue: {
            get() {
                return this.value;
            },
            set(val) {
                this.$emit('change', val);
            },
        },
    },
};
</script>

<style lang="scss" scoped>
.checkbox {
    display: flex;
    justify-content: space-between;
    padding: $padding-y 0;

    &__content {
        align-items: center;
        display: flex;

        .content__input {
            display: none;

            &:checked + label::after {
                transform: scale(0.7);
            }
        }

        .content__label {
            color: $white;
            cursor: pointer;
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
                border-radius: $border-radius;
                bottom: 0;
                content: '';
                height: $font-size;
                left: 0;
                margin: auto;
                position: absolute;
                top: 0;
                transform: scale(0.7);
                width: $font-size;
            }

            &::after {
                background: transparent;
                background-image: url('data:image/svg+xml;utf8,<svg width="100%" height="100%" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve"><path fill="%23fff" d="M19.343,4.739l2.261,2.261l-12.424,12.424l-6.784,-6.784l2.261,-2.262l4.523,4.523l10.163,-10.162Z"/></svg>');
                background-position: center;
                background-repeat: no-repeat;
                background-size: 100%;
                border-radius: $border-radius;
                bottom: 0;
                content: '';
                height: $font-size;
                left: 0;
                margin: auto;
                position: absolute;
                top: 0;
                transform: scale(0);
                transition: transform $transition-duration / 2 ease-in-out;
                width: $font-size;
            }
        }
    }
}
</style>
