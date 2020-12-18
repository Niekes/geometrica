<template>
    <div class="cookies-banner">
        <div v-text="$t('cookiesBanner.text')" />
        <button
            @click="optIn"
            v-text="$t('cookiesBanner.accept')"
        />
        <router-link
            to="/cookies"
            v-text="$t('cookiesBanner.learnMore')"
        />
    </div>
</template>

<script>
import {
    select,
} from 'd3';

export default {
    name: 'CookiesBanner',

    mounted() {
        document.body.appendChild(this.$el);
    },

    methods: {
        optIn() {
            this.$gtag.optIn();

            window.localStorage.setItem('gtag-cookie-accepted', true);

            select(this.$el)
                .style('opacity', 1)
                .transition()
                .style('opacity', 0)
                .remove();
        },
    },
};
</script>

<style lang="scss" scoped>
.cookies-banner {
    align-items: center;
    background: $black;
    border: $border-width solid $white-25;
    border-radius: $border-radius;
    bottom: $margin-y;
    box-shadow: $box-shadow;
    color: $white;
    display: flex;
    font-size: $font-size * 0.9;
    justify-content: center;
    left: $margin-x;
    padding: $padding;
    position: absolute;
    width: calc(100% - #{$margin-x * 2});
    z-index: $z-index-popover + 1;

    button {
        background: $tertiary;
        border: $border-width solid $black-30;
        border-radius: $border-radius;
        color: $black;
        cursor: pointer;
        margin: 0 $margin-x;
        padding: $padding-y / 2 $padding-x;

        &:hover {
            filter: saturate(1.5);
        }
    }

    a {
        color: $white-50;
    }
}
</style>
