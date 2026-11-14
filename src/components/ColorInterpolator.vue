<script setup lang="ts">
import { computed, nextTick, ref, useId, useTemplateRef, watch } from 'vue';
import { CheckIcon, ChevronDownIcon } from '@heroicons/vue/24/outline';
import { colorInterPolators, defaultColorInterPolator } from '../config/colorInterPolators';
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
    .map(({ name, fn }) => ({ name, label: rampName(name), background: ramp(fn) }))
    .sort((a, b) => a.label.localeCompare(b.label, 'en', { sensitivity: 'base' }));

const query = ref('');
const matches = computed(() => {
    const needle = query.value.trim().toLowerCase();

    return sorted.filter(({ label }) => label.toLowerCase().includes(needle));
});

// the keyboard and the mouse move one highlight through the matches
const highlight = ref(0);
const optionId = (name: string) => `${id}-${name}`;
const highlighted = computed(() => matches.value[highlight.value]);

const active = computed(
    () => colorInterPolators.find(({ name }) => name === model.value) ?? defaultColorInterPolator
);
const activeBackground = computed(() => ramp(active.value.fn));

function moveTo(index: number) {
    highlight.value = index;
    // jsdom has no scrollIntoView
    nextTick(() =>
        list.value?.querySelector('.menu-active')?.scrollIntoView?.({ block: 'nearest' })
    );
}

function choose(name: ColorInterPolator) {
    model.value = name;
    // jsdom has no popover API
    list.value?.hidePopover?.();
}

watch(query, () => moveTo(0));

function onKeydown(event: KeyboardEvent) {
    const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];

    if (step) {
        event.preventDefault();
        moveTo(Math.min(Math.max(highlight.value + step, 0), matches.value.length - 1));
    } else if (event.key === 'Enter') {
        // closing hands focus back to the trigger, which the same Enter would press and reopen
        event.preventDefault();
        if (highlighted.value) choose(highlighted.value.name);
    } else if (event.key === 'Tab') {
        // focus returns to the trigger, so Tab moves on from there
        list.value?.hidePopover?.();
    }
}

function onToggle(event: Event) {
    if ((event as ToggleEvent).newState === 'closed') query.value = '';
    else
        moveTo(
            Math.max(
                0,
                matches.value.findIndex(({ name }) => name === model.value)
            )
        );
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
            <span class="h-4 flex-1 rounded-selector" :style="{ background: activeBackground }" />
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
            class="dropdown rounded-box border border-base-300 bg-base-100 shadow-lg"
            :style="{ positionAnchor: `--${id}`, width: 'anchor-size(width)' }"
            @toggle="onToggle"
        >
            <!-- showPopover() focuses an autofocus descendant -->
            <input
                v-model="query"
                type="search"
                role="combobox"
                autofocus
                aria-expanded="true"
                aria-autocomplete="list"
                :aria-controls="`${id}-options`"
                :aria-activedescendant="highlighted && optionId(highlighted.name)"
                @keydown="onKeydown"
                class="input input-sm m-2 w-[calc(100%-1rem)]"
                placeholder="Search color interpolators"
                aria-label="Search color interpolators"
            />
            <p v-if="!matches.length" class="px-4 pb-3 text-sm opacity-60">No color interpolator</p>
            <!-- flex-nowrap makes the long menu scroll instead of wrapping into a second column -->
            <ul
                :id="`${id}-options`"
                role="listbox"
                aria-label="Color interpolators"
                class="menu menu-sm max-h-80 w-full flex-nowrap overflow-y-auto"
            >
                <li
                    v-for="(interpolator, index) in matches"
                    :id="optionId(interpolator.name)"
                    :key="interpolator.name"
                    role="option"
                    :aria-selected="interpolator.name === model"
                    @click="choose(interpolator.name)"
                    @mousemove="highlight = index"
                >
                    <!-- a menu item is a grid whose second column fills the width, so the ramp goes there -->
                    <div :class="{ 'menu-active': index === highlight }">
                        <span class="w-24 truncate" v-text="interpolator.label" />
                        <span
                            class="h-4 rounded-selector"
                            :style="{ background: interpolator.background }"
                        />
                        <CheckIcon
                            class="size-4"
                            :class="{ invisible: interpolator.name !== model }"
                        />
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>
