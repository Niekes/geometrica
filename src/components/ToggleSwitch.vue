<template>
    <div class="toggle-switch">
        <span
            class="toggle-switch__label--left"
            :style="{
                'opacity': value ? 0.5 : 1,
            }"
            v-text="textLeft"
        />
        <input
            id="switch"
            :checked="value"
            class="toggle-switch__input"
            type="checkbox"
            @input="$emit('input', $event.target.checked);"
        >
        <label
            class="toggle-switch__slider"
            for="switch"
        />
        <span
            class="toggle-switch__label--right"
            :style="{
                'opacity': value ? 1 : 0.5,
            }"
            v-text="textRight"
        />
    </div>
</template>

<script>

export default {
    name: 'ToggleSwitch',

    props: {
        label: {
            type: String,
            default: '',
        },
        value: {
            type: Boolean,
            required: true,
        },
        textLeft: {
            type: String,
            required: true,
        },
        textRight: {
            type: String,
            required: true,
        },
    },
};
</script>

<style lang="scss" scoped>
$size: 24px;
$space: 1px;

.toggle-switch {
    align-items: center;
    display: flex;
    justify-content: space-between;
    position: relative;

    &__label--left,
    &__label--right {
        color: $primary;
        font-size: $font-size * 0.7;
        font-weight: bolder;
        pointer-events: none;
        position: absolute;
        text-transform: uppercase;
        top: 50%;
        transform: translate(0, -50%);
        transition: opacity $transition-duration / 2 $transition-timing-function;
        user-select: none;
        white-space: nowrap;
        z-index: 1;
    }

    &__label--left {
        left: 0;
        margin-left: $margin-x;
    }

    &__label--right {
        margin-right: $margin-x;
        right: 0;
    }

    &__input {
        height: 0;
        visibility: hidden;
        width: 0;

        &:checked {
            + label {
                background: $black-20;

                &::after {
                    left: calc(100% - #{$space});
                    transform: translateX(-100%);
                }
            }
        }
    }

    &__slider {
        background: $black-20;
        border-radius: $border-radius;
        cursor: pointer;
        display: block;
        height: $size;
        position: relative;
        text-indent: -9999px;
        transition: background 0.3s;
        width: 100%;

        &::after {
            background: $white;
            border-radius: $border-radius;
            content: '';
            height: $size - ($space * 2);
            left: $space;
            position: absolute;
            top: $space;
            transition:
                left $transition-duration / 2 $transition-timing-function,
                transform $transition-duration / 2 $transition-timing-function,
                width $transition-duration / 2 $transition-timing-function;
            width: 50%;
        }
    }
}
</style>
