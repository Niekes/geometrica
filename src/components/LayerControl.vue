<script setup lang="ts">
// Vue
import { computed, ref } from 'vue';

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
import LayerSizeControl from '@/components/LayerSizeControl.vue';
import LayerColorControl from '@/components/LayerColorControl.vue';

// Lib
import { normalizePath } from '@/lib/pathBounds';

// Config
import { surfaceSize } from '@/config/surface';
import { useLinkedSliders } from '@/composables/useLinkedSliders';
import { buildLayer } from '@/config/defaults';
import { calcStrokeWidthOptions, shapeOptions } from '@/config/controlOptions';

const layer = defineModel<Layer>({ required: true });

type Control = BaseControl & { name: keyof Layer };

const defaults = computed<Layer>(() => buildLayer(layer.value.shape));

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
        min: -surfaceSize / 2,
        max: surfaceSize / 2,
        step: 1,
        label: 'CX',
        name: 'cx',
        format: (d: number) => `${d}px`
    },
    {
        min: -surfaceSize / 2,
        max: surfaceSize / 2,
        step: 1,
        label: 'CY',
        name: 'cy',
        format: (d: number) => `${d}px`
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

useLinkedSliders(
    layer,
    ['borderRadiusTl', 'borderRadiusTr', 'borderRadiusBl', 'borderRadiusBr'],
    isBorderRadiusLocked,
    () => layer.value.shape === 'rect'
);

const isStrokeRelevant = computed(() => layer.value.strokeOpacity > 0);

const isCustomPathValid = computed(() => {
    if (layer.value.shape !== 'custom') return true;
    if (!layer.value.path) return false;

    return normalizePath(layer.value.path, layer.value.size) !== null;
});

function resetFields(controls: Control[]) {
    controls.forEach((ctrl) => {
        (layer.value[ctrl.name] as number) = defaults.value[ctrl.name] as number;
    });
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <BaseRadioButton :options="shapeOptions" v-model="layer.shape" />

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
                <LayerSizeControl v-model="layer" />
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
                <LayerColorControl v-model="layer" />
            </template>
        </BaseAccordion>

        <BaseAccordion>
            <template #title> Stroke </template>
            <template #content>
                <fieldset class="flex flex-col gap-2" :disabled="!isStrokeRelevant">
                    <BaseRangeSlider
                        v-model.number="layer.strokeWidth"
                        :min="0.1"
                        :max="surfaceSize / 2"
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
                layer.opacity = defaults.opacity;
                layer.fillOpacity = defaults.fillOpacity;
                layer.strokeOpacity = defaults.strokeOpacity;
                layer.strokeWidth = defaults.strokeWidth;
            "
        >
            Reset Layer
        </button>
    </div>
</template>
