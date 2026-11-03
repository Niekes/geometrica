<script setup lang="ts">
import { computed } from 'vue';
import {
    ArrowTopRightOnSquareIcon,
    CheckIcon,
    LinkIcon,
    XMarkIcon
} from '@heroicons/vue/24/outline';
import BaseIconButton from './BaseIconButton.vue';
import { useCopy } from '@/composables/useCopy';

const props = defineProps<{
    link: string;
    name: string;
}>();

// the thumbnail is named after the artwork, so removing or reordering never shifts a file
const thumbnail = computed(() => `./gallery/${props.name.toLowerCase().replace(/ /g, '-')}.avif`);

// wherever the app runs: the dev server on any port, GitHub Pages or a fork
const href = computed(() => `${import.meta.env.BASE_URL}?${props.link}`);

// the clipboard gets the full address, so the link works wherever it is pasted; a page without a
// clipboard (plain http, like the dev server opened over the network) offers no copy at all
const fullLink = computed(() => new URL(href.value, location.href).href);
const { state, copy, isSupported } = useCopy();
const copyLabels = { idle: 'Copy link', copied: 'Link copied', failed: 'Copy failed' };
const copyIcons = { idle: LinkIcon, copied: CheckIcon, failed: XMarkIcon };
</script>

<template>
    <div class="card card-border card-sm">
        <figure>
            <a :href="href" class="block aspect-square w-full p-2">
                <img class="w-full hover:opacity-80" :src="thumbnail" :alt="`Open ${name}`" />
            </a>
        </figure>
        <div class="card-body">
            <div class="card-actions items-center">
                <span class="card-title grow" v-text="name" />
                <template v-if="isSupported">
                    <!-- the label changes for the tooltip; the live region tells screen readers -->
                    <span
                        class="sr-only"
                        aria-live="polite"
                        v-text="state === 'idle' ? '' : copyLabels[state]"
                    />
                    <BaseIconButton
                        :label="copyLabels[state]"
                        :icon="copyIcons[state]"
                        @click="copy(fullLink)"
                    />
                </template>
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
