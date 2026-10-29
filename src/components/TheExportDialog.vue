<script setup lang="ts">
import BaseModal from './BaseModal.vue';

const isOpen = defineModel<boolean>({ default: false });
const emit = defineEmits<{ export: [] }>();

// the sponsor ask of the README, carried by the export; the page takes one-off and monthly
const sponsorUrl = 'https://github.com/sponsors/niekes';

// the export leaves the page only here, after the sponsor ask was seen
function exportArtwork() {
    isOpen.value = false;
    emit('export');
}
</script>

<template>
    <BaseModal v-model="isOpen">
        <template #title>Export SVG</template>
        <p class="mb-4">
            Free and open source, kept alive by one maintainer and the people who sponsor the
            work. If Geometrica saves you time, become a sponsor.
        </p>
        <div class="flex flex-wrap gap-2">
            <!-- the GitHub Sponsors pink, tuned through daisyUI's own button variables -->
            <a
                class="btn btn-outline btn-sm [--btn-color:#EA4AAA] [--btn-fg:#fff]"
                :href="sponsorUrl"
                target="_blank"
                rel="noopener"
            >
                Sponsor Geometrica
            </a>
            <button type="button" class="btn btn-primary btn-sm" @click="exportArtwork">
                Export SVG
            </button>
        </div>
    </BaseModal>
</template>
