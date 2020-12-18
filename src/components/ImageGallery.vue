<template>
    <modal>
        <div class="image-gallery">
            <div
                class="image-gallery__images"
            >
                <div
                    v-for="(image, index) in referenceImages"
                    :key="index"
                >
                    <img
                        :src="image[1].src"
                        @click="chooseImage(index)"
                    >
                </div>
            </div>
        </div>
    </modal>
</template>

<script>
import Modal from '@/components/Modal';
import ModalMixin from '@/mixins/modal-mixin';

import config from '@/config';

export default {
    name: 'ImageGallery',

    components: {
        Modal,
    },

    mixins: [ModalMixin],

    computed: {
        referenceImages() {
            return Array.from(config.images);
        },
    },

    methods: {
        chooseImage(index) {
            this.$root.$emit('change-image', index);
            this.closeModal();
        },
    },
};
</script>

<style lang="scss" scoped>
.image-gallery {
    align-content: center;
    display: flex;
    flex-direction: column;
}

.image-gallery__images {
    display: grid;
    gap: $margin-y * 4 $margin-x * 4;
    grid-auto-rows: 200px;
    grid-template-columns: repeat(3, 1fr);
    margin-bottom: $margin-y * 4;

    div {
        align-content: center;
        display: flex;
        justify-content: center;

        img {
            border: $border-width solid $black-70;
            border-radius: $border-radius;
            box-shadow: $box-shadow;
            cursor: pointer;
            height: auto;
            max-width: 100%;
            transition: box-shadow $transition-duration $transition-timing-function;

            &:hover {
                box-shadow: 0 0 1rem $black-75;
            }
        }
    }
}

@media (max-width: $breakpoint-sm) {
    .image-gallery__images {
        grid-template-columns: repeat(1, 1fr);
    }
}
</style>
