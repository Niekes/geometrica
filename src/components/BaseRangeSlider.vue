<script setup lang="ts">
// Vue
import { computed, useId } from 'vue';

// Model
const modelValue = defineModel<number | string>({ default: 0 });

// Props
const props = defineProps({
    min: { type: Number, default: -10 },
    max: { type: Number, default: 10 },
    mid: { type: Number, default: 0 },
    step: { type: Number, default: 1 },
    label: { type: String, required: true },
    // the field shows the value times the scale, e.g. 100 for a share shown in percent
    scale: { type: Number, default: 1 },
    unit: { type: String, default: '' }
});

// Vars
const id = useId();
const thumbSize = '1rem';

// Computed
const numericValue = computed<number>({
    get() {
        const v = modelValue.value;
        if (typeof v === 'string') {
            const n = Number(v);
            return Number.isNaN(n) ? 0 : n;
        }
        return v ?? 0;
    },
    set(v) {
        // the steps count from min, like the native slider's; rounding keeps float noise like 0.30000000000000004 out of the URL
        const stepped = props.min + Math.round((v - props.min) / props.step) * props.step;

        modelValue.value = Number(Math.min(props.max, Math.max(props.min, stepped)).toFixed(6));
    }
});

const fieldStep = computed(() => props.step * props.scale);

// as many decimals as the step needs: 0.5 shows one, 1 none
const decimals = computed(() => Math.max(0, Math.ceil(-Math.log10(fieldStep.value) - 1e-9)));

const fieldValue = computed(() => (numericValue.value * props.scale).toFixed(decimals.value));

// a slider below zero fills from the middle, so the fill shows the sign of the value
const isBipolar = computed(() => props.min < 0);

const share = (v: number) => (v - props.min) / (props.max - props.min);

// the fill is the path the thumb sweeps from mid to the value, so both round ends sit where a thumb would
const fill = computed(() => {
    const [from, to] = [props.mid, numericValue.value].sort((a, b) => a - b) as [number, number];

    return {
        left: `calc(${share(from)} * (100% - ${thumbSize}))`,
        width: `calc(${share(to) - share(from)} * (100% - ${thumbSize}) + ${thumbSize})`
    };
});

function readField(event: Event): number {
    return (event.target as HTMLInputElement).valueAsNumber / props.scale;
}

// half-typed values such as "-" or ones out of range wait for the change event
function onFieldInput(event: Event) {
    const value = readField(event);

    if (Number.isNaN(value) || value < props.min || value > props.max) return;

    numericValue.value = value;
}

function onFieldChange(event: Event) {
    const value = readField(event);

    if (!Number.isNaN(value)) numericValue.value = value;

    // a rejected or clamped value leaves the model as it was, so Vue would not rewrite the field
    (event.target as HTMLInputElement).value = fieldValue.value;
}

const arrowDirections: Record<string, number> = {
    ArrowUp: 1,
    ArrowRight: 1,
    ArrowDown: -1,
    ArrowLeft: -1
};

// Shift with an arrow key moves ten steps; in the text field left and right only move the caret
function onKeydown(event: KeyboardEvent) {
    const direction = arrowDirections[event.key];
    const isField = (event.target as HTMLInputElement).type === 'number';

    if (!event.shiftKey || !direction) return;
    if (isField && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) return;

    event.preventDefault();
    numericValue.value += direction * props.step * 10;
}
</script>

<template>
    <div class="flex flex-col gap-1">
        <div class="flex items-center justify-between gap-2">
            <label :for="id" class="truncate text-xs" v-text="label" />
            <span class="flex shrink-0 items-center gap-1 text-xs">
                <input
                    type="number"
                    class="input input-xs w-16 text-right tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                    :aria-label="label"
                    :value="fieldValue"
                    :min="min * scale"
                    :max="max * scale"
                    :step="fieldStep"
                    @input="onFieldInput"
                    @change="onFieldChange"
                    @keydown="onKeydown"
                />
                <span class="w-3 text-base-content/70" v-text="unit" />
            </span>
        </div>

        <div class="relative flex items-center">
            <div
                v-if="isBipolar"
                class="pointer-events-none absolute rounded-selector bg-current"
                :style="{ ...fill, height: thumbSize }"
            />
            <input
                :id="id"
                v-model.number="numericValue"
                type="range"
                class="range range-xs relative w-full"
                :style="{ '--range-thumb-size': thumbSize, '--range-fill': isBipolar ? 0 : 1 }"
                :min="min"
                :max="max"
                :step="step"
                @keydown="onKeydown"
            />
        </div>
    </div>
</template>
