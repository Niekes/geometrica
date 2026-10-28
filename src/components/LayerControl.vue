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
import LayerPathControl from '@/components/LayerPathControl.vue';

// Config
import { useLinkedSliders } from '@/composables/useLinkedSliders';
import { buildLayer } from '@/config/defaults';
import { layerRanges } from '@/config/ranges';
import { calcStrokeWidthOptions, shapeOptions } from '@/config/controlOptions';

const layer = defineModel<Layer>({ required: true });

type Control = BaseControl & { name: keyof Layer };

const defaults = computed<Layer>(() => buildLayer(layer.value.shape));

const generalControls: Control[] = [
    {
        ...layerRanges.amount,
        label: 'Amount',
        name: 'amount'
    },
    {
        ...layerRanges.distance,
        label: 'Distance',
        name: 'distance',
        format: (d: number) => d.toFixed(1)
    },
    {
        ...layerRanges.rotation,
        label: 'Rotation',
        name: 'rotation',
        format: (d: number) => `${d}°`
    }
];

const positionControls: Control[] = [
    {
        ...layerRanges.cx,
        label: 'CX',
        name: 'cx',
        format: (d: number) => `${d}px`
    },
    {
        ...layerRanges.cy,
        label: 'CY',
        name: 'cy',
        format: (d: number) => `${d}px`
    },
    {
        ...layerRanges.rotationCx,
        label: 'Rotation CX',
        name: 'rotationCx',
        format: (d: number) => `${d}px`
    },
    {
        ...layerRanges.rotationCy,
        label: 'Rotation CY',
        name: 'rotationCy',
        format: (d: number) => `${d}px`
    }
];

const toBorderPercent = (d: number) => `${(d * 50).toFixed(1)}%`;

const borderRadiusControls: Control[] = [
    {
        ...layerRanges.borderRadiusTl,
        label: 'Border Radius Top Left',
        name: 'borderRadiusTl',
        format: toBorderPercent
    },
    {
        ...layerRanges.borderRadiusTr,
        label: 'Border Radius Top Right',
        name: 'borderRadiusTr',
        format: toBorderPercent
    },
    {
        ...layerRanges.borderRadiusBl,
        label: 'Border Radius Bottom Left',
        name: 'borderRadiusBl',
        format: toBorderPercent
    },
    {
        ...layerRanges.borderRadiusBr,
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
                <LayerPathControl v-model="layer" />
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
                        v-bind="layerRanges.strokeWidth"
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
