<script setup lang="ts">
import type { Component } from 'vue';

// the label names the action for screen readers and as a tooltip; disabled, aria-pressed and
// click handlers fall through to the button. With an href it is a link (target falls through),
// so a new tab, a middle click and the link's context menu work as the browser has them
defineProps<{
    label: string;
    icon: Component;
    href?: string;
}>();
</script>

<template>
    <component
        :is="href ? 'a' : 'button'"
        :type="href ? undefined : 'button'"
        :href="href"
        class="btn btn-ghost btn-xs btn-square"
        :aria-label="label"
        :title="label"
    >
        <component :is="icon" class="size-4" />
    </component>
</template>
