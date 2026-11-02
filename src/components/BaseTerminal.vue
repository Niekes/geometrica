<script setup lang="ts">
import { useCopy } from '@/composables/useCopy';

defineProps<{
    prefix: string;
    code: string;
}>();

// the prefix is CSS, so the clipboard gets the bare code
const { state, copy } = useCopy();
const copyLabels = { idle: 'Copy', copied: 'Copied', failed: 'Copy failed' };
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
            @click="copy(code)"
            v-text="copyLabels[state]"
        />
    </div>
</template>
