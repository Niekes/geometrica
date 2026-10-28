<script setup lang="ts">
import type { Component } from 'vue';

// the label names the action for screen readers and as a tooltip; disabled, aria-pressed and
// click handlers fall through to the button
defineProps<{
    label: string;
    icon: Component;
}>();
</script>

<template>
    <button type="button" class="btn btn-ghost btn-xs btn-square" :aria-label="label" :title="label">
        <component :is="icon" class="size-4" />
    </button>
</template>
