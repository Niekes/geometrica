<script lang="ts">
import { reactive } from 'vue';

// the panel remounts for every layer, so the open sections live outside of it
const openSections = reactive<Record<string, boolean>>({});
</script>

<script setup lang="ts">
import { ChevronDownIcon } from '@heroicons/vue/24/outline';

const props = defineProps<{
    title: string;
    open?: boolean;
}>();

openSections[props.title] ??= props.open ?? false;

function onToggle(event: Event) {
    openSections[props.title] = (event.target as HTMLDetailsElement).open;
}
</script>

<template>
    <details class="group border-b border-base-300" :open="openSections[title]" @toggle="onToggle">
        <summary
            class="flex cursor-pointer list-none items-center justify-between rounded-field py-3 text-sm font-semibold select-none focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden"
        >
            {{ title }}
            <ChevronDownIcon class="size-4 transition-transform group-open:rotate-180" />
        </summary>

        <div class="flex flex-col gap-3 pb-4">
            <slot />
        </div>
    </details>
</template>
