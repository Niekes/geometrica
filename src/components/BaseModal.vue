<script setup lang="ts">
import { ref, watch } from 'vue';

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
        <div class="modal-box w-11/12 max-w-5xl">
            <h3 class="text-lg font-bold">
                <slot name="title">Modal Title</slot>
            </h3>

            <div class="py-4">
                <slot>
                    <p>Modal content goes here.</p>
                </slot>
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
