<script setup lang="ts">
import { ref } from 'vue';

import { ChevronDownIcon } from '@heroicons/vue/24/outline';

const open = ref(false);

const toggle = () => {
    open.value = !open.value;
};
</script>

<template>
    <div class="accordion bg-base-100 border border-gray-300 dark:border-gray-950 p-3 rounded-md">
        <!-- Header / Title -->
        <div
            class="accordion-header cursor-pointer select-none flex justify-between items-center font-semibold"
            @click="toggle"
        >
            <slot name="title" />
            <!-- Arrow -->
            <ChevronDownIcon
                class="transition-transform duration-300 size-4"
                :class="{ 'rotate-180': open }"
            />
        </div>

        <!-- Content -->
        <div
            class="accordion-grid grid grid-rows-[0fr] transition-[grid-template-rows] pt-0 duration-500 ease-in-out overflow-hidden"
            :class="{ 'grid-rows-[1fr]': open }"
        >
            <div
                class="accordion-inner overflow-hidden transition-[padding] flex flex-col gap-2"
                :class="{ 'pt-4': open }"
            >
                <slot name="content" />
            </div>
        </div>
    </div>
</template>
