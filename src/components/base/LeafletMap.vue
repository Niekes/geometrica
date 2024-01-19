<script setup lang="ts">
import 'leaflet/dist/leaflet.css';
import iconUrl from '@/assets/svg/marker.svg';
import { onMounted, onUpdated } from 'vue';
import L, { type Map, type LatLngExpression, type Marker, type Icon } from 'leaflet';

const props = defineProps<{
    coords: LatLngExpression | [typeof NaN, typeof NaN];
}>();

let map: Map;
let marker: Marker;

const icon: Icon = L.icon({
    iconUrl: iconUrl,
    iconSize: [60, 60], // size of the icon
    iconAnchor: [27, 53] // point of the icon which will correspond to marker's location
});

onUpdated(() => {
    if (props.coords.toString() === 'NaN,NaN') return;

    if (!marker) {
        marker = L.marker(props.coords, { icon: icon }).addTo(map);
    }

    map.flyTo(props.coords, 15);
});

onMounted(() => {
    map = L.map('map').fitWorld();

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        detectRetina: true,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">osm</a>'
    }).addTo(map);
});
</script>

<template>
    <div id="map"></div>
</template>

<style scoped>
#map {
    border-radius: var(--border-radius);
    background-color: var(--grey-50);
    height: 220px;
    width: 220px;
}
</style>

<style>
#map > div.leaflet-control-container > div.leaflet-bottom.leaflet-right {
    display: none;
}
</style>
