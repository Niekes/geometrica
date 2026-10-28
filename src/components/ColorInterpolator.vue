<template>
    <div class="color-interpolator">
        <button
            v-for="color in colorInterPolators"
            :key="color.name"
            type="button"
            :aria-label="color.name"
            :class="{ 'is-active': active === color.name }"
            class="interpolator-swatch"
            :style="{ background: ramp(color.fn) }"
            @click="$emit('update-color-interpolator', color)"
        ></button>
    </div>
</template>

<script setup lang="ts">
import { colorInterPolators } from '../config/colorInterPolators';

defineProps({
    active: { type: String, required: true }
});

defineEmits(['update-color-interpolator']);

const STOPS = 32;

function ramp(fn: (t: number) => string): string {
    const stops = Array.from({ length: STOPS + 1 }, (_, i) => fn(i / STOPS));

    return `linear-gradient(to right, ${stops.join(', ')})`;
}
</script>

<style scoped>
.color-interpolator {
    align-items: center;
    display: flex;
    flex-direction: column;
}

.interpolator-swatch {
    width: 100%;
    height: 2rem;
    cursor: pointer;
    display: flex;
    border-radius: 5px;
    margin-bottom: 0.25rem;
    border: 1px solid var(--niekes-black, #000); /* Fallback to black if variable fails */
    box-sizing: border-box; /* Ensure border doesn't add to width */
}

.is-active {
    border: 3px solid var(--niekes-status-alert, red) !important;
}
</style>
