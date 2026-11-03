import { computed, ref } from 'vue';
import { useClipboard, useTimeoutFn } from '@vueuse/core';

// a missing clipboard (an insecure page) reads as failed, like a refusal
export function useCopy() {
    // copied flips back on its own two seconds after the last copy
    const { copy: write, copied, isSupported } = useClipboard({ copiedDuring: 2000, legacy: false });
    const refused = ref(false);
    const forgetRefusal = useTimeoutFn(() => (refused.value = false), 2000, { immediate: false });

    const state = computed<'idle' | 'copied' | 'failed'>(() =>
        refused.value ? 'failed' : copied.value ? 'copied' : 'idle'
    );

    async function copy(text: string) {
        refused.value = false;

        if (!isSupported.value) return refuse();

        try {
            await write(text);
        } catch {
            refuse();
        }
    }

    function refuse() {
        refused.value = true;
        forgetRefusal.start();
    }

    return { state, copy, isSupported };
}
