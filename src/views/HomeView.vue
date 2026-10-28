<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import BaseRangeSlider from '../components/BaseRangeSlider.vue';
import LayerList from '../components/LayerList.vue';
import LayerControl from '../components/LayerControl.vue';
import TheGallery from '../components/TheGallery.vue';
import TheNavbar from '../components/TheNavbar.vue';
import useScene from '../composables/useScene';
import { useUrlSync } from '../composables/useUrlSync';
import { useWebMcp } from '../composables/useWebMcp';
import { backgroundRanges } from '../config/ranges';
import { surfaceSize } from '../config/surface';
import { lineColor, renderGrid, snapToGrid } from '../lib/renderGrid';
import { renderScene } from '../lib/renderScene';

const scene = useScene();

const { initFromUrl, setupWatchers } = useUrlSync({
    layers: scene.layers,
    background: scene.background,
    onLoad: () => scene.selectFirstLayer()
});

useWebMcp(scene);

// ponytail: every change rebuilds and reparses the whole SVG (ADR-0004); throttle or render via a Vue template if 1000+ instances lag
const svg = computed(() =>
    renderScene({ background: scene.background.value, layers: scene.layers.value })
);

function exportSvg() {
    const link: HTMLAnchorElement = document.createElement('a');
    const date: Date = new Date();

    link.download = `geometrica-${date.toLocaleDateString()}-${date.toLocaleTimeString()}.svg`;
    link.href = URL.createObjectURL(new Blob([svg.value], { type: 'image/svg+xml' }));
    link.click();
    // revoking synchronously can cancel the download in some browsers
    setTimeout(() => URL.revokeObjectURL(link.href));
}

// the grid, snapping and the rotation center belong to the working view only:
// they are not stored in the URL and never exported
const view = reactive({ grid: false, snap: true, rotationCenter: true });
const viewLabels = { grid: 'Grid', snap: 'Snap', rotationCenter: 'Rotation center' };
const grid = computed(() => renderGrid(scene.background.value));

// the marker of the rotation center keeps its screen size, so it is placed as a share of the surface
const rotationCenter = computed(() => {
    const { cx, cy, rotationCx, rotationCy } = scene.selectedLayer.value;
    const toShare = (d: number) => `${((surfaceSize / 2 + d) / surfaceSize) * 100}%`;

    return {
        left: toShare(cx + rotationCx),
        top: toShare(-(cy + rotationCy)),
        stroke: lineColor(scene.background.value)
    };
});

// dragging the drawing surface moves the selected layer, dragging the marker its rotation center;
// the jitter of a click never moves either. cx and cy hold where the dragged point started.
let drag: {
    x: number;
    y: number;
    cx: number;
    cy: number;
    scale: number;
    moved: boolean;
    rotationCenter: boolean;
} | null = null;

