<script setup lang="ts">
// Components
import BaseCheckBox from '@/components/BaseCheckBox.vue';
import BaseRadioButton from '@/components/BaseRadioButton.vue';
import BaseRangeSlider from '@/components/BaseRangeSlider.vue';
import ColorInterpolator from '@/components/ColorInterpolator.vue';

// Types
import { type Layer } from '@/types/Layer';
import type { BaseControl } from '@/types/Control';

// Config
import {
    flipColorInterpolatorOptions,
    applyColorSchemeToEachShapeOptions,
    calcOpacityOptions,
    gradientTypeOptions
} from '@/config/controlOptions';
import { layerRanges } from '@/config/ranges';

const layer = defineModel<Layer>({ required: true });

type Control = BaseControl & { name: keyof Layer };

const toPercent = (d: number) => `${(d * 100).toFixed(0)}%`;

// the layer opacity scales the fill and the stroke opacity of every instance
const opacityControls: Control[] = [
    {
        ...layerRanges.opacity,
        label: 'Layer Opacity',
        name: 'opacity',
        format: toPercent
    },
    {
        ...layerRanges.fillOpacity,
        label: 'Fill Opacity',
        name: 'fillOpacity',
        format: toPercent
    },
    {
        ...layerRanges.strokeOpacity,
        label: 'Stroke Opacity',
        name: 'strokeOpacity',
        format: toPercent
    }
];

const setColorInterPolator = (interpolator: { name: Layer['colorInterPolator'] }) => {
    layer.value.colorInterPolator = interpolator.name;
};
</script>

<template>
    <BaseRangeSlider
        v-for="ctrl in opacityControls"
        :key="ctrl.name"
        v-model.number="layer[ctrl.name] as number"
        :min="ctrl.min"
        :max="ctrl.max"
        :step="ctrl.step"
        :label="ctrl.label"
        :format="ctrl.format"
    />

    <BaseCheckBox :options="calcOpacityOptions" v-model="layer.calcOpacity" />

    <BaseRadioButton
        :options="applyColorSchemeToEachShapeOptions"
        v-model="layer.applyColorSchemeToEachShape"
    />

    <template v-if="layer.applyColorSchemeToEachShape">
        <BaseRadioButton :options="gradientTypeOptions" v-model="layer.gradientType" />
        <BaseRangeSlider
            v-if="layer.gradientType === 'linear'"
            v-model.number="layer.gradientAngle"
            v-bind="layerRanges.gradientAngle"
            label="Gradient Angle"
            :format="(d: number) => `${d}°`"
        />
    </template>

    <BaseRadioButton
        :options="flipColorInterpolatorOptions"
        v-model="layer.flipColorInterpolator"
    />

    <ColorInterpolator
        :active="layer.colorInterPolator"
        @update-color-interpolator="setColorInterPolator"
    />
</template>
