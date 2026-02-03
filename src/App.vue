<script setup lang="ts">
import { RouterView } from 'vue-router';
import Navbar from './components/Navbar.vue';
</script>

<template>
    <Navbar />
    <RouterView v-slot="{ Component, route }">
        <KeepAlive>
            <component :is="Component" :key="route.path" />
        </KeepAlive>
    </RouterView>
</template>