function startDrag(event: PointerEvent) {
    if (event.button !== 0) return;

    const surface = event.currentTarget as HTMLElement;
    const rotationCenter = (event.target as Element).closest('.context__rotation-center') !== null;
    const { cx, cy, rotationCx, rotationCy } = scene.selectedLayer.value;

    surface.setPointerCapture(event.pointerId);
    drag = {
        x: event.clientX,
        y: event.clientY,
        cx: rotationCenter ? cx + rotationCx : cx,
        cy: rotationCenter ? cy + rotationCy : cy,
        scale: surfaceSize / surface.clientWidth,
        moved: false,
        rotationCenter
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
    const layer = scene.selectedLayer.value;
    const place = (start: number, delta: number, anchor: number) => {
        const half = surfaceSize / 2;
        const position = Math.max(-half, Math.min(half, Math.round(start + delta * scale)));

        return view.snap ? snapToGrid(position, anchor) : position;
    };

    if (drag.rotationCenter) {
        // the rotation center is stored as an offset from the position, but snaps on the surface
        layer.rotationCx = place(drag.cx, dx, layer.cx) - layer.cx;
        layer.rotationCy = place(drag.cy, dy, layer.cy) - layer.cy;
    } else {
        layer.cx = place(drag.cx, dx, 0);
        layer.cy = place(drag.cy, dy, 0);
    }
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
    <div class="home">
        <TheNavbar>
            <button type="button" class="btn btn-ghost btn-sm" @click="showGallery = true">
                Gallery
            </button>
            <div class="aura text-primary">
                <button type="button" class="btn btn-primary btn-sm" @click="exportSvg">
                    Export SVG
                </button>
            </div>
        </TheNavbar>

        <aside class="panel bg-base-200" aria-label="Layer properties">
            <LayerControl
                v-if="scene.selectedLayer.value"
                v-model="scene.selectedLayer.value"
                :key="scene.selectedLayer.value?.id"
            />
        </aside>

        <main class="context">
            <div class="context__stage">
                <div class="context__fit">
                    <div
                        class="context__surface"
                        :style="{ borderRadius: `${scene.background.value.borderRadius}%` }"
                        @pointerdown="startDrag"
                        @pointermove="moveDrag"
                        @pointerup="endDrag"
                        @pointercancel="endDrag"
                    >
                        <div v-html="svg" />
                        <div v-if="view.grid" class="context__grid" v-html="grid" />
                        <svg
                            v-if="view.rotationCenter"
                            class="context__rotation-center"
                            :style="rotationCenter"
                            viewBox="-12 -12 24 24"
                            fill="none"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <circle r="2" />
                            <!-- three quarters of a turn, with an arrowhead pointing along it -->
                            <path d="M8 0 A8 8 0 1 1 0 -8 M-3 -11 L0 -8 L-3 -5" />
                        </svg>
                    </div>
                </div>

                <div class="context__bar">
                    <!-- exported with the artwork -->
                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">Background</legend>
                        <div class="flex flex-wrap items-end gap-4">
                            <label class="flex flex-col gap-1">
                                Color
                                <input
                                    v-model="scene.background.value.color"
                                    type="color"
                                    class="h-7 w-12 cursor-pointer rounded-field"
                                />
                            </label>
                            <BaseRangeSlider
                                v-model.number="scene.background.value.opacity"
                                v-bind="backgroundRanges.opacity"
                                class="w-44"
                                label="Opacity"
                                :scale="100"
                                unit="%"
                            />
                            <BaseRangeSlider
                                v-model.number="scene.background.value.borderRadius"
                                v-bind="backgroundRanges.borderRadius"
                                class="w-44"
                                label="Corner radius"
                                unit="%"
                            />
                        </div>
                    </fieldset>

                    <!-- working aids, never exported -->
                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">View</legend>
                        <div class="flex flex-wrap items-center gap-4">
                            <label v-for="(text, key) in viewLabels" :key="key" class="label">
                                <input v-model="view[key]" type="checkbox" class="toggle toggle-xs" />
                                {{ text }}
                            </label>
                        </div>
                    </fieldset>
                </div>
            </div>

            <LayerList
                class="context__layers rounded-box border border-base-300 bg-base-100 shadow-sm"
                :layers="scene.layers.value"
                :selected-id="scene.selectedLayerId.value"
                @select="(id: string) => (scene.selectedLayerId.value = id)"
                @add="scene.addLayer"
                @duplicate="scene.duplicateLayer"
                @remove="scene.removeLayer"
                @move="scene.moveLayer"
                @toggle-visibility="scene.toggleVisibility"
            />
        </main>

        <TheGallery v-model="showGallery" />
    </div>
</template>

<style scoped>
.home {
    --navbar-height: 4rem;

    display: grid;
    grid-template-columns: 22rem minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr);
    margin-top: var(--navbar-height);
    height: calc(100vh - var(--navbar-height));
    height: calc(100dvh - var(--navbar-height));
}

/* no side padding: the sections bring their own */
.panel {
    overflow-y: auto;
    padding-bottom: 1rem;
}

.context {
    display: flex;
    gap: 1rem;
    min-width: 0;
    padding: 1.5rem;
}

.context__stage {
    display: grid;
    flex: 1;
    gap: 1.25rem;
    grid-template-rows: minmax(0, 1fr) auto;
    min-width: 0;
}

/* the surface takes the largest square that fits, beside the bar below it */
.context__fit {
    container-type: size;
    display: grid;
    place-items: center;
}

.context__bar {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem 2.5rem;
    justify-content: center;
}

.context__layers {
    align-self: flex-start;
    flex-shrink: 0;
    width: 15rem;
}

.context__surface {
    aspect-ratio: 1;
    /* the transparency pattern lives in CSS, so the exported SVG never contains it */
    background: repeating-conic-gradient(#e5e5e5 0 25%, #fff 0 50%) 0 0 / 16px 16px;
    cursor: move;
    display: grid;
    filter: drop-shadow(0 4px 6px rgb(0 0 0 / 50%));
    position: relative;
    /* touch input drags the layer instead of scrolling the page */
    touch-action: none;
    width: min(100cqw, 100cqh);
}

.context__surface > * {
    grid-area: 1 / 1;
}

/* the grid follows the rounded corners of the surface, the rotation center may leave it */
.context__grid {
    border-radius: inherit;
    overflow: hidden;
    pointer-events: none;
}

.context__surface :deep(svg) {
    display: block;
    height: 100%;
    width: 100%;
}

/* outranks the rule above: a fixed screen size keeps the marker grabbable at any surface size */
.context__surface .context__rotation-center {
    height: 24px;
    position: absolute;
    transform: translate(-50%, -50%);
    width: 24px;
}
</style>
