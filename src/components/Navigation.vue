<template>
    <div class="navigation">
        <svg-icon
            class="navigation__bg"
            :xlink="'#pattern'"
        />

        <svg-icon
            class="navigation__logo"
            :xlink="'#logo'"
            @click.native="$router.push({ name: 'Home' })"
        />

        <div
            class="navigation__items"
        >
            <beer-button
                class="item__sponsor"
            />

            <button
                class="item__menu"
                @click="$store.dispatch('modal/openNavigationMenu')"
            >
                <svg-icon :xlink="'#menu'" />
            </button>
        </div>

        <download-dialogue v-if="downloadIsOpen" />
        <icon-gallery v-if="galleryIsOpen" />
        <cookies-banner v-if="showCookieBanner" />
        <navigation-menu v-if="navigationMenuIsOpen" />

        <!--
            Embedd tutorial https://youtu.be/52M9FvpaBxE
        -->
    </div>
</template>

<script>
import BeerButton from '@/components/BeerButton';
import CookiesBanner from '@/components/CookiesBanner';
import DownloadDialogue from '@/components/DownloadDialogue';
import IconGallery from '@/components/IconGallery';
import NavigationMenu from '@/components/NavigationMenu';
import SvgIcon from '@/components/SvgIcon';

export default {
    name: 'Navigation',

    components: {
        BeerButton,
        CookiesBanner,
        DownloadDialogue,
        IconGallery,
        NavigationMenu,
        SvgIcon,
    },

    computed: {
        showCookieBanner() {
            return this.$route.name === 'Home' && window.localStorage.getItem('gtag-cookie-accepted') !== 'true';
        },

        isMobile() {
            return this.$store.getters['mobile/isMobile'];
        },

        galleryIsOpen() {
            return this.$store.getters['modal/galleryIsOpen'];
        },

        navigationMenuIsOpen() {
            return this.$store.getters['modal/navigationMenuIsOpen'];
        },

        downloadIsOpen() {
            return this.$store.getters['modal/downloadIsOpen'];
        },

    },
};
</script>

<style lang="scss" scoped>
.navigation {
    background: linear-gradient(90deg, $primary, $tertiary);
    background-size: 100%, 100%;
    box-shadow: $box-shadow;
    display: grid;
    grid-template-areas: "logo items";
    grid-template-columns: min-content 1fr;
    grid-template-rows: 1fr;
    padding: 0 $padding-x * 2;
    position: relative;
    z-index: 0;
}

.navigation__bg {
    height: 100%;
    pointer-events: none;
    position: absolute;
    user-select: none;
    width: 100%;
    z-index: 1;
}

.navigation__logo {
    align-self: center;
    color: $white;
    display: flex;
    filter: drop-shadow(3px 3px 4px $black-30);
    grid-area: logo;
    height: 2rem;
    user-select: none;
    width: 20rem;
    z-index: 2;
}

.navigation__items {
    align-items: center;
    display: flex;
    grid-area: items;
    justify-content: flex-end;
    z-index: 2;

    .item__link {
        color: $white-80;
        font-size: $font-size * 0.75;
        text-decoration: none;
        text-shadow: $text-shadow;

        &:not(:first-child) {
            margin-left: $margin-x * 2;
        }
    }

    .item__menu {
        background: transparent;
        border: none;
        cursor: pointer;
        margin-left: $margin-x * 2;
        padding: 0;

        svg {
            color: $white;
            height: 1.5rem;
            width: 1.5rem;
        }
    }
}

@media (max-width: $breakpoint-sm) {
    .navigation__logo {
        height: 2rem;
        width: 15rem;
    }

    .navigation__items {
        .item__sponsor {
            display: none;
        }
    }
}
</style>
