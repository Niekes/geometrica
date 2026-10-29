<script setup lang="ts">
import { ChevronUpIcon } from '@heroicons/vue/24/outline';
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import BaseRangeSlider from '../components/BaseRangeSlider.vue';
import LayerList from '../components/LayerList.vue';
import LayerControl from '../components/LayerControl.vue';
import TheAgentGuide from '../components/TheAgentGuide.vue';
import TheExportDialog from '../components/TheExportDialog.vue';
import TheGallery from '../components/TheGallery.vue';
import TheNavbar from '../components/TheNavbar.vue';
import useScene from '../composables/useScene';
import { useUrlSync } from '../composables/useUrlSync';
import { useWebMcp } from '../composables/useWebMcp';
import { backgroundRanges } from '../config/ranges';
import { surfaceSize } from '../config/surface';
import { lineColor, renderGrid, snapToGrid } from '../lib/renderGrid';
import { layerBounds, renderScene } from '../lib/renderScene';

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

// the marker and the frame keep their screen size, so they are placed as a share of the surface
const toShare = (d: number) => `${(d / surfaceSize) * 100}%`;

const rotationCenter = computed(() => {
    const { cx, cy, rotationCx, rotationCy } = scene.selectedLayer.value;

    return {
        left: toShare(surfaceSize / 2 + cx + rotationCx),
        top: toShare(surfaceSize / 2 - (cy + rotationCy)),
        stroke: lineColor(scene.background.value)
    };
});

// a mouse moves the selected layer only while Space is held, so a stray drag never does
const spaceHeld = ref(false);
// a drag keeps the frame it started with up to its end; a touch drag gains it once the layer moves
const framedDrag = ref(false);

// text fields and an open modal keep Space; a focused button or checkbox keeps its own job too,
// and a drag on the surface takes the focus from it before Space is up
function holdSpace(event: KeyboardEvent) {
    const target = event.target as Element;

    if (event.code !== 'Space') return;
    if (target.closest('textarea, input[type="number"], input[type="text"]')) return;
    if (document.querySelector('dialog[open]')) return;

    // elsewhere the page or the panel would scroll
    if (!target.closest('button, summary, input:not([type="range"])')) event.preventDefault();

    spaceHeld.value = true;
}

// a key released outside the window never reports back, so leaving it lets go as well
function releaseSpace(event: Event) {
    if (event instanceof KeyboardEvent && event.code !== 'Space') return;

    spaceHeld.value = false;
}

