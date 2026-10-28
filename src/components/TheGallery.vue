<script setup lang="ts">
import BaseModal from './BaseModal.vue';
import { galleryLinks } from '@/config/gallery';

const showGallery = defineModel<boolean>({ default: false });

// wherever the app runs: the dev server on any port, GitHub Pages or a fork
const { BASE_URL } = import.meta.env;
</script>

<template>
    <BaseModal v-model="showGallery">
        <template #title>Gallery</template>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <a
                v-for="(link, index) in galleryLinks"
                :key="index"
                :href="`${BASE_URL}?${link}`"
                class="block aspect-square overflow-hidden rounded-artwork bg-neutral"
            >
                <img
                    class="w-full hover:opacity-80"
                    :src="`./gallery/${index}.avif`"
                    :alt="`Open artwork ${index + 1}`"
                />
            </a>
        </div>
    </BaseModal>
</template>
