<script setup lang="ts">
// Vue
import { ref, watch } from 'vue';
import { useCloned } from '@vueuse/core';

// Icons
import { LockClosedIcon, LockOpenIcon } from '@heroicons/vue/24/outline';

// Types
import type { Circle } from '@/types/Circle';
import type { BaseControl } from '@/types/Control';
import type { ColorInterPolator } from '@/types/ColorInterPolators';

// Components
import BaseRadioButton from '@/components/BaseRadioButton.vue';
import BaseCheckBox from '@/components/BaseCheckBox.vue';
import BaseRangeSlider from '@/components/BaseRangeSlider.vue';
import BaseAccordion from '@/components/BaseAccordion.vue';
import ColorInterpolator from '@/components/ColorInterpolator.vue';

// Config
import { canvasHeight, canvasWidth } from '@/config/canvas';
import { defaultCircle } from '@/config/defaults';
import {
    flipColorInterpolatorOptions,
    applyColorSchemeToEachShapeOptions,
    calcStrokeWidthOptions,
    calcOpacityOptions
} from '@/config/controlOptions';

const circle = defineModel<Circle>({ required: true });
const emits = defineEmits(['circle-update']);

type Control = BaseControl & { name: keyof Circle };

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
        max: 512,
        step: 0.1,
        label: 'Stroke Width',
        name: 'strokeWidth',
        format: (d: number) => d.toFixed(1)
    }
];

const isRadiusLocked = ref(true);
const radiusControls: Control[] = [
    {
        min: 1,
        max: canvasWidth / 2,
        step: 1,
        label: 'Radius X',
        name: 'radiusX',
        format: (d: number) => `${d}px`
    },
    {
        min: 1,
        max: canvasHeight / 2,
        step: 1,
        label: 'Radius Y',
        name: 'radiusY',
        format: (d: number) => `${d}px`
    }
];

watch(
    [() => circle.value.radiusX, () => circle.value.radiusY],
    (newValues, oldValues) => {
        if (isRadiusLocked.value) {
            const changedIndex = newValues.findIndex((val, i) => val !== oldValues[i]);
            if (changedIndex !== -1) {
                const newVal = newValues[changedIndex] ?? 0;
                circle.value.radiusX = newVal;
                circle.value.radiusY = newVal;
                triggerUpdate();
            }
        }
    },
    { deep: true }
);

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
    circle.value.colorInterPolator = interpolator.name;
    triggerUpdate();
};

const resetColor = () => {
    circle.value.applyColorSchemeToEachShape = defaultCircle.applyColorSchemeToEachShape;
    circle.value.flipColorInterpolator = defaultCircle.flipColorInterpolator;
    circle.value.colorInterPolator = defaultCircle.colorInterPolator;
    circle.value.calcOpacity = defaultCircle.calcOpacity;
};

const resetGeneral = () => {
    generalControls.forEach(
        (ctrl) => ((circle.value[ctrl.name] as number) = defaultCircle[ctrl.name] as number)
    );
    triggerUpdate();
};

const resetStroke = () => {
    strokeControls.forEach(
        (ctrl) => ((circle.value[ctrl.name] as number) = defaultCircle[ctrl.name] as number)
    );
    triggerUpdate();
};

const resetRadius = () => {
    radiusControls.forEach(
        (ctrl) => ((circle.value[ctrl.name] as number) = defaultCircle[ctrl.name] as number)
    );
    triggerUpdate();
};

const resetPosition = () => {
    positionControls.forEach(
        (ctrl) => ((circle.value[ctrl.name] as number) = defaultCircle[ctrl.name] as number)
    );
    triggerUpdate();
};

const triggerUpdate = () => {
    emits('circle-update', circle.value);
};

watch(circle, () => emits('circle-update', circle.value), { deep: true });
</script>

<template>
    <div class="flex flex-col gap-4">
        <BaseAccordion>
            <template #title>General</template>
            <template #content>
                <BaseRangeSlider
                    v-for="ctrl in generalControls"
                    :key="ctrl.name"
                    v-model.number="circle[ctrl.name] as number"
                    :min="ctrl.min"
                    :max="ctrl.max"
                    :step="ctrl.step"
                    :label="ctrl.label"
                    @input="triggerUpdate"
                    :format="ctrl.format"
                />
                <button class="btn btn-xs mt-4 self-end" @click="resetGeneral">Reset</button>
            </template>
        </BaseAccordion>

        <BaseAccordion>
            <template #title>Stroke</template>
            <template #content>
                <BaseRangeSlider
                    v-for="ctrl in strokeControls"
                    :key="ctrl.name"
                    v-model.number="circle[ctrl.name] as number"
                    :min="ctrl.min"
                    :max="ctrl.max"
                    :step="ctrl.step"
                    :label="ctrl.label"
                    :format="ctrl.format"
                    @input="triggerUpdate"
                />
                <BaseCheckBox
                    :options="calcStrokeWidthOptions"
                    v-model.number="circle.calcStrokeWidth"
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
                    v-model.number="circle.calcOpacity"
                    @change="triggerUpdate"
                />
                <BaseRadioButton
                    :options="applyColorSchemeToEachShapeOptions"
                    v-model.number="circle.applyColorSchemeToEachShape"
                    @change="triggerUpdate"
                />
                <BaseRadioButton
                    :options="flipColorInterpolatorOptions"
                    v-model.number="circle.flipColorInterpolator"
                    @change="triggerUpdate"
                />
                <ColorInterpolator
                    :active="circle.colorInterPolator"
                    @update-color-interpolator="setColorInterPolator"
                />
                <button class="btn btn-xs mt-4 self-end" @click="resetColor">Reset</button>
            </template>
        </BaseAccordion>

        <BaseAccordion>
            <template #title>Radius</template>
            <template #content>
                <button
                    @click="isRadiusLocked = !isRadiusLocked"
                    class="btn btn-square self-end btn-sm"
                >
                    <LockClosedIcon v-if="isRadiusLocked" class="size-4" />
                    <LockOpenIcon v-if="!isRadiusLocked" class="size-4" />
                </button>

                <BaseRangeSlider
                    v-for="ctrl in radiusControls"
                    :key="ctrl.name"
                    v-model.number="circle[ctrl.name] as number"
                    :min="ctrl.min"
                    :max="ctrl.max"
                    :step="ctrl.step"
                    :label="ctrl.label"
                    :format="ctrl.format"
                    @input="triggerUpdate"
                />
                <button class="btn btn-xs mt-4 self-end" @click="resetRadius">Reset</button>
            </template>
        </BaseAccordion>

        <BaseAccordion>
            <template #title>Position</template>
            <template #content>
                <BaseRangeSlider
                    v-for="ctrl in positionControls"
                    :key="ctrl.name"
                    v-model.number="circle[ctrl.name] as number"
                    :min="ctrl.min"
                    :max="ctrl.max"
                    :step="ctrl.step"
                    :label="ctrl.label"
                    :format="ctrl.format"
                    @input="triggerUpdate"
                />
                <button class="btn btn-xs mt-4 self-end" @click="resetPosition">Reset</button>
            </template>
        </BaseAccordion>
    </div>
</template>