const bounds = computed(() => {
    const layer = scene.selectedLayer.value;
    const frame = layer.visible ? layerBounds(layer) : null;

    return (
        frame && {
            left: toShare(frame.minX),
            top: toShare(frame.minY),
            width: toShare(frame.maxX - frame.minX),
            height: toShare(frame.maxY - frame.minY),
            borderColor: lineColor(scene.background.value)
        }
    );
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

    // touch and pen have no Space to hold
    const freeHand = event.pointerType === 'touch' || event.pointerType === 'pen';

    if (!rotationCenter && !spaceHeld.value && !freeHand) return;

    surface.setPointerCapture(event.pointerId);
    framedDrag.value = spaceHeld.value;
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
    if (!drag.rotationCenter) framedDrag.value = true;

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
    framedDrag.value = false;
}

const showAgentGuide = ref(false);
const showGallery = ref(false);
const showExportDialog = ref(false);

onMounted(() => {
    const hasUrlState = initFromUrl();

    if (!hasUrlState || scene.layers.value.length === 0) scene.init(scene.layers.value);

    setupWatchers();
    window.addEventListener('keydown', holdSpace);
    window.addEventListener('keyup', releaseSpace);
    window.addEventListener('blur', releaseSpace);
});

onUnmounted(() => {
    window.removeEventListener('keydown', holdSpace);
    window.removeEventListener('keyup', releaseSpace);
    window.removeEventListener('blur', releaseSpace);
});
</script>

<template>
    <div class="home">
        <TheNavbar>
            <button type="button" class="btn btn-ghost btn-sm" @click="showAgentGuide = true">
                Use with AI
            </button>
            <button type="button" class="btn btn-ghost btn-sm" @click="showGallery = true">
                Gallery
            </button>
            <div class="aura text-primary">
                <button type="button" class="btn btn-primary btn-sm" @click="showExportDialog = true">
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
            <div class="context__stage group">
                <div class="context__fit">
                    <div
                        class="context__surface"
                        :class="framedDrag ? 'cursor-grabbing' : spaceHeld && 'cursor-grab'"
                        :style="{ borderRadius: `${scene.background.value.borderRadius}%` }"
                        @pointerdown="startDrag"
                        @pointermove="moveDrag"
                        @pointerup="endDrag"
                        @pointercancel="endDrag"
                    >
                        <div v-html="svg" />
                        <div v-if="view.grid" class="context__grid" v-html="grid" />
                        <div
                            v-if="(spaceHeld || framedDrag) && bounds"
                            class="context__bounds"
                            :style="bounds"
                        />
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

                <button
                    type="button"
                    class="btn btn-ghost btn-xs btn-wide justify-self-center"
                    aria-label="Background and view"
                    title="Background and view"
                    popovertarget="background-and-view"
                    style="anchor-name: --background-and-view"
                >
                    <ChevronUpIcon class="size-4 group-has-[:popover-open]:rotate-180" />
                </button>

                <!-- the browser closes it on a press outside it or on Escape; it is as wide as
                     the stage at most, though it hangs from the narrower strip -->
                <div
                    id="background-and-view"
                    popover
                    class="context__bar dropdown dropdown-top dropdown-center mb-2 w-max max-w-[100cqw] rounded-box border border-base-300 bg-base-100 p-4 shadow-sm"
                    style="position-anchor: --background-and-view"
                >
                    <!-- exported with the artwork -->
                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">Background</legend>
                        <!-- labels and fields share the first line, the sliders hang below it -->
                        <div class="flex flex-wrap items-start gap-4">
                            <label class="flex items-center gap-2 text-xs">
                                Color
                                <input
                                    v-model="scene.background.value.color"
                                    type="color"
                                    class="h-6 w-12 cursor-pointer rounded-field"
                                />
                            </label>
                            <BaseRangeSlider
                                v-model.number="scene.background.value.opacity"
                                v-bind="backgroundRanges.opacity"
                                class="w-52"
                                label="Opacity"
                                :scale="100"
                                unit="%"
                            />
                            <BaseRangeSlider
                                v-model.number="scene.background.value.borderRadius"
                                v-bind="backgroundRanges.borderRadius"
                                class="w-52"
                                label="Corner radius"
                                unit="%"
                            />
                        </div>
                    </fieldset>

                    <!-- working aids, never exported -->
                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">View</legend>
                        <!-- as tall as a field, so the toggles line up with the background fields -->
                        <div class="flex min-h-6 flex-wrap items-center gap-4">
                            <label v-for="(text, key) in viewLabels" :key="key" class="label">
                                <input
                                    v-model="view[key]"
                                    type="checkbox"
                                    class="toggle toggle-xs"
                                />
                                {{ text }}
                            </label>
                            <span class="label">
                                Hold <kbd class="kbd kbd-xs">Space</kbd> to move
                            </span>
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
                @rename="scene.renameLayer"
            />
        </main>

        <TheAgentGuide v-model="showAgentGuide" />
        <TheGallery v-model="showGallery" />
        <!-- the dialog carries the sponsor ask and exports through the same path, closing itself -->
        <TheExportDialog v-model="showExportDialog" @export="exportSvg" />
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
    container-type: inline-size;
    display: grid;
    flex: 1;
    gap: 1.25rem;
    /* the strip of an extra small button below the surface, mirrored above it by an empty row */
    grid-template-rows: 1.5rem minmax(0, 1fr) 1.5rem;
    min-width: 0;
}

/* keeps the same space above the surface as below it, to the pixel */
.context__stage::before {
    content: '';
}

/* the surface takes the largest square that fits above the strip; the opened bar floats over it */
.context__fit {
    container-type: size;
    display: grid;
    place-items: center;
}

/* a display of its own while closed would keep the popover on screen */
.context__bar:popover-open {
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

/* the frame may leave the surface, like the marker */
.context__bounds {
    border: 1px solid;
    pointer-events: none;
    position: absolute;
}

/* outranks the rule above: a fixed screen size keeps the marker grabbable at any surface size */
.context__surface .context__rotation-center {
    cursor: move;
    height: 24px;
    position: absolute;
    transform: translate(-50%, -50%);
    width: 24px;
}
</style>
