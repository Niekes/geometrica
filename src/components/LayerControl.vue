<script setup lang="ts">
// Vue
import { computed, ref, watch } from 'vue';

// Icons
import { LockClosedIcon, LockOpenIcon } from '@heroicons/vue/24/outline';

// Types
import type { Layer } from '@/types/Layer';
import type { BaseControl } from '@/types/Control';

// Components
import BaseRadioButton from '@/components/BaseRadioButton.vue';
import BaseCheckBox from '@/components/BaseCheckBox.vue';
import BaseRangeSlider from '@/components/BaseRangeSlider.vue';
import BaseAccordion from '@/components/BaseAccordion.vue';
import ColorInterpolator from '@/components/ColorInterpolator.vue';

// Lib
import { normalizePath } from '@/lib/pathBounds';

// Config
import { canvasHeight, canvasWidth } from '@/config/canvas';
import { buildLayer } from '@/config/defaults';
import {
    flipColorInterpolatorOptions,
    applyColorSchemeToEachShapeOptions,
    calcStrokeWidthOptions,
    calcOpacityOptions,
    shapeOptions,
    fillModeOptions,
    gradientTypeOptions
} from '@/config/controlOptions';

const props = defineProps<{
    layer: Layer;
}>();

type Control = BaseControl & { name: keyof Layer };

const defaults = computed<Layer>(() => buildLayer(props.layer.shape));

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

const opacityControls: Control[] = [
    {
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Layer Opacity',
        name: 'opacity',
        format: (d: number) => `${(d * 100).toFixed(0)}%`
    }
];

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

const isBorderRadiusLocked = ref(true);

watch(
    [
        () => props.layer.borderRadiusTl,
        () => props.layer.borderRadiusTr,
        () => props.layer.borderRadiusBl,
        () => props.layer.borderRadiusBr
    ],
    (newValues, oldValues) => {
        if (!isBorderRadiusLocked.value || props.layer.shape !== 'rect') return;

        const changedIndex = newValues.findIndex((val, i) => val !== oldValues[i]);

        if (changedIndex !== -1) {
            const newVal = newValues[changedIndex] ?? 0;

            props.layer.borderRadiusTl = newVal;
            props.layer.borderRadiusTr = newVal;
            props.layer.borderRadiusBl = newVal;
            props.layer.borderRadiusBr = newVal;
        }
    }
);

const isSizeLocked = ref(true);

watch([() => props.layer.width, () => props.layer.height], (newValues, oldValues) => {
    if (!isSizeLocked.value || props.layer.shape !== 'rect') return;

    const changedIndex = newValues.findIndex((val, i) => val !== oldValues[i]);

    if (changedIndex !== -1) {
        const newVal = newValues[changedIndex] ?? 0;

        props.layer.width = newVal;
        props.layer.height = newVal;
    }
});

watch([() => props.layer.radiusX, () => props.layer.radiusY], (newValues, oldValues) => {
    if (!isSizeLocked.value || props.layer.shape !== 'circle') return;

    const changedIndex = newValues.findIndex((val, i) => val !== oldValues[i]);

    if (changedIndex !== -1) {
        const newVal = newValues[changedIndex] ?? 0;

        props.layer.radiusX = newVal;
        props.layer.radiusY = newVal;
    }
});

const isStrokeRelevant = computed(
    () => props.layer.fillMode === 'stroke' || props.layer.fillMode === 'fillStroke'
);

const isGradientRelevant = computed(
    () => props.layer.applyColorSchemeToEachShape && props.layer.fillMode !== 'stroke'
);

const isCustomPathValid = computed(() => {
    if (props.layer.shape !== 'custom') return true;
    if (!props.layer.path) return false;

    return normalizePath(props.layer.path, props.layer.size) !== null;
});

const setColorInterPolator = (interpolator: { name: Layer['colorInterPolator'] }) => {
    props.layer.colorInterPolator = interpolator.name;
};

