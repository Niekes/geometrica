<template>
    <div class="color-interpolator" ref="root"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, defineEmits } from 'vue';
import { colorInterPolators } from '../config/colorInterPolators';

const props = defineProps({
    active: { type: String, required: true }
});

const root = ref<HTMLElement | null>(null);

const emits = defineEmits(['update-color-interpolator']);

const colorInterpolators = ref(colorInterPolators);

const setColorInterpolator = (e?: MouseEvent, color?: any) => {
    if (root.value) {
        root.value.querySelectorAll('canvas').forEach((canvas) => {
            canvas.style.border = '1px solid black';
        });
    }

    (e?.currentTarget as HTMLCanvasElement).style.border = '1px solid red';

    emits('update-color-interpolator', color);
};

onMounted(() => {
    colorInterpolators.value.forEach((color) => {
        const canvas: HTMLCanvasElement = document.createElement('canvas');

        canvas.style.width = '100%;';
        canvas.style.height = '2rem';
        canvas.style.border = props.active === color.name ? '1px solid red' : '1px solid black';
        canvas.style.cursor = 'pointer';
        canvas.style.display = 'flex';
        canvas.style.borderRadius = '5px';
        canvas.style.margin = '0 0 0.25rem 0';
        canvas.style.width = '100%';
        canvas.width = 32;
        canvas.height = 1;

        canvas.addEventListener('click', (e) => setColorInterpolator(e, color));

        if (root.value) {
            root.value.appendChild(canvas);

            const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');

            for (let i = 0; i <= canvas.width; i += 1) {
                if (ctx) {
                    ctx.fillStyle = color.fn(i / canvas.width);
                    ctx.fillRect(i, 0, 1, 1);
                }
            }
        }
    });
});

onBeforeUnmount(() => {
    if (root.value) {
        root.value
            .querySelector('canvas')
            ?.removeEventListener('click', (e) => setColorInterpolator(e));
    }
});
</script>

<style lang="scss" scoped>
.color-interpolator {
    align-items: center;
    display: flex;
    flex-direction: column;
}
</style>
