<script setup lang="ts">
import { ref } from 'vue';

import type { Layer } from '@/types/Layer';

import {
    EyeIcon,
    EyeSlashIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ChevronDownIcon,
    PlusIcon,
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

const isOpen = ref(true);
</script>

<template>
    <section class="flex flex-col gap-1 p-2" aria-label="Layers">
        <div class="flex items-center gap-1">
            <button
                type="button"
                class="btn btn-ghost btn-xs flex-1 justify-start gap-1 px-1 text-sm font-semibold"
                aria-controls="layer-list"
                :aria-expanded="isOpen"
                @click="isOpen = !isOpen"
            >
                <ChevronDownIcon
                    class="size-4 transition-transform"
                    :class="{ '-rotate-90': !isOpen }"
                />
                Layers
            </button>
            <button
                type="button"
                class="btn btn-ghost btn-xs btn-square"
                aria-label="Add layer"
                title="Add layer"
                @click="emit('add')"
            >
                <PlusIcon class="size-4" />
            </button>
            <button
                type="button"
                class="btn btn-ghost btn-xs btn-square"
                aria-label="Duplicate layer"
                title="Duplicate layer"
                @click="emit('duplicate', props.selectedId)"
            >
                <Square2StackIcon class="size-4" />
            </button>
            <button
                type="button"
                class="btn btn-ghost btn-xs btn-square"
                aria-label="Delete layer"
                title="Delete layer"
                :disabled="props.layers.length <= 1"
                @click="emit('remove', props.selectedId)"
            >
                <TrashIcon class="size-4" />
            </button>
        </div>

        <ul v-show="isOpen" id="layer-list" class="flex flex-col gap-0.5">
            <li
                v-for="(layer, index) in props.layers"
                :key="layer.id"
                class="flex items-center gap-0.5 rounded-field"
                :class="{ 'bg-primary/15': layer.id === props.selectedId }"
            >
                <button
                    type="button"
                    class="btn btn-xs btn-square btn-ghost"
                    :aria-label="layer.visible ? `Hide ${layer.name}` : `Show ${layer.name}`"
                    :title="layer.visible ? 'Hide layer' : 'Show layer'"
                    @click="emit('toggle-visibility', layer.id)"
                >
                    <EyeSlashIcon v-if="!layer.visible" class="size-3.5" />
                    <EyeIcon v-else class="size-3.5" />
                </button>

                <button
                    type="button"
                    class="btn btn-xs btn-ghost min-w-0 flex-1 justify-start px-1 font-normal"
                    :class="{ 'text-base-content/50 line-through': !layer.visible }"
                    :aria-current="layer.id === props.selectedId"
                    @click="emit('select', layer.id)"
                >
                    <span class="truncate" v-text="layer.name" />
                </button>

                <button
                    type="button"
                    class="btn btn-xs btn-square btn-ghost"
                    :disabled="index === 0"
                    :aria-label="`Move ${layer.name} up`"
                    title="Move up"
                    @click="emit('move', layer.id, -1)"
                >
                    <ArrowUpIcon class="size-3.5" />
                </button>
                <button
                    type="button"
                    class="btn btn-xs btn-square btn-ghost"
                    :disabled="index === props.layers.length - 1"
                    :aria-label="`Move ${layer.name} down`"
                    title="Move down"
                    @click="emit('move', layer.id, 1)"
                >
                    <ArrowDownIcon class="size-3.5" />
                </button>
            </li>
        </ul>
    </section>
</template>
