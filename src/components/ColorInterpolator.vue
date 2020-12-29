<template>
    <div class="color-interpolator" />
</template>

<script>
import {
    select,
    create,
} from 'd3';

import config from '@/config';

export default {
    name: 'ColorInterpolator',

    props: {
        active: {
            type: Object,
            required: true,
        },
    },

    computed: {
        scopeId() {
            // eslint-disable-next-line no-underscore-dangle
            return this.$options._scopeId;
        },
    },

    created() {
        this.colorInterPolators = config.colorInterPolators;
    },

    beforeDestroy() {
        select(this.$el)
            .selectAll('canvas.color-interpolator__canvas')
            .on('click', null);
    },

    mounted() {
        this.colorInterPolators.forEach((color) => {
            const canvas = create('canvas')
                .attr('class', 'color-interpolator__canvas')
                .attr(this.scopeId, '')
                .classed('color-interpolator__canvas--active', this.active.name === color.name);

            canvas.datum(color);

            select(this.$el).node().appendChild(canvas.node());

            // canvas.node().width = Number.parseInt(select(this.$el).style('width'), 10);
            canvas.node().width = 32;
            canvas.node().height = 1;

            const ctx = canvas.node().getContext('2d');

            for (let i = 0; i <= canvas.node().width; i += 1) {
                ctx.fillStyle = color.fn(i / canvas.node().width);
                ctx.fillRect(i, 0, 1, 1);
            }
        });

        select(this.$el)
            .selectAll('canvas.color-interpolator__canvas')
            .on('click', this.setColorInterPolator);
    },

    methods: {
        setColorInterPolator(event) {
            select(this.$el)
                .selectAll('canvas.color-interpolator__canvas')
                .classed('color-interpolator__canvas--active', false);

            select(event.target)
                .classed('color-interpolator__canvas--active', true);

            this.$emit('update-color-interpolator', select(event.target).datum());
        },
    },
};
</script>

<style lang="scss" scoped>
.color-interpolator {
    display: flex;
    flex-direction: column;

    &__canvas {
        border: $border-width solid $black-50;
        border-radius: $border-radius;
        cursor: pointer;
        height: 2rem;
        width: 100%;

        &:not(:last-child) {
            margin-bottom: $margin-y;
        }

        &:not(&--active):hover {
            border: $border-width * 2 solid $black-75;
        }

        &--active {
            border: $border-width * 3 solid $black;
        }
    }
}
</style>
