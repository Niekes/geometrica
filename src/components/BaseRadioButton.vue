<script setup lang="ts">
type Option = {
    value: string | boolean;
    label: string;
};

const props = defineProps<{
    options: Option[];
    modelValue: string | boolean;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: string | boolean): void;
}>();

const onChange = (value: string | boolean) => {
    emit('update:modelValue', value);
};
</script>

<template>
    <div class="flex flex-col gap-2">
        <label
            v-for="opt in options"
            :key="opt.value.toString()"
            class="inline-flex items-center gap-2 cursor-pointer"
        >
            <input
                type="radio"
                class="radio radio-sm"
                :value="opt.value"
                :checked="modelValue === opt.value"
                @change="onChange(opt.value)"
            />
            <span>{{ opt.label }}</span>
        </label>
    </div>
</template>