function resetFields(controls: Control[]) {
    controls.forEach((ctrl) => {
        (props.layer[ctrl.name] as number) = defaults.value[ctrl.name] as number;
    });
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <BaseRadioButton :options="shapeOptions" v-model="layer.shape" />
        <BaseRadioButton :options="fillModeOptions" v-model="layer.fillMode" />

        <BaseAccordion v-if="layer.shape === 'custom'">
            <template #title> Custom Shape </template>
            <template #content>
                <label class="text-xs font-semibold" for="custom-path">SVG Path</label>
                <textarea
                    id="custom-path"
                    v-model="layer.path"
                    class="textarea textarea-xs w-full font-mono"
                    rows="3"
                    placeholder="M0 0 L100 0 L100 100 L0 100 Z"
                />
                <p v-if="layer.path && !isCustomPathValid" class="text-xs text-error">
                    Invalid path data. Use SVG path syntax, e.g. M, L, C, Q, A, Z.
                </p>
                <p v-else-if="!layer.path" class="text-xs opacity-60">
                    Paste any SVG path data (d attribute).
                </p>
            </template>
        </BaseAccordion>

        <BaseAccordion>
            <template #title> General </template>
            <template #content>
                <BaseRangeSlider
                    v-for="ctrl in generalControls"
                    :key="ctrl.name"
                    v-model.number="layer[ctrl.name] as number"
                    :min="ctrl.min"
                    :max="ctrl.max"
                    :step="ctrl.step"
                    :label="ctrl.label"
                    :format="ctrl.format"
                />
            </template>
        </BaseAccordion>

        <BaseAccordion>
            <template #title> Size </template>
            <template #content>
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
                        :max="canvasWidth / 2"
                        :step="1"
                        label="Width"
                        :format="(d: number) => `${d}px`"
                    />
                    <BaseRangeSlider
                        v-model.number="layer.height"
                        :min="1"
                        :max="canvasHeight / 2"
                        :step="1"
                        label="Height"
                        :format="(d: number) => `${d}px`"
                    />
                </template>

                <template v-if="layer.shape === 'circle'">
                    <BaseRangeSlider
                        v-model.number="layer.radiusX"
                        :min="1"
                        :max="canvasWidth / 2"
                        :step="1"
                        label="Radius X"
                        :format="(d: number) => `${d}px`"
                    />
                    <BaseRangeSlider
                        v-model.number="layer.radiusY"
                        :min="1"
                        :max="canvasHeight / 2"
                        :step="1"
                        label="Radius Y"
                        :format="(d: number) => `${d}px`"
                    />
                </template>

                <template v-if="layer.shape === 'polygon'">
                    <BaseRangeSlider
                        v-model.number="layer.sides"
                        :min="3"
                        :max="32"
                        :step="1"
                        label="Sides"
                    />
                    <BaseRangeSlider
                        v-model.number="layer.size"
                        :min="1"
                        :max="canvasHeight / 2"
                        :step="1"
                        label="Size"
                        :format="(d: number) => `${d}px`"
                    />
                    <BaseRangeSlider
                        v-model.number="layer.borderRadius"
                        :min="0"
                        :max="1"
                        :step="0.01"
                        label="Border Radius"
                        :format="toBorderPercent"
                    />
                </template>

                <BaseRangeSlider
                    v-if="layer.shape === 'custom'"
                    v-model.number="layer.size"
                    :min="1"
                    :max="canvasHeight / 2"
                    :step="1"
                    label="Size"
                    :format="(d: number) => `${d}px`"
                />
            </template>
        </BaseAccordion>

        <BaseAccordion v-if="layer.shape === 'rect'">
            <template #title> Border Radius </template>
            <template #content>
                <button
                    class="btn btn-sm btn-square self-end"
                    @click="isBorderRadiusLocked = !isBorderRadiusLocked"
                >
                    <LockClosedIcon v-if="isBorderRadiusLocked" class="size-4" />
                    <LockOpenIcon v-if="!isBorderRadiusLocked" class="size-4" />
                </button>

                <BaseRangeSlider
                    v-for="ctrl in borderRadiusControls"
                    :key="ctrl.name"
                    v-model.number="layer[ctrl.name] as number"
                    :min="ctrl.min"
                    :max="ctrl.max"
                    :step="ctrl.step"
                    :label="ctrl.label"
                    :format="ctrl.format"
                />
            </template>
        </BaseAccordion>

        <BaseAccordion>
            <template #title> Fill &amp; Color </template>
            <template #content>
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
        </BaseAccordion>

        <BaseAccordion>
            <template #title> Stroke </template>
            <template #content>
                <fieldset class="flex flex-col gap-2" :disabled="!isStrokeRelevant">
                    <BaseRangeSlider
                        v-model.number="layer.strokeWidth"
                        :min="0.1"
                        :max="canvasWidth / 4"
                        :step="0.1"
                        label="Stroke Width"
                        :format="(d: number) => d.toFixed(1)"
                    />

                    <BaseCheckBox
                        :options="calcStrokeWidthOptions"
                        v-model="layer.calcStrokeWidth"
                    />
                </fieldset>
            </template>
        </BaseAccordion>

        <BaseAccordion>
            <template #title> Position </template>
            <template #content>
                <BaseRangeSlider
                    v-for="ctrl in positionControls"
                    :key="ctrl.name"
                    v-model.number="layer[ctrl.name] as number"
                    :min="ctrl.min"
                    :max="ctrl.max"
                    :step="ctrl.step"
                    :label="ctrl.label"
                    :format="ctrl.format"
                />
            </template>
        </BaseAccordion>

        <button
            class="btn btn-xs self-end"
            @click="
                resetFields(generalControls);
                resetFields(borderRadiusControls);
                resetFields(positionControls);
                resetFields(opacityControls);
                layer.strokeWidth = defaults.strokeWidth;
            "
        >
            Reset Layer
        </button>
    </div>
</template>
