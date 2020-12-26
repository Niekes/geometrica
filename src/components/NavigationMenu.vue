<template>
    <modal>
        <div class="navigation-menu">
            <button
                class="item__link"
                @click="goTo('home')"
                v-text="$t('navigation.home')"
            />
            <button
                class="item__link"
                @click="goTo('faq')"
                v-text="$t('navigation.faq')"
            />
            <button
                class="item__link"
                @click="goTo('cookies')"
                v-text="$t('navigation.cookies')"
            />
            <button
                class="item__link"
                @click="goTo('imprint')"
                v-text="$t('navigation.imprint')"
            />
            <beer-button
                class="item__sponsor"
            />
        </div>
    </modal>
</template>

<script>
import Modal from '@/components/Modal';
import ModalMixin from '@/mixins/modal-mixin';
import BeerButton from '@/components/BeerButton';

export default {
    name: 'NavigationMenu',

    components: {
        Modal,
        BeerButton,
    },

    mixins: [ModalMixin],

    methods: {
        goTo(path) {
            this.$router.push({ path }).catch(() => {});
            this.closeModal();
        },
    },
};
</script>

<style lang="scss" scoped>
.navigation-menu {
    align-items: center;
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    max-width: $breakpoint-lg / 2;
    width: 100%;
}

.item__link,
.item__sponsor {
    margin: $margin-y 0;
    padding: $padding-y * 2 0;
    width: 100%;
}

.item__link {
    background: rgba($primary, 0.05);
    border: none;
    cursor: pointer;
    font-size: $font-size;
    text-decoration: none;
    transition: background $transition-duration $transition-timing-function;

    &:hover {
        background: rgba($primary, 0.1);
    }
}
</style>
