<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
    prefix: string;
    code: string;
}>();

const copyLabel = ref('Copy');

// the prefix is CSS, so the clipboard gets the bare code
async function copy() {
    try {
        await navigator.clipboard.writeText(props.code);
        copyLabel.value = 'Copied';
    } catch {
        copyLabel.value = 'Copy failed';
    }

    setTimeout(() => (copyLabel.value = 'Copy'), 2000);
}
</script>

<template>
    <!-- the button sits outside the code, so it stays put while a long line scrolls -->
    <div class="relative">
        <div class="mockup-code">
            <pre :data-prefix="prefix"><code v-text="code" /></pre>
        </div>
        <button
            type="button"
            class="btn btn-sm absolute top-2 right-2"
            aria-live="polite"
            @click="copy"
            v-text="copyLabel"
        />
    </div>
</template>
