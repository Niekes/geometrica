<template>
    <modal>
        <div class="icon-gallery">
            1
        </div>
    </modal>
</template>

<script>
import Modal from '@/components/Modal';
import ModalMixin from '@/mixins/modal-mixin';

export default {
    name: 'ImageGallery',

    components: {
        Modal,
    },

    mixins: [ModalMixin],


    methods: {
        chooseImage(index) {
            // WORKS

            console.log(index);
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
}

.icon-gallery__images {
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
    .icon-gallery__images {
        grid-template-columns: repeat(1, 1fr);
    }
}
</style>
