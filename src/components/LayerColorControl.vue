<script setup lang="ts">
// Components
import BaseRangeSlider from '@/components/BaseRangeSlider.vue';
import BaseSegmented from '@/components/BaseSegmented.vue';
import ColorInterpolator from '@/components/ColorInterpolator.vue';

// Types
import { type Layer } from '@/types/Layer';

// Config
import { colorModeOptions, gradientTypeOptions } from '@/config/controlOptions';
import { layerRanges } from '@/config/ranges';

const layer = defineModel<Layer>({ required: true });
</script>

<template>
    <ColorInterpolator v-model="layer.colorInterPolator" />

    <label class="flex cursor-pointer items-center justify-between text-xs">
        Reverse colors
        <input v-model="layer.flipColorInterpolator" type="checkbox" class="toggle toggle-sm" />
    </label>

    <BaseSegmented
        v-model="layer.applyColorSchemeToEachShape"
        legend="Spread the ramp"
        :options="colorModeOptions"
    />

    <template v-if="layer.applyColorSchemeToEachShape">
        <BaseSegmented
            v-model="layer.gradientType"
            legend="Gradient"
            :options="gradientTypeOptions"
        />
        <BaseRangeSlider
            v-if="layer.gradientType === 'linear'"
            v-model.number="layer.gradientAngle"
            v-bind="layerRanges.gradientAngle"
            label="Gradient angle"
            unit="°"
        />
    </template>
</template>
