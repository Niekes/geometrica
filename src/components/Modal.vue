<template>
    <div
        class="modal__mask"
    >
        <div class="modal__container">
            <div class="modal__header">
                <button
                    class="modal__close"
                    @click.stop.prevent="close"
                >
                    <svg-icon
                        :xlink="'#close'"
                    />
                </button>
            </div>

            <slot class="modal__content" />
        </div>
    </div>
</template>

<script>
import SvgIcon from '@/components/SvgIcon';
import ModalMixin from '@/mixins/modal-mixin';

export default {
    name: 'Modal',

    components: {
        SvgIcon,
    },

    mixins: [ModalMixin],

    mounted() {
        document.body.appendChild(this.$el);
    },

    methods: {
        close() {
            this.closeModal();
        },
    },
};
</script>

<style lang="scss" scoped>
.modal__mask {
    align-items: center;
    animation: fade-in $transition-duration $transition-timing-function forwards;
    backdrop-filter: blur(20px);
    background: $black-50;
    bottom: 0;
    display: flex;
    height: 100%;
    justify-content: center;
    left: 0;
    opacity: 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: $z-index-modal-backdrop;

    &--fading-out {
        animation: fade-out $transition-duration $transition-timing-function forwards;
    }
}

@keyframes fade-in {
    to {
        opacity: 1;
    }
}

@keyframes fade-out {
    from {
        opacity: 1;
    }

    to {
        opacity: 0;
    }
}

.modal__container {
    background: $white;
    border-radius: $border-radius;
    box-shadow: 0 -50px 20px 30px $black-20;
    cursor: default;
    display: grid;
    gap: $margin-y * 2 0;
    grid-template-areas: "header" "content";
    grid-template-columns: 1fr;
    grid-template-rows: min-content 1fr;
    height: 75%;
    max-width: $breakpoint-lg;
    overflow: scroll;
    padding: $padding-y * 2 $padding-x * 2 $padding-y * 2 $padding-x * 2;
    position: relative;
    scrollbar-width: thin;
    width: 100%;
}

.modal__header {
    display: flex;
    grid-area: header;
    justify-content: flex-end;
    margin: auto;
    width: 100%;
    z-index: $z-index-modal-backdrop;
}

.modal__content {
    grid-area: content;
}

.modal__close {
    align-content: center;
    background: transparent;
    border: $border-width solid darken($tertiary, 20%);
    border-radius: $border-radius;
    color: $black-50;
    cursor: pointer;
    display: flex;
    font-size: $font-size * 1.25;
    font-weight: bolder;
    padding: $padding-y $padding-x;
    transition: color $transition-duration $transition-timing-function;

    svg {
        height: 1rem;
        width: 1rem;
    }

    &:hover {
        color: $black-75;
    }

    &:focus {
        outline: none;
    }
}

@media (max-width: $breakpoint-sm) {
    .modal__container {
        background: $white;
        border: none;
        height: 100%;
    }
}
</style>
