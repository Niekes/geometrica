<script setup lang="ts" generic="T extends string | boolean">
import { useId } from 'vue';

defineProps<{
    legend: string;
    options: { value: T; label: string }[];
    // for a group whose options speak for themselves, the legend is only read out
    hideLegend?: boolean;
}>();

const model = defineModel<T>({ required: true });

// a name per group, so the arrow keys stay inside it
const name = useId();
</script>

<template>
    <fieldset class="flex flex-col gap-1">
        <legend :class="hideLegend ? 'sr-only' : 'mb-1 text-xs'" v-text="legend" />
        <!-- a label.tab hides its radio and marks itself active and focused once the radio is -->
        <div class="tabs tabs-box tabs-xs">
            <label v-for="option in options" :key="String(option.value)" class="tab flex-1 gap-1">
                <input v-model="model" type="radio" :name="name" :value="option.value" />
                <slot :option="option">{{ option.label }}</slot>
            </label>
        </div>
    </fieldset>
</template>
