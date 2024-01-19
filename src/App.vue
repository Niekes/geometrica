<script setup lang="ts">
import { RouterView } from 'vue-router';
import { NiekesFooter, NiekesNavbar, NiekesIconGeometricaLogo, NiekesScrollToTop } from '@niekes/lib';

import '@niekes/lib/dist/styles.css';

const appName: string = import.meta.env.VITE_APP_NAME;
const appDescription: string = import.meta.env.VITE_APP_DESCRIPTION;
</script>

<template>
    <niekes-navbar :name="appName" :description="appDescription">
        <!-- eslint-disable-next-line vue/no-deprecated-slot-attribute -->
        <niekes-icon-geometrica-logo slot="logo"></niekes-icon-geometrica-logo>
    </niekes-navbar>
    <RouterView />
    <niekes-footer></niekes-footer>
    <niekes-scroll-to-top></niekes-scroll-to-top>
</template>
