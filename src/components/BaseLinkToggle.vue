<script setup lang="ts">
import { LinkIcon, LinkSlashIcon } from '@heroicons/vue/24/outline';

defineProps<{
    heading: string;
    label: string;
}>();

const linked = defineModel<boolean>({ required: true });
</script>

<template>
    <div class="flex items-center justify-between">
        <span class="text-xs font-semibold" v-text="heading" />
        <button
            type="button"
            class="btn btn-ghost btn-xs btn-square"
            :aria-label="label"
            :aria-pressed="linked"
            :title="label"
            @click="linked = !linked"
        >
            <LinkIcon v-if="linked" class="size-4" />
            <LinkSlashIcon v-else class="size-4" />
        </button>
    </div>
</template>
