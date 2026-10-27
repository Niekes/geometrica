<template>
    <div class="color-interpolator">
        <canvas
            v-for="(color, index) in colorInterpolators"
            :key="color.name"
            :ref="(el) => setCanvasRef(el, index)"
            :class="{ 'is-active': active === color.name }"
            class="interpolator-canvas"
            width="32"
            height="1"
            @click="$emit('update-color-interpolator', color)"
        ></canvas>
    </div>
</template>

<script setup lang="ts">
import { ref, type ComponentPublicInstance } from 'vue';
import { colorInterPolators } from '../config/colorInterPolators';

defineProps({
    active: { type: String, required: true }
});

defineEmits(['update-color-interpolator']);

const colorInterpolators = ref(colorInterPolators);

// Draw gradient on canvas when it's mounted
const setCanvasRef = (el: Element | ComponentPublicInstance | null, index: number) => {
    if (!(el instanceof HTMLCanvasElement)) return;

    // Check if customized already (simple check to avoid redrawing if not needed)
    // We verify if data-drawn is set to avoid infinite redraws if reactivity triggers updates
    if (el.dataset.drawn === 'true') return;

    const ctx = el.getContext('2d');
    const color = colorInterpolators.value[index];

    if (ctx && color) {
        for (let i = 0; i <= el.width; i += 1) {
            ctx.fillStyle = color.fn(i / el.width);
            ctx.fillRect(i, 0, 1, 1);
        }
        el.dataset.drawn = 'true';
    }
};
</script>

<style scoped>
.color-interpolator {
    align-items: center;
    display: flex;
    flex-direction: column;
}

.interpolator-canvas {
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
