<template>
    <button
        class="button"
        :class="{
            'button--variant-1': variant === 1,
            'button--variant-2': variant === 2,
        }"
        :disabled="disabled"
    >
        <svg-icon
            v-if="icon"
            :xlink="icon"
        />
        <span
            v-text="text"
        />
    </button>
</template>

<script>
import SvgIcon from '@/components/SvgIcon';

export default {
    name: 'BaseButton',

    components: {
        SvgIcon,
    },

    props: {
        variant: {
            type: Number,
            default: 1,
        },
        text: {
            type: String,
            required: true,
        },
        icon: {
            type: String,
            default: '',
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
};
</script>

<style lang="scss" scoped>
.button {
    align-items: center;
    display: flex;
    justify-content: center;

    &--variant-1 {
        background: $black-10;
        border: $border-width solid $white-70;
        border-radius: $border-radius;
        box-shadow: 1px 1px 3px 1px rgba($primary, 0.2), -1px -1px 3px 1px rgba($primary, 0.2);
        color: $white;
        cursor: pointer;
        font-size: 1rem;
        font-weight: bolder;
        padding: $padding;
        text-align: center;
        text-decoration: none;
        text-shadow: 1px 1px 2px $black-30, -1px -1px 2px $black-30;
        transition: box-shadow $transition-duration $transition-timing-function;
        width: 100%;

        &:hover {
            box-shadow: 1px 1px 3px 1px rgba($primary, 0.4), -1px -1px 3px 1px rgba($primary, 0.4);
        }
    }

    &--variant-2 {
        background:
            linear-gradient(
                90deg,
                $primary 0%,
                $tertiary 50%,
                $primary 100%,
            );
        background-position: center center;
        background-size: 100%;
        border: $border-width * 2 solid $white-20;
        border-radius: $border-radius;
        box-shadow: $box-shadow;
        color: $white;
        cursor: pointer;
        font-size: $font-size;
        font-weight: bolder;
        letter-spacing: 0.5px;
        padding: $padding-y * 2 $padding-x * 2;
        text-shadow:
            2px 2px 3px $black-30,
            -2px -2px 3px $black-30,
            -2px 2px 3px $black-30,
            2px -2px 3px $black-30;
        text-transform: uppercase;
        transition:
            background-size $transition-duration $transition-timing-function,
            text-shadow $transition-duration $transition-timing-function;

        &:hover {
            background-size: 110%;
            text-shadow:
                2px 2px 3px $black-40,
                -2px -2px 3px $black-40,
                -2px 2px 3px $black-40,
                2px -2px 3px $black-40;
        }
    }

    svg {
        filter: drop-shadow(0 0 2px $black-30);
        height: 1rem;
        margin-right: $margin-x / 2;
        width: 1rem;
    }

    &:disabled {
        box-shadow: none;
        cursor: not-allowed;
        opacity: 0.5;
    }

    &:focus {
        outline: none;
    }
}
</style>
