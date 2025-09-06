<script setup lang="ts">
import { RouterView } from 'vue-router';

const appName: string = import.meta.env.VITE_APP_NAME;
const appDescription: string = import.meta.env.VITE_APP_DESCRIPTION;
</script>

<template>
    <RouterView />
</template>
