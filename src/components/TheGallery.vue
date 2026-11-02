<script setup lang="ts">
import BaseModal from './BaseModal.vue';
import GalleryCard from './GalleryCard.vue';
import { gallery } from '@/config/gallery';

const showGallery = defineModel<boolean>({ default: false });
</script>

<template>
    <BaseModal v-model="showGallery">
        <template #title>Gallery</template>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <GalleryCard
                v-for="artwork in gallery"
                :key="artwork.name"
                :link="artwork.link"
                :name="artwork.name"
            />
        </div>
    </BaseModal>
</template>
