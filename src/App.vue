<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
    <RouterView v-slot="{ Component, route }">
        <KeepAlive>
            <component :is="Component" :key="route.path" />
        </KeepAlive>
    </RouterView>
</template>
