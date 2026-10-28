<script setup lang="ts">
import { ref, watch } from 'vue';

// prose reads best at daisyUI's own width, a grid of images wants the room
defineProps<{ wide?: boolean }>();

const isOpen = defineModel<boolean>({ default: false });
const dialog = ref<HTMLDialogElement | null>(null);

watch(isOpen, (newVal) => {
    if (!dialog.value) return;
    if (newVal) {
        if (!dialog.value.open) dialog.value.showModal();
    } else {
        if (dialog.value.open) dialog.value.close();
    }
});

const close = () => {
    isOpen.value = false;
};
</script>

<template>
    <dialog ref="dialog" class="modal backdrop-blur-sm" @close="close">
        <div
            class="modal-box flex max-h-[85dvh] flex-col"
            :class="{ 'w-11/12 max-w-5xl': wide }"
        >
            <h3 class="text-lg font-bold">
                <slot name="title" />
            </h3>

            <!-- -mx-1 px-1 and scroll-py-12 keep focus rings clear of the edges and the fade -->
            <div class="scroll-mask-y -mx-1 min-h-0 scroll-py-12 overflow-y-auto px-1 py-4">
                <slot />
            </div>

            <div class="modal-action">
                <slot name="actions">
                    <form method="dialog">
                        <!-- if there is a button in form, it will close the modal -->
                        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                            ✕
                        </button>
                    </form>
                </slot>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button @click="close">close</button>
        </form>
    </dialog>
</template>

<style scoped>
/* fades the top and bottom edge only while there is more to scroll in that direction */
@property --scroll-mask-t {
    syntax: '<length>';
    inherits: false;
    initial-value: 0px;
}

@property --scroll-mask-b {
    syntax: '<length>';
    inherits: false;
    initial-value: 0px;
}

@supports (animation-timeline: scroll()) {
    .scroll-mask-y {
        mask-image: linear-gradient(
            to bottom,
            transparent,
            #000 var(--scroll-mask-t),
            #000 calc(100% - var(--scroll-mask-b)),
            transparent
        );
        animation: scroll-mask-y linear both;
        animation-timeline: scroll(self block);
    }
}

@keyframes scroll-mask-y {
    0% {
        --scroll-mask-t: 0rem;
        --scroll-mask-b: 3rem;
    }
    10% {
        --scroll-mask-t: 3rem;
    }
    90% {
        --scroll-mask-b: 3rem;
    }
    100% {
        --scroll-mask-t: 3rem;
        --scroll-mask-b: 0rem;
    }
}
</style>
