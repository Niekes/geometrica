<script setup lang="ts">
import { ArrowUturnLeftIcon, ArrowUturnRightIcon } from '@heroicons/vue/24/outline';
import BaseIconButton from './BaseIconButton.vue';

defineProps<{
    canUndo: boolean;
    canRedo: boolean;
}>();

const emit = defineEmits<{ undo: []; redo: [] }>();

// the tooltip names the shortcut the way the keyboard in front of the person labels it
const mod = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl+';
const shift = mod === '⌘' ? '⇧⌘' : 'Ctrl+Shift+';
</script>

<template>
    <div class="flex gap-1">
        <BaseIconButton
            :label="`Undo (${mod}Z)`"
            :icon="ArrowUturnLeftIcon"
            :disabled="!canUndo"
            aria-keyshortcuts="Meta+Z Control+Z"
            @click="emit('undo')"
        />
        <BaseIconButton
            :label="`Redo (${shift}Z)`"
            :icon="ArrowUturnRightIcon"
            :disabled="!canRedo"
            aria-keyshortcuts="Meta+Shift+Z Control+Shift+Z Control+Y"
            @click="emit('redo')"
        />
    </div>
</template>
