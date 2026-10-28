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
        <div class="join w-full">
            <label
                v-for="option in options"
                :key="String(option.value)"
                class="join-item btn btn-sm relative flex-1 gap-1 px-1 font-normal has-focus-visible:z-10 has-focus-visible:outline-2 has-focus-visible:outline-offset-2"
                :class="{ 'btn-primary': model === option.value }"
            >
                <input
                    v-model="model"
                    type="radio"
                    class="sr-only"
                    :name="name"
                    :value="option.value"
                />
                <slot :option="option">{{ option.label }}</slot>
            </label>
        </div>
    </fieldset>
</template>
