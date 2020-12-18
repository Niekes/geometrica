<template>
    <svg><use :xlink:href="`${xlink}--sprite`" /></svg>
</template>

<script>
export default {
    name: 'SvgIcon',

    props: {
        xlink: {
            type: String,
            required: true,
        },
    },
};
</script>

<style lang="scss" scoped>
svg {
    display: block;
}
</style>
