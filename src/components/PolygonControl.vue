<script setup lang="ts">
// Vue
import { ref, watch } from 'vue';
import { useCloned } from '@vueuse/core';

// Types
import type { Polygon } from '@/types/Polygon';
import type { ColorInterPolator } from '@/types/ColorInterPolators';
import type { BaseControl } from '@/types/Control';

// Components
import BaseRadioButton from '@/components/BaseRadioButton.vue';
import BaseCheckBox from '@/components/BaseCheckBox.vue';
import BaseRangeSlider from '@/components/BaseRangeSlider.vue';
import BaseAccordion from '@/components/BaseAccordion.vue';
import ColorInterpolator from '@/components/ColorInterpolator.vue';

// Config
import { canvasHeight, canvasWidth } from '@/config/canvas';
import { defaultPolygon } from '@/config/defaults';
import {
    flipColorInterpolatorOptions,
    applyColorSchemeToEachShapeOptions,
    calcStrokeWidthOptions,
    calcOpacityOptions
} from '@/config/controlOptions';

const polygon = defineModel<Polygon>({ required: true });
const emits = defineEmits(['polygon-update']);

type Control = BaseControl & {
    name: keyof Polygon;
};

const generalControls: Control[] = [
    {
        min: 1,
        max: 1000,
        step: 1,
        label: 'Amount',
        name: 'amount'
    },
    {
        min: -64,
        max: 64,
        step: 0.1,
        label: 'Distance',
        name: 'distance',
        format: (d: number) => d.toFixed(1)
    },
    {
        min: -1440,
        max: 1440,
        step: 1,
        label: 'Rotation',
        name: 'rotation',
        format: (d: number) => `${d}°`
    }
];

const strokeControls: Control[] = [
    {
        min: 0.1,
        max: canvasWidth / 4,
        step: 0.1,
        label: 'Stroke Width',
        name: 'strokeWidth',
        format: (d: number) => d.toFixed(1)
    }
];

const sidesControl: Control = { min: 3, max: 20, step: 1, label: 'Sides', name: 'sides' };

const sizeControls: Control[] = [
    {
        min: 0,
        max: canvasWidth / 2,
        step: 1,
        label: 'Size',
        name: 'size',
        format: (d: number) => `${d}px`
    }
];

const borderRadiusControls: Control[] = [
    {
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Border Radius',
        name: 'borderRadius',
        format: (d: number) => `${(d * 50).toFixed(1)}%`
    }
];

const positionControls: Control[] = [
    {
        min: -canvasWidth / 4,
        max: canvasWidth / 4,
        step: 1,
        label: 'CX',
        name: 'cx',
        format: (d: number) => `${d}px`
    },
    {
        min: -canvasHeight / 4,
        max: canvasHeight / 4,
        step: 1,
        label: 'CY',
        name: 'cy',
        format: (d: number) => `${d}px`
    }
];

const setColorInterPolator = (interpolator: { name: ColorInterPolator }) => {
    polygon.value.colorInterPolator = interpolator.name;
    triggerUpdate();
};

const resetColor = () => {
    polygon.value.applyColorSchemeToEachShape = defaultPolygon.applyColorSchemeToEachShape;
    polygon.value.flipColorInterpolator = defaultPolygon.flipColorInterpolator;
    polygon.value.colorInterPolator = defaultPolygon.colorInterPolator;
    polygon.value.calcOpacity = defaultPolygon.calcOpacity;
};

const resetGeneral = () => {
    generalControls.forEach(
        (ctrl) => ((polygon.value[ctrl.name] as number) = defaultPolygon[ctrl.name] as number)
    );
    triggerUpdate();
};

const resetStroke = () => {
    strokeControls.forEach(
        (ctrl) => ((polygon.value[ctrl.name] as number) = defaultPolygon[ctrl.name] as number)
    );
    triggerUpdate();
};

const resetSize = () => {
    sizeControls.forEach(
        (ctrl) => ((polygon.value[ctrl.name] as number) = defaultPolygon[ctrl.name] as number)
    );
    triggerUpdate();
};

const resetBorderRadius = () => {
    borderRadiusControls.forEach(
        (ctrl) => ((polygon.value[ctrl.name] as number) = defaultPolygon[ctrl.name] as number)
    );
    triggerUpdate();
};

const resetPosition = () => {
    positionControls.forEach(
        (ctrl) => ((polygon.value[ctrl.name] as number) = defaultPolygon[ctrl.name] as number)
    );
    triggerUpdate();
};

const triggerUpdate = () => {
    emits('polygon-update', polygon.value);
};

