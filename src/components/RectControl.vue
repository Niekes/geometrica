<script setup lang="ts">
import { type Rect } from '../types/Rect';
import ColorInterpolator from '../components/ColorInterpolator.vue';
import { canvasHeight, canvasWidth } from '../config/canvas';
import {
    flipColorInterpolatorOptions,
    applyColorSchemeToEachShapeOptions,
    calcStrokeWidthOptions,
    calcOpacityOptions
} from '../config/controlOptions';

const emits = defineEmits(['rect-update']);

const props = defineProps<{
    rect: Rect;
    initRect: Rect;
}>();

const generalControls = [
    { value: props.rect.amount, min: 1, max: 1000, step: 1, label: 'Amount', name: 'amount' },
    {
        value: props.rect.distance,
        min: -64,
        max: 64,
        step: 0.1,
        label: 'Distance',
        name: 'distance'
    },
    {
        value: props.rect.rotation,
        min: -1440,
        max: 1440,
        step: 1,
        label: 'Rotation',
        name: 'rotation'
    }
];

const borderRadiusControls = [
    {
        value: props.rect.borderRadiusTl,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Border Radius Top Left',
        name: 'borderRadiusTl'
    },
    {
        value: props.rect.borderRadiusTr,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Border Radius Top Right',
        name: 'borderRadiusTr'
    },
    {
        value: props.rect.borderRadiusBl,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Border Radius Bottom Left',
        name: 'borderRadiusBl'
    },
    {
        value: props.rect.borderRadiusBr,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Border Radius Bottom Right',
        name: 'borderRadiusBr'
    }
];

const strokeControls = [
    {
        value: props.rect.strokeWidth,
        min: 0.1,
        max: canvasWidth / 4,
        step: 0.1,
        label: 'Stroke Width',
        name: 'strokeWidth'
    }
];

const sizeControls = [
    { value: props.rect.width, min: 1, max: canvasWidth / 2, step: 1, label: 'Width' },
    { value: props.rect.height, min: 1, max: canvasHeight / 2, step: 1, label: 'Height' }
];

const positionControls = [
    { value: props.rect.cx, min: -canvasWidth / 4, max: canvasWidth / 4, step: 1, label: 'Cx' },
    { value: props.rect.cy, min: -canvasHeight / 4, max: canvasHeight / 4, step: 1, label: 'Cy' }
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
            <niekes-toggle>
                <div slot="caption">General</div>
                <div slot="content">
                    <niekes-input-range
                        v-for="generalControl in generalControls"
                        :key="generalControl.label"
                        :min="generalControl.min"
                        :max="generalControl.max"
                        :label="generalControl.label"
                        :name="generalControl.name"
                        :value="generalControl.value"
                        :step="generalControl.step"
                        @change="triggerUpdate"
                    />
                </div>
            </niekes-toggle>
        </div>
        <div class="border-radius-control">
            <niekes-toggle>
                <div slot="caption">Border Radius</div>
                <div slot="content">
                    <niekes-input-range
                        v-for="borderRadiusControl in borderRadiusControls"
                        :key="borderRadiusControl.label"
                        :min="borderRadiusControl.min"
                        :max="borderRadiusControl.max"
                        :label="borderRadiusControl.label"
                        :name="borderRadiusControl.name"
                        :value="borderRadiusControl.value"
                        :step="borderRadiusControl.step"
                        @change="triggerUpdate"
                    />
                </div>
            </niekes-toggle>
        </div>
        <div class="stroke-control">
            <niekes-toggle>
                <div slot="caption">Stroke</div>
                <div slot="content">
                    <niekes-input-range
                        v-for="strokeControl in strokeControls"
                        :key="strokeControl.label"
                        :min="strokeControl.min"
                        :max="strokeControl.max"
                        :label="strokeControl.label"
                        :name="strokeControl.name"
                        :value="strokeControl.value"
                        :step="strokeControl.step"
                        @change="triggerUpdate"
                    />

                    <niekes-input-checkbox
                        :options="calcStrokeWidthOptions"
                        :name="'calcStrokeWidth'"
                        :value="props.rect.calcStrokeWidth"
                        @change="triggerUpdate"
                    />
                </div>
            </niekes-toggle>
        </div>
        <div class="color-control">
            <niekes-toggle>
                <div slot="caption">Color</div>
                <div slot="content">
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
            </niekes-toggle>
        </div>
        <div class="size-control">
            <niekes-toggle>
                <div slot="caption">Size</div>
                <div slot="content">
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
            </niekes-toggle>
        </div>
        <div class="position-control">
            <niekes-toggle>
                <div slot="caption">Position</div>
                <div slot="content">
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
            </niekes-toggle>
        </div>
    </div>
</template>

<style scoped>
.rect-control {
    display: flex;
    flex-direction: column;
}

.rect-control > * {
    margin-top: var(--niekes-spacing-sm);
}

.rect-control > *:last-child {
    margin-bottom: var(--niekes-spacing-sm);
}
</style>
