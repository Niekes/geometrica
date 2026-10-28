<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import BaseRangeSlider from '../components/BaseRangeSlider.vue';
import LayerList from '../components/LayerList.vue';
import LayerControl from '../components/LayerControl.vue';
import TheGallery from '../components/TheGallery.vue';
import useScene from '../composables/useScene';
import { useUrlSync } from '../composables/useUrlSync';
import { surfaceSize } from '../config/surface';
import { renderGrid, snapToGrid } from '../lib/renderGrid';
import { renderScene } from '../lib/renderScene';

const scene = useScene();

const { initFromUrl, setupWatchers } = useUrlSync({
    layers: scene.layers,
    background: scene.background,
    onLoad: () => scene.selectFirstLayer()
});

// ponytail: every change rebuilds and reparses the whole SVG (ADR-0004); throttle or render via a Vue template if 1000+ instances lag
const svg = computed(() =>
    renderScene({ background: scene.background.value, layers: scene.layers.value })
);

function download() {
    const link: HTMLAnchorElement = document.createElement('a');
    const date: Date = new Date();

    link.download = `geometrica-${date.toLocaleDateString()}-${date.toLocaleTimeString()}.svg`;
    link.href = URL.createObjectURL(new Blob([svg.value], { type: 'image/svg+xml' }));
    link.click();
    // revoking synchronously can cancel the download in some browsers
    setTimeout(() => URL.revokeObjectURL(link.href));
}

// the grid is part of the working view only: it is not stored in the URL and never exported
const showGrid = ref(true);
const grid = computed(() => renderGrid(scene.background.value));
const toPercent = (d: number) => `${(d * 100).toFixed(0)}%`;

// dragging the drawing surface moves the selected layer; the jitter of a click never moves it
let drag: { x: number; y: number; cx: number; cy: number; scale: number; moved: boolean } | null =
    null;

function startDrag(event: PointerEvent) {
    if (event.button !== 0) return;

    const surface = event.currentTarget as HTMLElement;
    const { cx, cy } = scene.selectedLayer.value;

    surface.setPointerCapture(event.pointerId);
    drag = {
        x: event.clientX,
        y: event.clientY,
        cx,
        cy,
        scale: surfaceSize / surface.clientWidth,
        moved: false
    };
}

function moveDrag(event: PointerEvent) {
    if (!drag) return;

    const dx = event.clientX - drag.x;
    // cy counts upwards, the screen downwards
    const dy = drag.y - event.clientY;

    if (!drag.moved && Math.hypot(dx, dy) < 3) return;

    drag.moved = true;

    const { scale } = drag;
    const place = (start: number, delta: number) => {
        const half = surfaceSize / 2;
        const position = Math.max(-half, Math.min(half, Math.round(start + delta * scale)));

        // the grid shows where a layer snaps to, so without it the layer moves freely
        return showGrid.value ? snapToGrid(position) : position;
    };

    scene.selectedLayer.value.cx = place(drag.cx, dx);
    scene.selectedLayer.value.cy = place(drag.cy, dy);
}

function endDrag() {
    drag = null;
}

const showGallery = ref(false);

onMounted(() => {
    const hasUrlState = initFromUrl();

    if (!hasUrlState || scene.layers.value.length === 0) scene.init(scene.layers.value);

    setupWatchers();
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
                v-model="scene.selectedLayer.value"
                :key="scene.selectedLayer.value?.id"
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
                <BaseRangeSlider
                    v-model.number="scene.background.value.opacity"
                    :min="0"
                    :max="1"
                    :step="0.01"
                    label="Opacity"
                    :format="toPercent"
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
                <label class="inline-flex items-center gap-2 cursor-pointer text-xs">
                    <input type="checkbox" class="checkbox checkbox-sm" v-model="showGrid" />
                    Grid
                </label>
            </div>

            <button class="btn btn-primary btn-block mt-4" @click="download">Download</button>
            <button class="btn btn-neutral btn-block mt-4" @click="showGallery = true">
                Gallery
            </button>
        </div>

        <div class="context">
            <div
                class="context__surface"
                @pointerdown="startDrag"
                @pointermove="moveDrag"
                @pointerup="endDrag"
                @pointercancel="endDrag"
            >
                <div v-html="svg" />
                <div v-if="showGrid" class="context__grid" v-html="grid" />
            </div>
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

.context__surface {
    aspect-ratio: 1;
    /* the transparency pattern lives in CSS, so the exported SVG never contains it */
    background: repeating-conic-gradient(#e5e5e5 0 25%, #fff 0 50%) 0 0 / 16px 16px;
    cursor: move;
    display: grid;
    filter: drop-shadow(0 4px 6px rgb(0 0 0 / 50%));
    height: 75%;
    max-width: 75%;
    /* touch input drags the layer instead of scrolling the page */
    touch-action: none;
}

.context__surface > * {
    grid-area: 1 / 1;
}

.context__grid {
    pointer-events: none;
}

.context__surface :deep(svg) {
    display: block;
    height: 100%;
    width: 100%;
}
</style>
