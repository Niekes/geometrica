<script setup lang="ts">
import { computed } from 'vue';
import { ArrowTopRightOnSquareIcon, CheckIcon, LinkIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import BaseIconButton from './BaseIconButton.vue';
import { useCopy } from '@/composables/useCopy';

const props = defineProps<{
    link: string;
    // the position in the gallery, from 0 like the thumbnail's file name; the number counts from 1
    index: number;
}>();

// wherever the app runs: the dev server on any port, GitHub Pages or a fork
const href = computed(() => `${import.meta.env.BASE_URL}?${props.link}`);

// the clipboard gets the full address, so the link works wherever it is pasted
const fullLink = computed(() => new URL(href.value, location.href).href);
const { state, copy } = useCopy();
const copyIcons = { idle: LinkIcon, copied: CheckIcon, failed: XMarkIcon };
const copyMessages = { idle: '', copied: 'Link copied', failed: 'Copy failed' };
</script>

<template>
    <div class="card card-border card-sm">
        <figure>
            <a :href="href" class="block aspect-square w-full">
                <img
                    class="w-full hover:opacity-80"
                    :src="`./gallery/${index}.avif`"
                    :alt="`Open artwork ${index + 1}`"
                />
            </a>
        </figure>
        <div class="card-body flex-row items-center justify-between">
            <span class="card-title" v-text="index + 1" />
            <div class="card-actions">
                <span class="sr-only" aria-live="polite" v-text="copyMessages[state]" />
                <BaseIconButton
                    label="Copy link"
                    :icon="copyIcons[state]"
                    @click="copy(fullLink)"
                />
                <BaseIconButton
                    label="Open in new tab"
                    :icon="ArrowTopRightOnSquareIcon"
                    :href="href"
                    target="_blank"
                />
            </div>
        </div>
    </div>
</template>
