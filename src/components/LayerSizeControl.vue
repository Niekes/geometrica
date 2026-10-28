<script setup lang="ts">
// Icons
import { LockClosedIcon, LockOpenIcon } from '@heroicons/vue/24/outline';

// Components
import BaseRangeSlider from '@/components/BaseRangeSlider.vue';

// Types
import { type Layer } from '@/types/Layer';

// Config
import { layerRanges } from '@/config/ranges';
import { useLinkedSliders } from '@/composables/useLinkedSliders';

const layer = defineModel<Layer>({ required: true });

const isSizeLocked = defineModel<boolean>('sizeLocked', { default: true });

const px = (d: number) => `${d}px`;

useLinkedSliders(layer, ['width', 'height'], isSizeLocked, () => layer.value.shape === 'rect');
useLinkedSliders(layer, ['radiusX', 'radiusY'], isSizeLocked, () => layer.value.shape === 'circle');
</script>

<template>
    <button
        v-if="layer.shape === 'rect' || layer.shape === 'circle'"
        class="btn btn-sm btn-square self-end"
        @click="isSizeLocked = !isSizeLocked"
    >
        <LockClosedIcon v-if="isSizeLocked" class="size-4" />
        <LockOpenIcon v-if="!isSizeLocked" class="size-4" />
    </button>

    <template v-if="layer.shape === 'rect'">
        <BaseRangeSlider
            v-model.number="layer.width"
            v-bind="layerRanges.width"
            label="Width"
            :format="px"
        />
        <BaseRangeSlider
            v-model.number="layer.height"
            v-bind="layerRanges.height"
            label="Height"
            :format="px"
        />
    </template>

    <template v-if="layer.shape === 'circle'">
        <BaseRangeSlider
            v-model.number="layer.radiusX"
            v-bind="layerRanges.radiusX"
            label="Radius X"
            :format="px"
        />
        <BaseRangeSlider
            v-model.number="layer.radiusY"
            v-bind="layerRanges.radiusY"
            label="Radius Y"
            :format="px"
        />
    </template>

    <template v-if="layer.shape === 'polygon'">
        <BaseRangeSlider v-model.number="layer.sides" v-bind="layerRanges.sides" label="Sides" />
        <BaseRangeSlider
            v-model.number="layer.size"
            v-bind="layerRanges.size"
            label="Size"
            :format="px"
        />
        <BaseRangeSlider
            v-model.number="layer.borderRadius"
            v-bind="layerRanges.borderRadius"
            label="Border Radius"
            :format="(d: number) => `${(d * 50).toFixed(1)}%`"
        />
    </template>

    <BaseRangeSlider
        v-if="layer.shape === 'custom'"
        v-model.number="layer.size"
        v-bind="layerRanges.size"
        label="Size"
        :format="px"
    />
</template>
