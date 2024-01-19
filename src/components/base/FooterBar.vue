<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
    <footer class="footerbar">
        <div>&copy; niekes.com</div>
        <small>Improving the web since 2013</small>
        <!-- <RouterLink class="link-1" to="/">Home</RouterLink>
        <RouterLink class="link-2" to="/about">About</RouterLink> -->
    </footer>
</template>

<style scoped>
.footerbar {
    backdrop-filter: blur(15px);
    background-color: var(--black-10);
    border-top: var(--border-black);
    color: var(--white-50);
    text-shadow: var(--text-shadow);
    display: flex;
    font-size: var(--font-size-sm);
    align-items: center;
    justify-content: center;
    width: 100%;
    height: var(--footerbar-height);
}

.footerbar a.router-link-exact-active {
    color: var(--link-color);
}
</style>
