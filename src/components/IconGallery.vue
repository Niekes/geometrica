<template>
    <modal>
        <div class="icon-gallery">
            <div
                class="icon-gallery__icons"
            >
                <img
                    v-for="(icon, index) in icons"
                    :key="index"
                    :src="icon.src"
                    @click="apply(icon)"
                >
            </div>
        </div>
    </modal>
</template>

<script>
import Modal from '@/components/Modal';
import ModalMixin from '@/mixins/modal-mixin';

import config from '@/config';

export default {
    name: 'IconGallery',

    components: {
        Modal,
    },

    mixins: [ModalMixin],

    computed: {
        icons() {
            return config.icons;
        },
    },

    methods: {
        apply(icon) {
            this.$root.$emit('apply-icon', icon);
            this.closeModal();
        },
    },
};
</script>

<style lang="scss" scoped>
.icon-gallery {
    align-content: center;
    display: flex;
    flex-direction: column;

    &__icons {
        display: grid;
        gap: $margin-y * 4 $margin-x * 4;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        grid-template-rows: 1fr;
        margin-bottom: $margin-y * 4;

        img {
            align-content: center;
            background: $black;
            border: $border-width solid $black-70;
            border-radius: 10%;
            box-shadow: $box-shadow;
            cursor: pointer;
            display: flex;
            height: auto;
            justify-content: center;
            max-width: 100%;
            transition: box-shadow $transition-duration $transition-timing-function;

            &:hover {
                box-shadow: 0 0 1rem $black-75;
            }

            &::before {
                content: "";
                display: block;
                height: 0;
                padding-bottom: 100%;
                width: 0;
            }
        }
    }
}
</style>
