<script setup lang="ts">
import { BbDigitalRain, BbStarTrail } from 'beautiful-backgrounds';
import { ref } from 'vue';

const hueStart = ref<number>(60);
const hueEnd = ref<number>(150);
const fontSize = ref<number>(30);

window.setInterval(() => {
    hueStart.value = getRandomIntInclusive(0, 180);
    hueEnd.value = getRandomIntInclusive(180, 360);
    fontSize.value = getRandomIntInclusive(5, 30);
}, 3000);

function getRandomIntInclusive(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}
</script>

<template>
    <div class="about">
        <bb-digital-rain
            :data-font-color-hue-start="hueStart"
            :data-font-color-hue-end="hueEnd"
            :data-font-size="fontSize"
        />
    </div>
</template>

<style scoped>
.about {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
