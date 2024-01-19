<script setup lang="ts">
import { NiekesInputRange } from '@niekes/lib';
</script>

<template>
    <div class="rect-control">
        <niekes-input-range
            :min="2"
            :max="1000"
            :value="100"
            :step="1"
            :label="'Amount'"
        ></niekes-input-range>
        <niekes-input-range
            :min="-64"
            :max="64"
            :value="0"
            :step="0.1"
            :label="'Distance'"
        ></niekes-input-range>
    </div>
</template>

<style scoped>
.rect-control {
    display: flex;
    flex-direction: column;
}
</style>
