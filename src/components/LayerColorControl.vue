<script setup lang="ts">
// Vue
import { computed } from 'vue';

// Components
import BaseCheckBox from '@/components/BaseCheckBox.vue';
import BaseRadioButton from '@/components/BaseRadioButton.vue';
import BaseRangeSlider from '@/components/BaseRangeSlider.vue';
import ColorInterpolator from '@/components/ColorInterpolator.vue';

// Types
import { type Layer } from '@/types/Layer';

// Config
import {
    flipColorInterpolatorOptions,
    applyColorSchemeToEachShapeOptions,
    calcOpacityOptions,
    gradientTypeOptions
} from '@/config/controlOptions';

const layer = defineModel<Layer>({ required: true });

const isGradientRelevant = computed(
    () => layer.value.applyColorSchemeToEachShape && layer.value.fillMode !== 'stroke'
);

const setColorInterPolator = (interpolator: { name: Layer['colorInterPolator'] }) => {
    layer.value.colorInterPolator = interpolator.name;
};
</script>

<template>
    <BaseRangeSlider
        v-model.number="layer.opacity"
        :min="0"
        :max="1"
        :step="0.01"
        label="Layer Opacity"
        :format="(d: number) => `${(d * 100).toFixed(0)}%`"
    />

    <BaseCheckBox :options="calcOpacityOptions" v-model="layer.calcOpacity" />

    <BaseRadioButton
        :options="applyColorSchemeToEachShapeOptions"
        v-model="layer.applyColorSchemeToEachShape"
    />

    <template v-if="isGradientRelevant">
        <BaseRadioButton :options="gradientTypeOptions" v-model="layer.gradientType" />
        <BaseRangeSlider
            v-if="layer.gradientType === 'linear'"
            v-model.number="layer.gradientAngle"
            :min="0"
            :max="360"
            :step="1"
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
