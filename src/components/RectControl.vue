<script setup lang="ts">
import { NiekesInputRange, NiekesInputRadio, NiekesInputCheckbox } from '@niekes/lib';
import { type Rect } from '../types/Rect';
import { defineProps, defineEmits } from 'vue';
import ColorInterpolator from '../components/ColorInterpolator.vue';

const emits = defineEmits(['rect-update']);

const props = defineProps<{
    rect: Rect;
}>();

const generalControls = [
    { value: props.rect.amount, min: 2, max: 1000, step: 1, label: 'Amount' },
    { value: props.rect.distance, min: -64, max: 64, step: 0.1, label: 'Distance' },
    { value: props.rect.rotation, min: -1440, max: 1440, step: 1, label: 'Rotation' }
];

const borderRadiusControls = [
    { value: props.rect.borderRadiusTl, min: 0, max: 1, step: 0.01, label: 'borderRadiusTl' },
    { value: props.rect.borderRadiusTr, min: 0, max: 1, step: 0.01, label: 'borderRadiusTr' },
    { value: props.rect.borderRadiusBl, min: 0, max: 1, step: 0.01, label: 'borderRadiusBl' },
    { value: props.rect.borderRadiusBr, min: 0, max: 1, step: 0.01, label: 'borderRadiusBr' }
];

const strokeOptions = [
    { value: true, label: 'Stroke' },
    { value: false, label: 'Fill' }
];

const strokeControls = [
    { value: props.rect.strokeWidth, min: 1, max: 30, step: 0.1, label: 'strokeWidth' }
];

const calcStrokeWidthOptions = [
    { value: 'interpolate', label: 'Interpolate' },
    { value: 'flip', label: 'Flip' }
];

const calcOpacityOptions = [
    { value: 'interpolate', label: 'Interpolate' },
    { value: 'flip', label: 'Flip' }
];

const applyColorSchemeToEachShapeOptions = [
    {
        value: true,
        label: 'applyColorSchemeToEachRectangle'
    },
    {
        value: false,
        label: 'interpolateColorScheme'
    }
];

const flipColorInterpolatorOptions = [
    {
        value: true,
        label: 'flipColorInterpolatorOptions'
    },
    {
        value: false,
        label: 'dontflipColorInterpolatorOptions'
    }
];

const sizeControls = [
    { value: props.rect.width, min: 1, max: 512, step: 1, label: 'Width' },
    { value: props.rect.height, min: 1, max: 512, step: 1, label: 'Height' }
];

const positionControls = [
    { value: props.rect.cx, min: -256, max: 256, step: 1, label: 'Cx' },
    { value: props.rect.cy, min: -256, max: 256, step: 1, label: 'Cy' }
];

function setColorInterPolator(interpolator: any) {
    triggerUpdate({
        detail: { name: 'colorInterPolator', value: interpolator.name }
    } as CustomEvent);
}

function triggerUpdate(event: CustomEvent<{ name: string; value: any }>) {
    emits('rect-update', { detail: event.detail });
}
</script>

<template>
    <div class="rect-control">
        <div class="general-control">
            <niekes-input-range
                v-for="generalControl in generalControls"
                :key="generalControl.label"
                :min="generalControl.min"
                :max="generalControl.max"
                :label="generalControl.label"
                :name="generalControl.label.toLowerCase()"
                :value="generalControl.value"
                :step="generalControl.step"
                @change="triggerUpdate"
            />

            <niekes-input-radio
                :value="props.rect.stroke"
                :name="'stroke'"
                :options="strokeOptions"
                @change="triggerUpdate"
            />
        </div>
        <div class="border-radius-control">
            <niekes-input-range
                v-for="borderRadiusControl in borderRadiusControls"
                :key="borderRadiusControl.label"
                :min="borderRadiusControl.min"
                :max="borderRadiusControl.max"
                :label="borderRadiusControl.label"
                :name="borderRadiusControl.label"
                :value="borderRadiusControl.value"
                :step="borderRadiusControl.step"
                @change="triggerUpdate"
            />
        </div>
        <div class="stroke-control">
            <niekes-input-range
                v-for="strokeControl in strokeControls"
                :key="strokeControl.label"
                :min="strokeControl.min"
                :max="strokeControl.max"
                :label="strokeControl.label"
                :name="strokeControl.label"
                :value="strokeControl.value"
                :step="strokeControl.step"
                @change="triggerUpdate"
            />

            <span>Calc Stroke</span>

            <niekes-input-checkbox
                :options="calcStrokeWidthOptions"
                :name="'calcStrokeWidth'"
                :value="props.rect.calcStrokeWidth"
                @change="triggerUpdate"
            />
        </div>
        <div class="color-control">
            <span>Calc Opacity</span>

            <niekes-input-checkbox
                :options="calcOpacityOptions"
                :name="'calcOpacity'"
                :value="props.rect.calcOpacity"
                @change="triggerUpdate"
            />

            <niekes-input-radio
                :options="applyColorSchemeToEachShapeOptions"
                :name="'applyColorSchemeToEachShape'"
                :value="props.rect.applyColorSchemeToEachShape"
                @change="triggerUpdate"
            />

            <niekes-input-radio
                :options="flipColorInterpolatorOptions"
                :name="'flipColorInterpolator'"
                :value="props.rect.flipColorInterpolator"
                @change="triggerUpdate"
            />

            <ColorInterpolator
                :active="props.rect.colorInterPolator"
                @update-color-interpolator="setColorInterPolator"
            />
        </div>
        <div class="size-control">
            <span>Size</span>

            <niekes-input-range
                v-for="sizeControl in sizeControls"
                :key="sizeControl.label"
                :min="sizeControl.min"
                :max="sizeControl.max"
                :label="sizeControl.label"
                :name="sizeControl.label.toLowerCase()"
                :value="sizeControl.value"
                :step="sizeControl.step"
                @change="triggerUpdate"
            />
        </div>
        <div class="position-control">
            <span>Position</span>

            <niekes-input-range
                v-for="positionControl in positionControls"
                :key="positionControl.label"
                :min="positionControl.min"
                :max="positionControl.max"
                :label="positionControl.label"
                :name="positionControl.label.toLowerCase()"
                :value="positionControl.value"
                :step="positionControl.step"
                @change="triggerUpdate"
            />
        </div>
    </div>
</template>

<style scoped>
.rect-control {
    display: flex;
    flex-direction: column;
    padding: var(--niekes-spacing-md);
}
</style>
../interfaces/Rect ../types/rect
