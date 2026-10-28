<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import LayerList from '../components/LayerList.vue';
import LayerControl from '../components/LayerControl.vue';
import TheGallery from '../components/TheGallery.vue';
import useScene from '../composables/useScene';
import { useUrlSync } from '../composables/useUrlSync';
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
            <div class="context__surface" v-html="svg" />
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
    filter: drop-shadow(0 4px 6px rgb(0 0 0 / 50%));
    height: 75%;
    max-width: 75%;
}

.context__surface :deep(svg) {
    height: 100%;
    width: 100%;
}
</style>
