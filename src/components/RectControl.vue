<script setup lang="ts">
// Vue
import { ref, watch } from 'vue';
import { useCloned } from '@vueuse/core';

// Icons
import { LockClosedIcon, LockOpenIcon } from '@heroicons/vue/24/outline';

// Types
import { type Rect } from '@/types/Rect';
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
import {
    flipColorInterpolatorOptions,
    applyColorSchemeToEachShapeOptions,
    calcStrokeWidthOptions,
    calcOpacityOptions
} from '@/config/controlOptions';

const rect = defineModel<Rect>({ required: true });
const emits = defineEmits(['rect-update']);

const { cloned: clonedRect } = useCloned(rect.value);

type Control = BaseControl & { name: keyof Rect };

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

const resetGeneral = () => {
    generalControls.forEach((ctrl) => {
        (rect.value[ctrl.name] as number) = clonedRect.value[ctrl.name] as number;
    });
    triggerUpdate();
};

const isBorderRadiusLocked = ref(true);
const toBorderPercent = (d: number) => `${(d * 50).toFixed(1)}%`;
const borderRadiusControls: Control[] = [
    {
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Border Radius Top Left',
        name: 'borderRadiusTl',
        format: toBorderPercent
    },
    {
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Border Radius Top Right',
        name: 'borderRadiusTr',
        format: toBorderPercent
    },
    {
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Border Radius Bottom Left',
        name: 'borderRadiusBl',
        format: toBorderPercent
    },
    {
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Border Radius Bottom Right',
        name: 'borderRadiusBr',
        format: toBorderPercent
    }
];

watch(
    [
        () => rect.value.borderRadiusTl,
        () => rect.value.borderRadiusTr,
        () => rect.value.borderRadiusBl,
        () => rect.value.borderRadiusBr
    ],
    (newValues, oldValues) => {
        if (isBorderRadiusLocked.value) {
            const changedIndex = newValues.findIndex((val, i) => val !== oldValues[i]);
            if (changedIndex !== -1) {
                const newVal = newValues[changedIndex] ?? 0;
                rect.value.borderRadiusTl = newVal;
                rect.value.borderRadiusTr = newVal;
                rect.value.borderRadiusBl = newVal;
                rect.value.borderRadiusBr = newVal;
                triggerUpdate();
            }
        }
    },
    { deep: true }
);

const resetBorderRadius = () => {
    borderRadiusControls.forEach((ctrl) => {
        (rect.value[ctrl.name] as number) = clonedRect.value[ctrl.name] as number;
    });
    triggerUpdate();
};

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

const resetStroke = () => {
    strokeControls.forEach((ctrl) => {
        (rect.value[ctrl.name] as number) = clonedRect.value[ctrl.name] as number;
    });
    triggerUpdate();
};

const isSizeLocked = ref(true);
const sizeControls: Control[] = [
    {
        min: 1,
        max: canvasWidth / 2,
        step: 1,
        label: 'Width',
        name: 'width',
        format: (d: number) => `${d}px`
    },
    {
        min: 1,
        max: canvasHeight / 2,
        step: 1,
        label: 'Height',
        name: 'height',
        format: (d: number) => `${d}px`
    }
];

watch(
    [() => rect.value.width, () => rect.value.height],
    (newValues, oldValues) => {
        if (isSizeLocked.value) {
            const changedIndex = newValues.findIndex((val, i) => val !== oldValues[i]);
            if (changedIndex !== -1) {
                const newVal = newValues[changedIndex] ?? 0;
                rect.value.width = newVal;
                rect.value.height = newVal;
                triggerUpdate();
            }
        }
    },
    { deep: true }
);

const resetSize = () => {
    sizeControls.forEach((ctrl) => {
        (rect.value[ctrl.name] as number) = clonedRect.value[ctrl.name] as number;
    });
    triggerUpdate();
};

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

const resetPosition = () => {
    positionControls.forEach((ctrl) => {
        (rect.value[ctrl.name] as number) = clonedRect.value[ctrl.name] as number;
    });
    triggerUpdate();
};

const setColorInterPolator = (interpolator: { name: ColorInterPolator }) => {
    rect.value.colorInterPolator = interpolator.name;
    triggerUpdate();
};

const resetColor = () => {
    rect.value.applyColorSchemeToEachShape = clonedRect.value.applyColorSchemeToEachShape;
    rect.value.flipColorInterpolator = clonedRect.value.flipColorInterpolator;
    rect.value.colorInterPolator = clonedRect.value.colorInterPolator;
    rect.value.calcOpacity = clonedRect.value.calcOpacity;
};

const triggerUpdate = () => {
    emits('rect-update', rect.value);
};

watch(rect, () => emits('rect-update', rect.value), { deep: true });
</script>

