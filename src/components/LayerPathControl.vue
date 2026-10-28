<script setup lang="ts">
// Vue
import { computed, ref } from 'vue';

// Types
import { type Layer } from '@/types/Layer';

// Lib
import { importSvg, type SvgImport } from '@/lib/importSvg';
import { normalizePath } from '@/lib/pathBounds';

const layer = defineModel<Layer>({ required: true });

const isPathValid = computed(() => normalizePath(layer.value.path, layer.value.size) !== null);

const pathImport = ref<SvgImport | null>(null);

// pasted SVG markup is stored as its path data, so the URL never carries the markup; a rejected
// paste keeps the previous path
function onPaste(event: ClipboardEvent) {
    const text = event.clipboardData?.getData('text') ?? '';

    if (!text.trimStart().startsWith('<')) return;

    event.preventDefault();
    pathImport.value = importSvg(text);

    if ('d' in pathImport.value) layer.value.path = pathImport.value.d;
}
</script>

<template>
    <label class="text-xs font-semibold" for="custom-path">SVG Path</label>
    <textarea
        id="custom-path"
        v-model="layer.path"
        class="textarea textarea-xs w-full font-mono"
        rows="3"
        placeholder="M0 0 L100 0 L100 100 L0 100 Z"
        @paste="onPaste"
        @input="pathImport = null"
    />
    <p v-if="pathImport && 'error' in pathImport" class="text-xs text-error">
        {{ pathImport.error }}
    </p>
    <p v-else-if="pathImport" class="text-xs opacity-60">
        Imported {{ pathImport.paths }} path(s){{
            pathImport.ignored ? `, ignored ${pathImport.ignored} other element(s)` : ''
        }}.
    </p>
    <p v-else-if="layer.path && !isPathValid" class="text-xs text-error">
        Invalid path data. Use SVG path syntax, e.g. M, L, C, Q, A, Z.
    </p>
    <p v-else-if="!layer.path" class="text-xs opacity-60">
        Paste an SVG or its path data (d attribute).
    </p>
</template>
