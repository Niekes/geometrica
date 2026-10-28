<script setup lang="ts">
import { LinkIcon, LinkSlashIcon } from '@heroicons/vue/24/outline';
import BaseIconButton from '@/components/BaseIconButton.vue';

defineProps<{
    heading: string;
    label: string;
}>();

const linked = defineModel<boolean>({ required: true });
</script>

<template>
    <div class="flex items-center justify-between">
        <span class="text-xs font-semibold" v-text="heading" />
        <BaseIconButton
            :label="label"
            :icon="linked ? LinkIcon : LinkSlashIcon"
            :aria-pressed="linked"
            @click="linked = !linked"
        />
    </div>
</template>
