<script setup lang="ts">
import { computed } from 'vue';

const modelValue = defineModel<number | string>({ default: 0 });

const props = defineProps({
    min: { type: Number, default: -10 },
    max: { type: Number, default: 10 },
    mid: { type: Number, default: 0 },
    step: { type: Number, default: 1 },
    label: { type: String, required: true }
});

// Thumb-Größe in px (geht in --range-thumb-size)
const thumbSize = 16;
const trackBgHeight = 8;

// numerischer Wert
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
        modelValue.value = v;
    }
});

const percent = computed(() => (numericValue.value - props.min) / (props.max - props.min));

const midPercent = computed(() => (props.mid - props.min) / (props.max - props.min));

const emit = defineEmits(['update:modelValue', 'input']);
</script>

<template>
    <template v-if="min < 0">
        <div class="w-full flex flex-col gap-1">
            <label
                class="flex w-full text-xs justify-center"
                v-text="`${label} (${numericValue})`"
            />

            <div
                class="relative w-full flex flex-col select-none"
                :style="{
                    height: `${thumbSize}px`
                }"
            >
                <!-- Eigener grauer Grund-Track -->
                <div
                    class="pointer-events-none absolute left-0 w-full rounded-full"
                    :style="{
                        top: '50%',
                        height: `${trackBgHeight}px`,
                        transform: 'translateY(-50%)',
                        backgroundColor: 'color-mix(in oklab, currentColor 10%, #0000)'
                    }"
                />

                <div
                    class="pointer-events-none bg-black dark:bg-white absolute"
                    :class="{
                        // Bedingung für positive Werte (rechts von mid)
                        'rounded-r-full':
                            numericValue >= props.mid && (percent - midPercent) * 100 > 15,
                        // Bedingung für negative Werte (links von mid)
                        'rounded-l-full':
                            numericValue < props.mid && (midPercent - percent) * 100 > 15
                    }"
                    :style="{
                        top: '50%',
                        height: `${thumbSize}px`,
                        transform: 'translateY(-50%)',
                        left:
                            numericValue >= props.mid
                                ? `${midPercent * 100}%`
                                : `${percent * 100}%`,
                        width:
                            numericValue >= props.mid
                                ? `${(percent - midPercent) * 100}%`
                                : `${(midPercent - percent) * 100}%`
                    }"
                />

                <input
                    type="range"
                    :min="props.min"
                    :max="props.max"
                    :step="props.step"
                    v-model="numericValue"
                    class="range range-white w-full absolute my-auto top-0 bottom-0"
                    :style="{
                        '--range-thumb-size': `${thumbSize}px`,
                        '--range-bg': 'transparent',
                        '--range-fill': 0,
                        '--range-track-height': `${trackBgHeight}px`
                    }"
                />
            </div>
        </div>
    </template>
    <template v-else>
        <div class="w-full flex flex-col gap-1">
            <label
                class="flex w-full text-xs justify-center"
                v-text="`${label} (${numericValue})`"
            />
            <input
                type="range"
                class="range range-xs w-full flex"
                v-model="numericValue"
                :min="props.min"
                :max="props.max"
                :step="props.step"
            />
        </div>
    </template>
</template>
