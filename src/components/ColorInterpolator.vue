<script setup lang="ts">
import { computed, ref, useId, useTemplateRef } from 'vue';
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

const sorted = colorInterPolators
    .map((interpolator) => ({ ...interpolator, label: rampName(interpolator.name) }))
    .sort((a, b) => a.label.localeCompare(b.label, 'en', { sensitivity: 'base' }));

const query = ref('');
const matches = computed(() =>
    sorted.filter(({ label }) => label.toLowerCase().includes(query.value.trim().toLowerCase()))
);

const active = computed(
    () => colorInterPolators.find(({ name }) => name === model.value) ?? colorInterPolators[0]!
);

function choose(name: ColorInterPolator) {
    model.value = name;
    // jsdom has no popover API
    list.value?.hidePopover?.();
}

function clearOnClose(event: Event) {
    if ((event as ToggleEvent).newState === 'closed') query.value = '';
}
</script>

<template>
    <div class="flex flex-col gap-1">
        <span :id="`${id}-label`" class="text-xs">Color interpolator</span>
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
            class="dropdown w-72 rounded-box border border-base-300 bg-base-100 shadow-lg"
            :style="{ positionAnchor: `--${id}` }"
            @toggle="clearOnClose"
        >
            <!-- showPopover() focuses an autofocus descendant -->
            <input
                v-model="query"
                type="search"
                autofocus
                @keydown.enter.prevent="matches[0] && choose(matches[0].name)"
                class="input input-sm m-2 w-[calc(100%-1rem)]"
                placeholder="Search color interpolators"
                aria-label="Search color interpolators"
            />
            <!-- flex-nowrap makes the long menu scroll instead of wrapping into a second column -->
            <ul class="menu menu-sm max-h-80 w-full flex-nowrap overflow-y-auto">
                <li v-if="!matches.length" class="menu-disabled">
                    <span>No color interpolator</span>
                </li>
                <li v-for="interpolator in matches" :key="interpolator.name">
                    <!-- a menu item lays out like an icon and a label, so the ramp gets an icon's fixed width -->
                    <button
                        type="button"
                        :aria-current="interpolator.name === model"
                        @click="choose(interpolator.name)"
                    >
                        <span
                            class="h-4 w-36 rounded-selector"
                            :style="{ background: ramp(interpolator.fn) }"
                        />
                        <span class="truncate" v-text="interpolator.label" />
                    </button>
                </li>
            </ul>
        </div>
    </div>
</template>
