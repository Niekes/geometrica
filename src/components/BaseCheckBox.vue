<script setup lang="ts">
type Option = {
    value: string | boolean;
    label: string;
};

const props = defineProps<{
    options: Option[];
    modelValue: string | boolean | (string | boolean)[];
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: string | boolean | (string | boolean)[]): void;
}>();

const onChange = (value: string | boolean) => {
    if (Array.isArray(props.modelValue)) {
        const newVal = props.modelValue.includes(value)
            ? props.modelValue.filter((v) => v !== value)
            : [...props.modelValue, value];
        emit('update:modelValue', newVal);
    } else {
        emit('update:modelValue', value);
    }
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
                type="checkbox"
                class="checkbox checkbox-sm"
                :checked="
                    Array.isArray(modelValue)
                        ? modelValue.includes(opt.value)
                        : modelValue === opt.value
                "
                @change="onChange(opt.value)"
            />
            <span>{{ opt.label }}</span>
        </label>
    </div>
</template>
