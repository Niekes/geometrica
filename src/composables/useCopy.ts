import { ref } from 'vue';

// a missing clipboard (an insecure page) throws inside the try and reads as failed, like a refusal
export function useCopy() {
    const state = ref<'idle' | 'copied' | 'failed'>('idle');
    let reset: ReturnType<typeof setTimeout> | undefined;

    async function copy(text: string) {
        try {
            await navigator.clipboard.writeText(text);
            state.value = 'copied';
        } catch {
            state.value = 'failed';
        }

        // a copy within the two seconds starts them anew
        clearTimeout(reset);
        reset = setTimeout(() => (state.value = 'idle'), 2000);
    }

    return { state, copy };
}
