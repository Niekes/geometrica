<script setup lang="ts">
import { RouterView } from 'vue-router';
import TheNavbar from './components/TheNavbar.vue';
</script>

<template>
    <TheNavbar />
    <RouterView v-slot="{ Component, route }">
        <KeepAlive>
            <component :is="Component" :key="route.path" />
        </KeepAlive>
    </RouterView>
</template>
