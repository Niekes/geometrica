<script setup lang="ts">
// Icons
import { LockClosedIcon, LockOpenIcon } from '@heroicons/vue/24/outline';

// Components
import BaseRangeSlider from '@/components/BaseRangeSlider.vue';

// Types
import { type Layer } from '@/types/Layer';

// Config
import { surfaceSize } from '@/config/surface';
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
            :min="1"
            :max="surfaceSize"
            :step="1"
            label="Width"
            :format="px"
        />
        <BaseRangeSlider
            v-model.number="layer.height"
            :min="1"
            :max="surfaceSize"
            :step="1"
            label="Height"
            :format="px"
        />
    </template>

    <template v-if="layer.shape === 'circle'">
        <BaseRangeSlider
            v-model.number="layer.radiusX"
            :min="1"
            :max="surfaceSize"
            :step="1"
            label="Radius X"
            :format="px"
        />
        <BaseRangeSlider
            v-model.number="layer.radiusY"
            :min="1"
            :max="surfaceSize"
            :step="1"
            label="Radius Y"
            :format="px"
        />
    </template>

    <template v-if="layer.shape === 'polygon'">
        <BaseRangeSlider v-model.number="layer.sides" :min="3" :max="32" :step="1" label="Sides" />
        <BaseRangeSlider
            v-model.number="layer.size"
            :min="1"
            :max="surfaceSize"
            :step="1"
            label="Size"
            :format="px"
        />
        <BaseRangeSlider
            v-model.number="layer.borderRadius"
            :min="0"
            :max="1"
            :step="0.01"
            label="Border Radius"
            :format="(d: number) => `${(d * 50).toFixed(1)}%`"
        />
    </template>

    <BaseRangeSlider
        v-if="layer.shape === 'custom'"
        v-model.number="layer.size"
        :min="1"
        :max="surfaceSize"
        :step="1"
        label="Size"
        :format="px"
    />
</template>
