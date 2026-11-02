import { ref } from 'vue';

// a missing clipboard (an insecure page) throws inside the try and reads as failed, like a refusal
export function useCopy() {
    const state = ref<'idle' | 'copied' | 'failed'>('idle');

    async function copy(text: string) {
        try {
            await navigator.clipboard.writeText(text);
            state.value = 'copied';
        } catch {
            state.value = 'failed';
        }

        setTimeout(() => (state.value = 'idle'), 2000);
    }

    return { state, copy };
}
