<template>
    <a
        class="beer-button"
        :href="buymeacoffee"
        target="_blank"
    >
        {{ $t('general.buymeabeer') }}
        <svg-icon :xlink="'#beer'" />
    </a>
</template>

<script>
import SvgIcon from '@/components/SvgIcon';

import config from '@/config';

export default {
    name: 'BeerButton',

    components: {
        SvgIcon,
    },

    created() {
        this.buymeacoffee = config.links.buymeacoffee;
    },
};
</script>

<style lang="scss" scoped>
.beer-button {
    align-items: center;
    background: rgba($primary, 0.9);
    border-radius: $border-radius;
    color: $white;
    display: flex;
    font-weight: bolder;
    justify-content: center;
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
