<template>
    <div class="faq">
        <h2 v-text="$t('faq.what')" />
        <p v-text="$t('faq.whatParagraph')" />
        <h2 v-text="$t('faq.implement')" />
        <p v-text="$t('faq.implementParagraph')" />
        <h2 v-text="$t('faq.copyright')" />
        <p v-text="$t('faq.copyrightParagraph')" />
        <h2 v-text="$t('faq.about')" />
        <!-- eslint-disable vue/no-v-html -->
        <p v-html="$t('faq.aboutParagraph')" />
        <!-- eslint-enable vue/no-v-html -->
    </div>
</template>

<script>
export default {
    name: 'Faq',
};
</script>

<style lang="scss" scoped>
.faq {
    margin: 0 auto;
    max-width: $breakpoint-md;
    padding: $padding-y * 4 $padding-x * 2;
    width: 100%;

    a {
        color: $black;
    }

    p {
        margin: 0;
        padding: 0 0 $padding-y * 4 0;
    }

    h2 {
        margin: 0;
        padding: 0 0 $padding-y 0;
    }
}
</style>
