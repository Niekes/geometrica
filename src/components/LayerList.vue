<script setup lang="ts">
import type { Layer } from '@/types/Layer';

import {
    EyeIcon,
    EyeSlashIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    Square2StackIcon,
    TrashIcon
} from '@heroicons/vue/24/outline';

const props = defineProps<{
    layers: Layer[];
    selectedId: string;
}>();

const emit = defineEmits<{
    (e: 'select', id: string): void;
    (e: 'add'): void;
    (e: 'duplicate', id: string): void;
    (e: 'remove', id: string): void;
    (e: 'move', id: string, direction: -1 | 1): void;
    (e: 'toggle-visibility', id: string): void;
}>();
</script>

<template>
    <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase opacity-60">Layers</span>
            <button class="btn btn-xs btn-primary" @click="emit('add')">Add Layer</button>
        </div>

        <ul class="flex flex-col gap-1">
            <li
                v-for="(layer, index) in props.layers"
                :key="layer.id"
                class="flex items-center gap-1 rounded-lg px-1 py-1"
                :class="{ 'bg-primary/20': layer.id === props.selectedId }"
            >
                <button
                    class="btn btn-xs btn-square btn-ghost"
                    :title="layer.visible ? 'Hide layer' : 'Show layer'"
                    @click="emit('toggle-visibility', layer.id)"
                >
                    <EyeSlashIcon v-if="!layer.visible" class="size-3.5" />
                    <EyeIcon v-else class="size-3.5" />
                </button>

                <button
                    class="btn btn-xs flex-1 justify-start px-2"
                    :class="{ 'opacity-40': !layer.visible }"
                    @click="emit('select', layer.id)"
                >
                    {{ layer.name }}
                </button>

                <button
                    class="btn btn-xs btn-square btn-ghost"
                    :disabled="index === 0"
                    title="Move up"
                    @click="emit('move', layer.id, -1)"
                >
                    <ArrowUpIcon class="size-3.5" />
                </button>
                <button
                    class="btn btn-xs btn-square btn-ghost"
                    :disabled="index === props.layers.length - 1"
                    title="Move down"
                    @click="emit('move', layer.id, 1)"
                >
                    <ArrowDownIcon class="size-3.5" />
                </button>
                <button
                    class="btn btn-xs btn-square btn-ghost"
                    title="Duplicate"
                    @click="emit('duplicate', layer.id)"
                >
                    <Square2StackIcon class="size-3.5" />
                </button>
                <button
                    class="btn btn-xs btn-square btn-ghost"
                    :disabled="props.layers.length <= 1"
                    title="Delete"
                    @click="emit('remove', layer.id)"
                >
                    <TrashIcon class="size-3.5" />
                </button>
            </li>
        </ul>
    </div>
</template>