<template>
    <div class="flex flex-col gap-4">
        <BaseAccordion>
            <template #title> General </template>
            <template #content>
                <BaseRangeSlider
                    v-for="ctrl in generalControls"
                    :key="ctrl.name"
                    @input="triggerUpdate"
                    v-model.number="rect[ctrl.name] as number"
                    :min="ctrl.min"
                    :max="ctrl.max"
                    :step="ctrl.step"
                    :label="ctrl.label"
                    :format="ctrl.format"
                />

                <button class="btn btn-xs mt-4 self-end" @click="resetGeneral">Reset</button>
            </template>
        </BaseAccordion>

        <BaseAccordion>
            <template #title> Border Radius </template>
            <template #content>
                <button
                    @click="isBorderRadiusLocked = !isBorderRadiusLocked"
                    class="btn btn-sm btn-square self-end"
                >
                    <LockClosedIcon v-if="isBorderRadiusLocked" class="size-4" />
                    <LockOpenIcon v-if="!isBorderRadiusLocked" class="size-4" />
                </button>

                <BaseRangeSlider
                    v-for="ctrl in borderRadiusControls"
                    :key="ctrl.name"
                    @input="triggerUpdate"
                    v-model.number="rect[ctrl.name] as number"
                    :min="ctrl.min"
                    :max="ctrl.max"
                    :step="ctrl.step"
                    :label="ctrl.label"
                    :format="ctrl.format"
                />

                <button class="btn btn-xs mt-4 self-end" @click="resetBorderRadius">Reset</button>
            </template>
        </BaseAccordion>

        <BaseAccordion>
            <template #title> Stroke </template>
            <template #content>
                <BaseRangeSlider
                    v-for="ctrl in strokeControls"
                    :key="ctrl.name"
                    @input="triggerUpdate"
                    v-model.number="rect[ctrl.name] as number"
                    :min="ctrl.min"
                    :max="ctrl.max"
                    :step="ctrl.step"
                    :label="ctrl.label"
                    :format="ctrl.format"
                />

                <BaseCheckBox
                    :options="calcStrokeWidthOptions"
                    v-model.number="rect.calcStrokeWidth"
                    @change="triggerUpdate"
                />

                <button class="btn btn-xs mt-4 self-end" @click="resetStroke">Reset</button>
            </template>
        </BaseAccordion>

        <BaseAccordion>
            <template #title> Color </template>
            <template #content>
                <BaseCheckBox
                    :options="calcOpacityOptions"
                    v-model.number="rect.calcOpacity"
                    @change="triggerUpdate"
                />
                <BaseRadioButton
                    :options="applyColorSchemeToEachShapeOptions"
                    v-model.number="rect.applyColorSchemeToEachShape"
                    @change="triggerUpdate"
                />
                <BaseRadioButton
                    :options="flipColorInterpolatorOptions"
                    v-model.number="rect.flipColorInterpolator"
                    @change="triggerUpdate"
                />
                <ColorInterpolator
                    :active="rect.colorInterPolator"
                    @update-color-interpolator="setColorInterPolator"
                />

                <button class="btn btn-xs mt-4 self-end" @click="resetColor">Reset</button>
            </template>
        </BaseAccordion>

        <BaseAccordion>
            <template #title> Size </template>
            <template #content>
                <button
                    @click="isSizeLocked = !isSizeLocked"
                    class="btn btn-sm btn-square self-end"
                >
                    <LockClosedIcon v-if="isSizeLocked" class="size-4" />
                    <LockOpenIcon v-if="!isSizeLocked" class="size-4" />
                </button>

                <BaseRangeSlider
                    v-for="ctrl in sizeControls"
                    :key="ctrl.name"
                    @input="triggerUpdate"
                    v-model.number="rect[ctrl.name] as number"
                    :min="ctrl.min"
                    :max="ctrl.max"
                    :step="ctrl.step"
                    :label="ctrl.label"
                    :format="ctrl.format"
                />

                <button class="btn btn-xs mt-4 self-end" @click="resetSize">Reset</button>
            </template>
        </BaseAccordion>

        <BaseAccordion>
            <template #title> Position </template>
            <template #content>
                <BaseRangeSlider
                    v-for="ctrl in positionControls"
                    :key="ctrl.name"
                    @input="triggerUpdate"
                    v-model.number="rect[ctrl.name] as number"
                    :min="ctrl.min"
                    :max="ctrl.max"
                    :step="ctrl.step"
                    :label="ctrl.label"
                    :format="ctrl.format"
                />

                <button class="btn btn-xs mt-4 self-end" @click="resetPosition">Reset</button>
            </template>
        </BaseAccordion>
    </div>
</template>
