<script lang="ts">
import { reactive } from 'vue';

// the panel remounts for every layer, so the open sections live outside of it
const openSections = reactive<Record<string, boolean>>({});
</script>

<script setup lang="ts">
// every section starts closed
const props = defineProps<{
    title: string;
}>();

function onToggle(event: Event) {
    openSections[props.title] = (event.target as HTMLDetailsElement).open;
}
</script>

<template>
    <details
        class="collapse collapse-arrow rounded-none border-b border-base-300"
        :open="openSections[title]"
        @toggle="onToggle"
    >
        <summary class="collapse-title text-sm font-semibold" v-text="title" />

        <div class="collapse-content flex flex-col gap-3">
            <slot />
        </div>
    </details>
</template>
