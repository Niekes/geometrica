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
            <a
                class="item__sponsor"
                :href="buymeacoffee"
                target="_blank"
            >
                {{ $t('navigation.buymeabeer') }}
                <svg-icon :xlink="'#beer'" />
            </a>
        </div>
    </modal>
</template>

<script>
import Modal from '@/components/Modal';
import ModalMixin from '@/mixins/modal-mixin';
import SvgIcon from '@/components/SvgIcon';

import config from '@/config';

export default {
    name: 'NavigationMenu',

    components: {
        Modal,
        SvgIcon,
    },

    mixins: [ModalMixin],

    created() {
        this.buymeacoffee = config.links.buymeacoffee;
    },

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
    width: 100%;
}

.item__link {
    background: rgba($primary, 0.05);
    border: none;
    cursor: pointer;
    font-size: $font-size;
    margin: $margin-y 0;
    padding: $padding-y * 2 0;
    text-decoration: none;
    transition: background $transition-duration $transition-timing-function;

    &:hover {
        background: rgba($primary, 0.1);
    }
}

.item__sponsor {
    align-items: center;
    background: rgba($primary, 0.9);
    border-radius: $border-radius;
    color: $white;
    display: flex;
    font-weight: bolder;
    justify-content: center;
    margin-top: $margin-y;
    padding: $padding;
    text-decoration: none;
    text-shadow: $text-shadow;
    transition: background $transition-duration $transition-timing-function;

    &:hover {
        background: $primary;
    }

    svg {
        height: 1.5rem;
        margin-left: $margin-x;
        width: 1.5rem;
    }
}
</style>
