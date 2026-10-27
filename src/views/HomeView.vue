<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';
import LayerList from '../components/LayerList.vue';
import LayerControl from '../components/LayerControl.vue';
import TheGallery from '../components/TheGallery.vue';
import useScene from '../composables/useScene';
import { useUrlSync } from '../composables/useUrlSync';
import { renderScene } from '../lib/renderScene';
import { canvasHeight, canvasWidth } from '../config/canvas';

const canvas = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);

const scene = useScene();

const { initFromUrl, setupWatchers } = useUrlSync({
    layers: scene.layers,
    background: scene.background,
    onLoad: () => scene.selectFirstLayer()
});

function download() {
    if (canvas.value) {
        const link: HTMLAnchorElement = document.createElement('a');
        const date: Date = new Date();

        link.download = `geometrica-${date.toLocaleDateString()}-${date.toLocaleTimeString()}.png`;
        link.href = canvas.value.toDataURL();
        link.click();
    }
}

const showGallery = ref(false);

async function draw(): Promise<void> {
    await nextTick();

    if (!ctx.value) return;

    renderScene(ctx.value, scene.layers.value);
}

watch(scene.layers, draw, { deep: true });

onMounted(() => {
    const hasUrlState = initFromUrl();

    if (!hasUrlState || scene.layers.value.length === 0) scene.init(scene.layers.value);

    setupWatchers();

    if (canvas.value) {
        const context = canvas.value.getContext('2d');

        canvas.value.width = canvasWidth;
        canvas.value.height = canvasHeight;

        if (context) {
            ctx.value = context;

            ctx.value.scale(2, 2);
            ctx.value.imageSmoothingEnabled = false;

            draw();
        } else {
            console.error('2D context is not supported.');
        }
    } else {
        console.error('Canvas element not found.');
    }
});
</script>

<template>
    <div class="home grid">
        <div class="bg-base-200 p-4 w-full justify-items-center overflow-scroll">
            <LayerList
                :layers="scene.layers.value"
                :selected-id="scene.selectedLayerId.value"
                @select="(id: string) => (scene.selectedLayerId.value = id)"
                @add="scene.addLayer"
                @duplicate="scene.duplicateLayer"
                @remove="scene.removeLayer"
                @move="scene.moveLayer"
                @toggle-visibility="scene.toggleVisibility"
            />

            <div class="divider"></div>

            <LayerControl
                v-if="scene.selectedLayer.value"
                :key="scene.selectedLayer.value.id"
                :layer="scene.selectedLayer.value"
            />

            <div class="divider"></div>

            <div class="w-full flex flex-col gap-2">
                <label class="text-xs font-semibold uppercase opacity-60" for="bg-color">
                    Background
                </label>
                <input
                    id="bg-color"
                    type="color"
                    class="w-full h-8 cursor-pointer bg-transparent"
                    v-model="scene.background.value.color"
                />
                <label class="w-full text-xs" for="bg-radius">
                    Radius ({{ scene.background.value.borderRadius }}%)
                </label>
                <input
                    id="bg-radius"
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    class="range range-xs w-full"
                    v-model.number="scene.background.value.borderRadius"
                />
            </div>

            <button class="btn btn-primary btn-block mt-4" @click="download">Download</button>
            <button class="btn btn-neutral btn-block mt-4" @click="showGallery = true">
                Gallery
            </button>
        </div>

        <div class="context">
            <canvas
                class="context__canvas shadow-md shadow-black/50"
                ref="canvas"
                :height="canvasHeight"
                :width="canvasWidth"
                :style="{
                    'background-color': scene.background.value.color,
                    'border-radius': `${scene.background.value.borderRadius}%`
                }"
                @contextmenu.prevent.stop
            />
        </div>

        <TheGallery v-model="showGallery" />
    </div>
</template>

<style scoped>
.home {
    --navbar-height: 4rem;

    margin-top: var(--navbar-height);
    height: calc(100vh - var(--navbar-height));
    height: calc(100dvh - var(--navbar-height));
    grid-template-areas: 'control context';
    grid-template-columns: minmax(0, 24rem) 1fr;
    grid-template-rows: minmax(0, 1fr);
}

.control {
    grid-area: control;
}

.control__shapes {
    grid-area: shapes;
}

.context {
    align-items: center;
    display: flex;
    grid-area: context;
    justify-content: center;
}

.context__canvas {
    border: 1px solid var(--niekes-black-10);
    max-height: 75%;
    max-width: 75%;
    aspect-ratio: 1;
}
</style>
