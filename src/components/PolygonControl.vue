<script setup lang="ts">
import { type Polygon } from '../types/Polygon';
import ColorInterpolator from '../components/ColorInterpolator.vue';
import { canvasHeight, canvasWidth } from '../config/canvas';
import {
    flipColorInterpolatorOptions,
    applyColorSchemeToEachShapeOptions,
    calcStrokeWidthOptions,
    calcOpacityOptions
} from '../config/controlOptions';

const emits = defineEmits(['polygon-update']);

const props = defineProps<{
    polygon: Polygon;
    initPolygon: Polygon;
}>();

const generalControls = [
    { value: props.polygon.amount, min: 1, max: 1000, step: 1, label: 'Amount' },
    { value: props.polygon.distance, min: -256, max: 256, step: 0.1, label: 'Distance' },
    { value: props.polygon.rotation, min: -1440, max: 1440, step: 1, label: 'Rotation' }
];

const sizeControl = {
    value: props.polygon.size,
    min: 0,
    max: canvasWidth / 2,
    step: 1,
    label: 'Size'
};

const borderRadiusControl = {
    value: props.polygon.borderRadius,
    min: 0,
    max: 1,
    step: 0.01,
    label: 'borderRadius'
};

const strokeControls = [
    {
        value: props.polygon.strokeWidth,
        min: 0.1,
        max: canvasWidth / 4,
        step: 0.1,
        label: 'strokeWidth'
    }
];

const sidesControl = { value: props.polygon.sides, min: 3, max: 20, step: 1, label: 'Sides' };

const positionControls = [
    { value: props.polygon.cx, min: -canvasWidth / 4, max: canvasWidth / 4, step: 1, label: 'Cx' },
    { value: props.polygon.cy, min: -canvasWidth / 4, max: canvasHeight / 4, step: 1, label: 'Cy' }
];

function setColorInterPolator(interpolator: any) {
    triggerUpdate({
        detail: { name: 'colorInterPolator', value: interpolator.name }
    } as CustomEvent);
}

function triggerUpdate(event: CustomEvent<{ name: string; value: any }>) {
    emits('polygon-update', { detail: event.detail });
}
</script>

<template>
    <div class="polygon-control">
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
        <div class="border-radius-control">
            <niekes-toggle>
                <div slot="caption">Border Radius</div>
                <div slot="content">
                    <niekes-input-range
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
                        :value="props.polygon.calcStrokeWidth"
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
                        :value="props.polygon.calcOpacity"
                        @change="triggerUpdate"
                    />

                    <niekes-input-radio
                        :options="applyColorSchemeToEachShapeOptions"
                        :name="'applyColorSchemeToEachShape'"
                        :value="props.polygon.applyColorSchemeToEachShape"
                        @change="triggerUpdate"
                    />

                    <niekes-input-radio
                        :options="flipColorInterpolatorOptions"
                        :name="'flipColorInterpolator'"
                        :value="props.polygon.flipColorInterpolator"
                        @change="triggerUpdate"
                    />

                    <ColorInterpolator
                        :active="props.polygon.colorInterPolator"
                        @update-color-interpolator="setColorInterPolator"
                    />
                </div>
            </niekes-toggle>
        </div>
        <div class="sides-control">
            <niekes-toggle>
                <div slot="caption">Sides</div>
                <div slot="content">
                    <niekes-input-range
                        :key="sidesControl.label"
                        :min="sidesControl.min"
                        :max="sidesControl.max"
                        :label="sidesControl.label"
                        :name="sidesControl.label.toLowerCase()"
                        :value="sidesControl.value"
                        :step="sidesControl.step"
                        @change="triggerUpdate"
                    />
                </div>
            </niekes-toggle>
        </div>
        <div class="size-control">
            <niekes-toggle>
                <div slot="caption">Size</div>
                <div slot="content">
                    <niekes-input-range
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
.polygon-control {
    display: flex;
    flex-direction: column;
}

.polygon-control > * {
    margin-top: var(--niekes-spacing-sm);
}

.polygon-control > *:last-child {
    margin-bottom: var(--niekes-spacing-sm);
}
</style>
