<script setup lang="ts">
import { NiekesInputRange, NiekesInputRadio, NiekesInputCheckbox, NiekesToggle } from '@niekes/lib';
import { type Circle } from '../types/Circle';
import ColorInterpolator from '../components/ColorInterpolator.vue';
import { canvasHeight, canvasWidth } from '../config/canvas';
import {
    flipColorInterpolatorOptions,
    applyColorSchemeToEachShapeOptions,
    calcStrokeWidthOptions,
    calcOpacityOptions
} from '../config/controlOptions';

const emits = defineEmits(['circle-update']);

const props = defineProps<{
    circle: Circle;
    initCircle: Circle;
}>();

const generalControls = [
    { value: props.circle.amount, min: 1, max: 1000, step: 1, label: 'Amount' },
    { value: props.circle.distance, min: -256, max: 256, step: 0.1, label: 'Distance' },
    { value: props.circle.rotation, min: -1440, max: 1440, step: 1, label: 'Rotation' }
];

const strokeControls = [
    { value: props.circle.strokeWidth, min: 0.1, max: 512, step: 0.1, label: 'strokeWidth' }
];

const radiusControls = [
    { value: props.circle.radiusX, min: 1, max: canvasWidth / 2, step: 1, label: 'radiusX' },
    { value: props.circle.radiusY, min: 1, max: canvasHeight / 2, step: 1, label: 'radiusY' }
];

const positionControls = [
    { value: props.circle.cx, min: -canvasWidth / 4, max: canvasWidth / 4, step: 1, label: 'Cx' },
    { value: props.circle.cy, min: -canvasWidth / 4, max: canvasHeight / 4, step: 1, label: 'Cy' }
];

function setColorInterPolator(interpolator: any) {
    triggerUpdate({
        detail: { name: 'colorInterPolator', value: interpolator.name }
    } as CustomEvent);
}

function triggerUpdate(event: CustomEvent<{ name: string; value: any }>) {
    emits('circle-update', { detail: event.detail });
}
</script>

<template>
    <div class="circle-control">
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
                        :name="generalControl.label.toLowerCase()"
                        :value="generalControl.value"
                        :step="generalControl.step"
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
                        :name="strokeControl.label"
                        :value="strokeControl.value"
                        :step="strokeControl.step"
                        @change="triggerUpdate"
                    />

                    <niekes-input-checkbox
                        :options="calcStrokeWidthOptions"
                        :name="'calcStrokeWidth'"
                        :value="props.circle.calcStrokeWidth"
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
                        :value="props.circle.calcOpacity"
                        @change="triggerUpdate"
                    />

                    <niekes-input-radio
                        :options="applyColorSchemeToEachShapeOptions"
                        :name="'applyColorSchemeToEachShape'"
                        :value="props.circle.applyColorSchemeToEachShape"
                        @change="triggerUpdate"
                    />

                    <niekes-input-radio
                        :options="flipColorInterpolatorOptions"
                        :name="'flipColorInterpolator'"
                        :value="props.circle.flipColorInterpolator"
                        @change="triggerUpdate"
                    />

                    <ColorInterpolator
                        :active="props.circle.colorInterPolator"
                        @update-color-interpolator="setColorInterPolator"
                    />
                </div>
            </niekes-toggle>
        </div>
        <div class="radius-control">
            <niekes-toggle>
                <div slot="caption">Radius</div>
                <div slot="content">
                    <niekes-input-range
                        v-for="radiusControl in radiusControls"
                        :key="radiusControl.label"
                        :min="radiusControl.min"
                        :max="radiusControl.max"
                        :label="radiusControl.label"
                        :name="radiusControl.label"
                        :value="radiusControl.value"
                        :step="radiusControl.step"
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
.circle-control {
    display: flex;
    flex-direction: column;
}

.circle-control > * {
    margin-top: var(--niekes-spacing-sm);
}

.circle-control > *:last-child {
    margin-bottom: var(--niekes-spacing-sm);
}
</style>
