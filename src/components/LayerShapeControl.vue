<script setup lang="ts">
// Vue
import { ref } from 'vue';

// Components
import BaseLinkToggle from '@/components/BaseLinkToggle.vue';
import BaseRangeSlider from '@/components/BaseRangeSlider.vue';
import LayerPathControl from '@/components/LayerPathControl.vue';

// Types
import { type Layer } from '@/types/Layer';

// Config
import { layerRanges } from '@/config/ranges';
import { useLinkedSliders } from '@/composables/useLinkedSliders';

const layer = defineModel<Layer>({ required: true });

const isSizeLinked = ref(true);
const areCornersLinked = ref(true);
const areCountsLinked = ref(true);
const areGapsLinked = ref(true);

useLinkedSliders(layer, ['width', 'height'], isSizeLinked, () => layer.value.shape === 'rect');
useLinkedSliders(layer, ['radiusX', 'radiusY'], isSizeLinked, () => layer.value.shape === 'circle');
useLinkedSliders(
    layer,
    ['borderRadiusTl', 'borderRadiusTr', 'borderRadiusBl', 'borderRadiusBr'],
    areCornersLinked,
    () => layer.value.shape === 'rect'
);
useLinkedSliders(layer, ['columns', 'rows'], areCountsLinked, () => true);
useLinkedSliders(layer, ['columnGap', 'rowGap'], areGapsLinked, () => true);

// a corner radius is a share of half the side: 1 turns the side into a half circle, shown as 50%
const corner = { scale: 50, unit: '%' };

const corners = [
    { name: 'borderRadiusTl', label: 'Top left' },
    { name: 'borderRadiusTr', label: 'Top right' },
    { name: 'borderRadiusBl', label: 'Bottom left' },
    { name: 'borderRadiusBr', label: 'Bottom right' }
] as const;

const counts = [
    { name: 'columns', label: 'Columns' },
    { name: 'rows', label: 'Rows' }
] as const;

const gaps = [
    { name: 'columnGap', label: 'Between columns' },
    { name: 'rowGap', label: 'Between rows' }
] as const;
</script>

<template>
    <template v-if="layer.shape === 'rect'">
        <BaseLinkToggle v-model="isSizeLinked" heading="Size" label="Link width and height" />
        <BaseRangeSlider
            v-model.number="layer.width"
            v-bind="layerRanges.width"
            label="Width"
            unit="px"
        />
        <BaseRangeSlider
            v-model.number="layer.height"
            v-bind="layerRanges.height"
            label="Height"
            unit="px"
        />

        <BaseLinkToggle v-model="areCornersLinked" heading="Corner radius" label="Link corners" />
        <BaseRangeSlider
            v-for="c in corners"
            :key="c.name"
            v-model.number="layer[c.name]"
            v-bind="{ ...layerRanges[c.name], ...corner }"
            :label="c.label"
        />
    </template>

    <template v-if="layer.shape === 'circle'">
        <BaseLinkToggle v-model="isSizeLinked" heading="Size" label="Link both radii" />
        <BaseRangeSlider
            v-model.number="layer.radiusX"
            v-bind="layerRanges.radiusX"
            label="Radius X"
            unit="px"
        />
        <BaseRangeSlider
            v-model.number="layer.radiusY"
            v-bind="layerRanges.radiusY"
            label="Radius Y"
            unit="px"
        />
    </template>

    <template v-if="layer.shape === 'polygon'">
        <BaseRangeSlider v-model.number="layer.sides" v-bind="layerRanges.sides" label="Sides" />
        <BaseRangeSlider
            v-model.number="layer.size"
            v-bind="layerRanges.size"
            label="Size"
            unit="px"
        />
        <BaseRangeSlider
            v-model.number="layer.borderRadius"
            v-bind="{ ...layerRanges.borderRadius, ...corner }"
            label="Corner radius"
        />
    </template>

    <template v-if="layer.shape === 'custom'">
        <LayerPathControl v-model="layer" />
        <BaseRangeSlider
            v-model.number="layer.size"
            v-bind="layerRanges.size"
            label="Size"
            unit="px"
        />
    </template>

    <BaseLinkToggle v-model="areCountsLinked" heading="Lattice" label="Link columns and rows" />
    <BaseRangeSlider
        v-for="c in counts"
        :key="c.name"
        v-model.number="layer[c.name]"
        v-bind="layerRanges[c.name]"
        :label="c.label"
    />
    <BaseLinkToggle v-model="areGapsLinked" heading="Gap" label="Link both gaps" />
    <BaseRangeSlider
        v-for="g in gaps"
        :key="g.name"
        v-model.number="layer[g.name]"
        v-bind="layerRanges[g.name]"
        :label="g.label"
        unit="px"
    />
    <label class="label text-xs">
        <input v-model="layer.offsetRows" type="checkbox" class="toggle toggle-xs" />
        Offset every second row
    </label>
</template>
