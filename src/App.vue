<script setup lang="ts">
import { RouterView } from 'vue-router';
import { NiekesFooter, NiekesNavbar, NiekesScrollToTop } from '@niekes/lib';

const appName: string = import.meta.env.VITE_APP_NAME;
const appDescription: string = import.meta.env.VITE_APP_DESCRIPTION;
</script>

<template>
    <niekes-navbar :name="appName" :description="appDescription">
        <img :src="'/android-chrome-512x512.png'" slot="logo" alt="Geometrica Logo" />
    </niekes-navbar>
    <RouterView />
    <niekes-footer></niekes-footer>
    <niekes-scroll-to-top></niekes-scroll-to-top>
</template>
