<script setup lang="ts">
import { nextTick, ref } from 'vue';
import type { Layer } from '@/types/Layer';
import { layerNameMaxLength, maxLayers } from '@/config/defaults';

import BaseIconButton from '@/components/BaseIconButton.vue';

import {
    EyeIcon,
    EyeSlashIcon,
    ArrowUpIcon,
    ArrowDownIcon,
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
    (e: 'rename', id: string, name: string): void;
}>();

const renamingId = ref<string | null>(null);

// select() focuses the field and marks the old name for overtyping
const vSelectText = { mounted: (input: HTMLInputElement) => input.select() };

function startRename(id: string) {
    emit('select', id);
    renamingId.value = id;
}

function finishRename(event: Event, save: boolean) {
    const id = renamingId.value;

    // while an input method composes, Enter and Escape belong to the composition; Safari ends it
    // before the confirming Enter and marks only that key's code
    const composing =
        event instanceof KeyboardEvent && (event.isComposing || event.keyCode === 229);

    // removing the field after Enter or Escape blurs it once more
    if (!id || composing) return;

    renamingId.value = null;
    if (save) emit('rename', id, (event.target as HTMLInputElement).value);

    if (event.type !== 'keydown') return;

    // the field is gone, so the keyboard picks up at the layer again; Enter must not click it
    event.preventDefault();
    nextTick(() => document.getElementById(`layer-${id}`)?.focus());
}
</script>

<template>
    <section class="flex flex-col gap-1 p-2" aria-label="Layers">
        <div class="flex items-center gap-1">
            <h2 class="flex-1 px-1 text-sm font-semibold">Layers</h2>
            <BaseIconButton
                label="Add layer"
                :icon="PlusIcon"
                :disabled="props.layers.length >= maxLayers"
                @click="emit('add')"
            />
            <BaseIconButton
                label="Duplicate layer"
                :icon="Square2StackIcon"
                :disabled="props.layers.length >= maxLayers"
                @click="emit('duplicate', props.selectedId)"
            />
            <BaseIconButton
                label="Delete layer"
                :icon="TrashIcon"
                :disabled="props.layers.length <= 1"
                @click="emit('remove', props.selectedId)"
            />
        </div>

        <ul class="flex flex-col gap-0.5">
            <li
                v-for="(layer, index) in props.layers"
                :key="layer.id"
                class="flex items-center gap-0.5 rounded-field"
                :class="{ 'bg-primary/15': layer.id === props.selectedId }"
            >
                <BaseIconButton
                    :label="layer.visible ? `Hide ${layer.name}` : `Show ${layer.name}`"
                    :icon="layer.visible ? EyeIcon : EyeSlashIcon"
                    @click="emit('toggle-visibility', layer.id)"
                />

                <input
                    v-if="renamingId === layer.id"
                    v-select-text
                    type="text"
                    class="input input-xs min-w-0 flex-1"
                    :aria-label="`Name of ${layer.name}`"
                    :value="layer.name"
                    :maxlength="layerNameMaxLength"
                    @keydown.enter="finishRename($event, true)"
                    @keydown.esc="finishRename($event, false)"
                    @blur="finishRename($event, true)"
                />
                <button
                    v-else
                    :id="`layer-${layer.id}`"
                    type="button"
                    class="btn btn-xs btn-ghost min-w-0 flex-1 justify-start px-1 font-normal"
                    :class="{ 'text-base-content/50 line-through': !layer.visible }"
                    :aria-current="layer.id === props.selectedId"
                    @click="emit('select', layer.id)"
                    @dblclick="startRename(layer.id)"
                    @keydown.f2="startRename(layer.id)"
                >
                    <span class="truncate" v-text="layer.name" />
                </button>

                <BaseIconButton
                    :label="`Move ${layer.name} up`"
                    :icon="ArrowUpIcon"
                    :disabled="index === 0"
                    @click="emit('move', layer.id, -1)"
                />
                <BaseIconButton
                    :label="`Move ${layer.name} down`"
                    :icon="ArrowDownIcon"
                    :disabled="index === props.layers.length - 1"
                    @click="emit('move', layer.id, 1)"
                />
            </li>
        </ul>
    </section>
</template>
