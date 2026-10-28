<script setup lang="ts">
// Vue
import { computed } from 'vue';

// Types
import type { Layer, ShapePreset } from '@/types/Layer';
import type { BaseControl } from '@/types/Control';

// Components
import BaseAccordion from '@/components/BaseAccordion.vue';
import BaseCheckBox from '@/components/BaseCheckBox.vue';
import BaseRangeSlider from '@/components/BaseRangeSlider.vue';
import BaseSegmented from '@/components/BaseSegmented.vue';
import LayerColorControl from '@/components/LayerColorControl.vue';
import LayerShapeControl from '@/components/LayerShapeControl.vue';

// Config
import { buildLayer } from '@/config/defaults';
import { layerRanges } from '@/config/ranges';
import { calcOpacityOptions, calcStrokeWidthOptions, shapeOptions } from '@/config/controlOptions';

const layer = defineModel<Layer>({ required: true });

type Control = BaseControl & { name: keyof Layer };

const percent = { scale: 100, unit: '%' };

const repetitionControls: Control[] = [
    { ...layerRanges.amount, label: 'Amount', name: 'amount' },
    { ...layerRanges.distance, label: 'Distance', name: 'distance' },
    { ...layerRanges.rotation, label: 'Rotation', name: 'rotation', unit: '°' },
    { ...layerRanges.rotationCx, label: 'Rotation center X', name: 'rotationCx', unit: 'px' },
    { ...layerRanges.rotationCy, label: 'Rotation center Y', name: 'rotationCy', unit: 'px' }
];

const positionControls: Control[] = [
    { ...layerRanges.cx, label: 'X', name: 'cx', unit: 'px' },
    { ...layerRanges.cy, label: 'Y', name: 'cy', unit: 'px' }
];

// one outline per preset, on a 20 unit square
const shapeIcons: Record<ShapePreset, string> = {
    rect: 'M4 4h12v12H4z',
    circle: 'M10 3a7 7 0 1 0 0 14a7 7 0 1 0 0-14z',
    polygon: 'M10 3.5l6.66 4.84-2.55 7.82H5.89L3.34 8.34z',
    custom: 'M3 15C6 3 9 17 12 9s4-5 5-4'
};

// reversing alone leaves the opacity as it is, so it waits for the fade
const fadeOptions = computed(() =>
    calcOpacityOptions.map((option) => ({
        ...option,
        disabled: option.value === 'flip' && !layer.value.calcOpacity.includes('interpolate')
    }))
);

const isStrokeRelevant = computed(() => layer.value.strokeOpacity > 0);

// a reset keeps what identifies the layer, and the path a custom shape is drawn from
function resetLayer() {
    const { id, name, visible, shape, path } = layer.value;

    Object.assign(layer.value, buildLayer(shape), { id, name, visible, path });
}
</script>

<template>
    <div class="flex flex-col">
        <!-- px-4 lines the header up with the collapse padding of the sections below -->
        <header class="flex flex-col gap-3 border-b border-base-300 px-4 py-4">
            <div class="flex items-center justify-between gap-2">
                <h2 class="truncate text-base font-semibold" v-text="layer.name" />
                <button type="button" class="btn btn-ghost btn-xs" @click="resetLayer">
                    Reset
                </button>
            </div>

            <BaseSegmented v-model="layer.shape" legend="Shape" :options="shapeOptions" hide-legend>
                <template #default="{ option }">
                    <svg
                        viewBox="0 0 20 20"
                        class="size-4 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >
                        <path :d="shapeIcons[option.value]" />
                    </svg>
                    {{ option.label }}
                </template>
            </BaseSegmented>

            <BaseRangeSlider
                v-model.number="layer.opacity"
                v-bind="{ ...layerRanges.opacity, ...percent }"
                label="Layer opacity"
            />
        </header>

        <BaseAccordion title="Shape" open>
            <LayerShapeControl v-model="layer" />
        </BaseAccordion>

        <BaseAccordion title="Repetition" open>
            <BaseRangeSlider
                v-for="ctrl in repetitionControls"
                :key="ctrl.name"
                v-model.number="layer[ctrl.name] as number"
                :min="ctrl.min"
                :max="ctrl.max"
                :step="ctrl.step"
                :label="ctrl.label"
                :unit="ctrl.unit"
            />
            <BaseCheckBox :options="fadeOptions" v-model="layer.calcOpacity" />
        </BaseAccordion>

        <BaseAccordion title="Position">
            <BaseRangeSlider
                v-for="ctrl in positionControls"
                :key="ctrl.name"
                v-model.number="layer[ctrl.name] as number"
                :min="ctrl.min"
                :max="ctrl.max"
                :step="ctrl.step"
                :label="ctrl.label"
                :unit="ctrl.unit"
            />
        </BaseAccordion>

        <BaseAccordion title="Color">
            <LayerColorControl v-model="layer" />
        </BaseAccordion>

        <BaseAccordion title="Fill">
            <BaseRangeSlider
                v-model.number="layer.fillOpacity"
                v-bind="{ ...layerRanges.fillOpacity, ...percent }"
                label="Fill opacity"
            />
        </BaseAccordion>

        <BaseAccordion title="Stroke">
            <BaseRangeSlider
                v-model.number="layer.strokeOpacity"
                v-bind="{ ...layerRanges.strokeOpacity, ...percent }"
                label="Stroke opacity"
            />
            <fieldset class="flex flex-col gap-3" :disabled="!isStrokeRelevant">
                <BaseRangeSlider
                    v-model.number="layer.strokeWidth"
                    v-bind="layerRanges.strokeWidth"
                    label="Stroke width"
                    unit="px"
                />
                <BaseCheckBox :options="calcStrokeWidthOptions" v-model="layer.calcStrokeWidth" />
            </fieldset>
            <p v-if="!isStrokeRelevant" class="text-xs text-base-content/70">
                Raise the stroke opacity to draw a stroke.
            </p>
        </BaseAccordion>
    </div>
</template>
