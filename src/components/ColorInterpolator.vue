<script setup lang="ts">
import { computed, useId, useTemplateRef } from 'vue';
import { ChevronDownIcon } from '@heroicons/vue/24/outline';
import { colorInterPolators } from '../config/colorInterPolators';
import { type ColorInterPolator } from '../types/ColorInterPolators';

const model = defineModel<ColorInterPolator>({ required: true });

const id = useId();
const list = useTemplateRef<HTMLElement>('list');

const STOPS = 32;

function ramp(fn: (t: number) => string): string {
    const stops = Array.from({ length: STOPS + 1 }, (_, i) => fn(i / STOPS));

    return `linear-gradient(to right, ${stops.join(', ')})`;
}

// d3 names a ramp after its function: interpolateCubehelixDefault reads Cubehelix
const rampName = (name: string) => name.replace(/^interpolate/, '').replace(/Default$/, '');

const active = computed(
    () => colorInterPolators.find(({ name }) => name === model.value) ?? colorInterPolators[0]!
);

function choose(name: ColorInterPolator) {
    model.value = name;
    // jsdom has no popover API
    list.value?.hidePopover?.();
}
</script>

<template>
    <div class="flex flex-col gap-1">
        <span :id="`${id}-label`" class="text-xs">Color ramp</span>
        <button
            type="button"
            class="btn btn-sm justify-start gap-2 px-2 font-normal"
            :aria-labelledby="`${id}-label ${id}-value`"
            :popovertarget="`${id}-list`"
            :style="{ anchorName: `--${id}` }"
        >
            <span class="h-4 flex-1 rounded-selector" :style="{ background: ramp(active.fn) }" />
            <span
                :id="`${id}-value`"
                class="w-24 truncate text-left"
                v-text="rampName(active.name)"
            />
            <ChevronDownIcon class="size-4" />
        </button>

        <div
            :id="`${id}-list`"
            ref="list"
            popover
            class="dropdown max-h-96 w-72 overflow-y-auto rounded-box border border-base-300 bg-base-100 p-1 shadow-lg"
            :style="{ positionAnchor: `--${id}` }"
        >
            <button
                v-for="interpolator in colorInterPolators"
                :key="interpolator.name"
                type="button"
                class="flex w-full items-center gap-2 rounded-field px-2 py-1.5 hover:bg-base-200 focus-visible:outline-2 aria-pressed:bg-base-200 aria-pressed:font-semibold"
                :aria-pressed="interpolator.name === model"
                @click="choose(interpolator.name)"
            >
                <span
                    class="h-4 flex-1 rounded-selector"
                    :style="{ background: ramp(interpolator.fn) }"
                />
                <span
                    class="w-24 truncate text-left text-xs"
                    v-text="rampName(interpolator.name)"
                />
            </button>
        </div>
    </div>
</template>