watch(polygon, () => emits('polygon-update', polygon.value), { deep: true });
</script>

<template>
    <div class="flex flex-col gap-4">
        <BaseAccordion>
            <template #title>General</template>
            <template #content>
                <BaseRangeSlider
                    v-for="ctrl in generalControls"
                    :key="ctrl.name"
                    v-model.number="polygon[ctrl.name] as number"
                    :min="ctrl.min"
                    :max="ctrl.max"
                    :step="ctrl.step"
                    :label="ctrl.label"
                    :format="ctrl.format"
                    @input="triggerUpdate"
                />
                <button class="btn btn-xs mt-4 self-end" @click="resetGeneral">Reset</button>
            </template>
        </BaseAccordion>

        <BaseAccordion>
            <template #title>Border Radius</template>
            <template #content>
                <BaseRangeSlider
                    v-for="ctrl in borderRadiusControls"
                    :key="ctrl.name"
                    v-model.number="polygon[ctrl.name] as number"
                    :min="ctrl.min"
                    :max="ctrl.max"
                    :step="ctrl.step"
                    :label="ctrl.label"
                    :format="ctrl.format"
                    @input="triggerUpdate"
                />
                <button class="btn btn-xs mt-4 self-end" @click="resetBorderRadius">Reset</button>
            </template>
        </BaseAccordion>

        <BaseAccordion>
            <template #title>Stroke</template>
            <template #content>
                <BaseRangeSlider
                    v-for="ctrl in strokeControls"
                    :key="ctrl.name"
                    v-model.number="polygon[ctrl.name] as number"
                    :min="ctrl.min"
                    :max="ctrl.max"
                    :step="ctrl.step"
                    :label="ctrl.label"
                    :format="ctrl.format"
                    @input="triggerUpdate"
                />
                <BaseCheckBox
                    :options="calcStrokeWidthOptions"
                    v-model.number="polygon.calcStrokeWidth"
                    @change="triggerUpdate"
                />
                <button class="btn btn-xs mt-4 self-end" @click="resetStroke">Reset</button>
            </template>
        </BaseAccordion>

        <BaseAccordion>
            <template #title>Color</template>
            <template #content>
                <BaseCheckBox
                    :options="calcOpacityOptions"
                    v-model.number="polygon.calcOpacity"
                    @change="triggerUpdate"
                />
                <BaseRadioButton
                    :options="applyColorSchemeToEachShapeOptions"
                    v-model.number="polygon.applyColorSchemeToEachShape"
                    @change="triggerUpdate"
                />
                <BaseRadioButton
                    :options="flipColorInterpolatorOptions"
                    v-model.number="polygon.flipColorInterpolator"
                    @change="triggerUpdate"
                />
                <ColorInterpolator
                    :active="polygon.colorInterPolator"
                    @update-color-interpolator="setColorInterPolator"
                />
                <button class="btn btn-xs mt-4 self-end" @click="resetColor">Reset</button>
            </template>
        </BaseAccordion>

        <BaseAccordion>
            <template #title>Sides</template>
            <template #content>
                <BaseRangeSlider
                    v-model.number="polygon.sides as number"
                    :min="sidesControl.min"
                    :max="sidesControl.max"
                    :step="sidesControl.step"
                    :label="sidesControl.label"
                    :format="sidesControl.format"
                    @input="triggerUpdate"
                />
            </template>
        </BaseAccordion>

        <BaseAccordion>
            <template #title>Size</template>
            <template #content>
                <BaseRangeSlider
                    v-for="ctrl in sizeControls"
                    :key="ctrl.name"
                    v-model.number="polygon[ctrl.name] as number"
                    :min="ctrl.min"
                    :max="ctrl.max"
                    :step="ctrl.step"
                    :label="ctrl.label"
                    :format="ctrl.format"
                    @input="triggerUpdate"
                />
                <button class="btn btn-xs mt-4 self-end" @click="resetSize">Reset</button>
            </template>
        </BaseAccordion>

        <BaseAccordion>
            <template #title>Position</template>
            <template #content>
                <BaseRangeSlider
                    v-for="ctrl in positionControls"
                    :key="ctrl.name"
                    v-model.number="polygon[ctrl.name] as number"
                    :min="ctrl.min"
                    :max="ctrl.max"
                    :step="ctrl.step"
                    :label="ctrl.label"
                    @input="triggerUpdate"
                />
                <button class="btn btn-xs mt-4 self-end" @click="resetPosition">Reset</button>
            </template>
        </BaseAccordion>
    </div>
</template>
