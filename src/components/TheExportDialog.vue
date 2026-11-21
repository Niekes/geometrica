<script setup lang="ts">
import { ArrowDownTrayIcon } from '@heroicons/vue/24/outline';
import { computedAsync, useObjectUrl } from '@vueuse/core';
import { computed, ref, watch } from 'vue';
import BaseModal from './BaseModal.vue';
import BaseSegmented from './BaseSegmented.vue';
import { surfaceSize } from '../config/surface';
import { embedMetadata } from '../lib/embedMetadata';
import { version } from '../../package.json';

const isOpen = defineModel<boolean>({ default: false });
const props = defineProps<{ svg: string; link: string }>();

const sponsorUrl = 'https://github.com/sponsors/niekes';
const repoUrl = 'https://github.com/Niekes/geometrica';

const scales = [
    { value: '1', label: '1×' },
    { value: '2', label: '2×' },
    { value: '4', label: '4×' }
];
// kept while the page is open, so the next export starts where the last one ended
const format = ref<'png' | 'svg'>('svg');
const scale = ref('2');
// shortcut: 4× of the fixed surface is 4096², exactly the largest canvas Safari on iPhone and iPad draws; shrink the scale to fit that limit once the surface can grow
const pngSize = computed(() => surfaceSize * Number(scale.value));

// the artwork and its link as they were when the dialog opened: edits while it is closed cost
// nothing, and closing leaves the files alone, as revoking a link right after its click can
// cancel the export in some browsers
const artwork = ref('');
const artworkLink = ref('');
const openedAt = ref(new Date());

watch(isOpen, (open) => {
    if (!open) return;
    artwork.value = props.svg;
    artworkLink.value = props.link;
    openedAt.value = new Date();
});

const preview = computed(
    () => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(artwork.value)}`
);

const svgFile = computed(
    () =>
        new Blob(
            [
                embedMetadata(artwork.value, {
                    link: artworkLink.value,
                    date: openedAt.value,
                    generator: `Geometrica ${version}`
                })
            ],
            { type: 'image/svg+xml' }
        )
);

// the PNG is the SVG drawn by the browser, so both files show the same artwork; null when the
// browser cannot make it, e.g. out of memory
async function drawPng(src: string, size: number): Promise<Blob | null> {
    const image = new Image();

    image.src = src;

    try {
        await image.decode();
        const canvas = new OffscreenCanvas(size, size);

        canvas.getContext('2d')!.drawImage(image, 0, 0, size, size);

        return await canvas.convertToBlob();
    } catch {
        return null;
    }
}

const drawing = ref(false);
// made only once PNG is chosen, and again for another size or artwork
const pngFile = computedAsync(
    () => (format.value === 'png' ? drawPng(preview.value, pngSize.value) : undefined),
    undefined,
    drawing
);

const file = computed(() => (format.value === 'svg' ? svgFile.value : pngFile.value));
const url = useObjectUrl(file);
// a link to the PNG of the last size would leave while the new one is still being drawn
const href = computed(() => (drawing.value ? undefined : url.value));

const fileName = computed(() => {
    const date = openedAt.value;

    return `geometrica-${date.toLocaleDateString()}-${date.toLocaleTimeString()}.${format.value}`;
});

const fileSize = (bytes: number) =>
    bytes < 1e6 ? `${Math.max(1, Math.round(bytes / 1e3))} KB` : `${(bytes / 1e6).toFixed(1)} MB`;

const formats = computed(() => [
    {
        value: 'png' as const,
        title: 'PNG image (.png)',
        hint: 'Opens anywhere: social media, slides, wallpapers',
        badge: `${pngSize.value} × ${pngSize.value} px`
    },
    {
        value: 'svg' as const,
        title: 'SVG vector (.svg)',
        hint: 'Sharp at any size, and opening its link reopens this artwork',
        badge: fileSize(svgFile.value.size)
    }
]);
</script>

<template>
    <BaseModal v-model="isOpen" box-class="w-11/12 max-w-lg max-h-[95dvh]">
        <template #title>
            <div class="flex items-center gap-3">
                <span
                    class="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full"
                >
                    <ArrowDownTrayIcon class="size-5" aria-hidden="true" />
                </span>
                <span>
                    Export
                    <span class="text-base-content/60 block text-xs font-normal"
                        >Choose a format for your artwork</span
                    >
                </span>
            </div>
        </template>

        <figure class="flex justify-center">
            <img
                :src="preview"
                alt="The artwork to export"
                class="rounded-box transparency-pattern max-h-[40dvh] object-contain"
            />
        </figure>

        <div class="mt-4 space-y-2">
            <div
                v-for="option in formats"
                :key="option.value"
                class="rounded-box border p-3"
                :class="
                    format === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-base-300 hover:bg-base-200'
                "
            >
                <label class="flex cursor-pointer items-start gap-3">
                    <input
                        v-model="format"
                        type="radio"
                        name="format"
                        :value="option.value"
                        class="radio radio-primary radio-sm mt-0.5"
                    />
                    <span class="flex-1">
                        <span class="block text-sm font-medium">{{ option.title }}</span>
                        <span class="text-base-content/60 block text-xs">{{ option.hint }}</span>
                    </span>
                    <span class="badge badge-ghost badge-sm tabular-nums">{{ option.badge }}</span>
                </label>
                <div v-if="option.value === 'png' && format === 'png'" class="mt-1 w-fit pl-7">
                    <BaseSegmented
                        v-model="scale"
                        legend="PNG size"
                        hide-legend
                        :options="scales"
                    />
                </div>
            </div>
        </div>

        <div class="bg-base-200 rounded-box mt-4 flex flex-wrap items-center gap-2 p-3 text-sm">
            <span class="flex-1">💜 Free and open source. Enjoying Geometrica?</span>
            <a class="btn btn-ghost btn-xs" :href="repoUrl" target="_blank" rel="noopener"
                >⭐ Star</a
            >
            <!-- the GitHub Sponsors pink, tuned through daisyUI's own button variables -->
            <a
                class="btn btn-outline btn-xs [--btn-color:#EA4AAA] [--btn-fg:#fff]"
                :href="sponsorUrl"
                target="_blank"
                rel="noopener"
                >Sponsor</a
            >
        </div>

        <p
            v-if="format === 'png' && pngFile === null && !drawing"
            role="alert"
            class="alert alert-error alert-soft mt-4"
        >
            The PNG could not be made. Try a smaller size.
        </p>

        <template #actions>
            <form method="dialog">
                <button class="btn btn-ghost btn-sm">Cancel</button>
            </form>
            <!-- without a file behind it, the link has no href: it cannot be followed, not even by key -->
            <a
                class="btn btn-primary btn-sm"
                :class="{ 'btn-disabled': !href }"
                :href="href"
                :download="fileName"
                :aria-disabled="!href"
                @click="isOpen = false"
            >
                <span v-if="drawing" class="loading loading-spinner loading-xs" />
                Export {{ format.toUpperCase() }}
            </a>
        </template>
    </BaseModal>
</template>
