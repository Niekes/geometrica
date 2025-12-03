<script setup lang="ts">
import { nextTick, onMounted, ref, type Ref } from 'vue';
import RectControl from '../components/RectControl.vue';
import CircleControl from '../components/CircleControl.vue';
import PolygonControl from '../components/PolygonControl.vue';
import { type Rect } from '../types/Rect';
import { type Circle } from '../types/Circle';
import { type Polygon } from '../types/Polygon';
import useRectDrawing from '../composables/rect';
import useCircleDrawing from '../composables/circle';
import usePolygonDrawing from '../composables/polygon';
import { canvasHeight, canvasWidth } from '../config/canvas';

// const PI: number = Math.PI;
// const HALF_PI: number = PI / 2;
const canvas = ref<HTMLCanvasElement | null>(null);
const canvasH = ref<number>(canvasHeight);
const canvasW = ref<number>(canvasWidth);
const ctx = ref<CanvasRenderingContext2D | null>(null);

const shapesOptions: { name: string; value: string }[] = [
    { value: 'rect', name: 'Rectangle' },
    { value: 'circle', name: 'Circle' },
    { value: 'polygon', name: 'Polygon' }
];
const rect = ref<Rect>({
    amount: 16,
    applyColorSchemeToEachShape: false,
    bgBorderRadius: 10,
    bgColor: '#000',
    borderRadiusBl: 0,
    borderRadiusBr: 0,
    borderRadiusTl: 0,
    borderRadiusTr: 0,
    calcOpacity: [],
    calcStrokeWidth: [],
    colorInterPolator: 'interpolateMagma',
    cx: 0,
    cy: 0,
    distance: 32,
    flipColorInterpolator: false,
    height: canvasHeight / 4,
    rotation: 0,
    strokeWidth: 3,
    width: canvasWidth / 4
});

const circle = ref<Circle>({
    amount: 16,
    applyColorSchemeToEachShape: false,
    bgBorderRadius: 10,
    bgColor: '#000',
    calcOpacity: [],
    calcStrokeWidth: [],
    colorInterPolator: 'interpolateMagma',
    cx: 0,
    cy: 0,
    distance: 32,
    flipColorInterpolator: false,
    radiusX: canvasHeight / 4,
    radiusY: canvasWidth / 4,
    rotation: 0,
    strokeWidth: 3
});

const polygon = ref<Polygon>({
    amount: 16,
    applyColorSchemeToEachShape: false,
    bgBorderRadius: 10,
    bgColor: '#000',
    borderRadius: 0,
    calcOpacity: [],
    calcStrokeWidth: [],
    colorInterPolator: 'interpolateMagma',
    cx: 0,
    cy: 0,
    distance: 32,
    flipColorInterpolator: false,
    rotation: 0,
    sides: 5,
    size: canvasHeight / 4,
    strokeWidth: 3
});

const shapes = {
    rect,
    circle,
    polygon
};

const selectedShape = ref<string>('rect'); // config.defaults.shape
const { drawRect } = useRectDrawing(canvas, rect.value);
const { drawCircle } = useCircleDrawing(canvas, circle.value);
const { drawPolygon } = usePolygonDrawing(canvas, polygon.value);

function download() {
    if (canvas.value) {
        const link: HTMLAnchorElement = document.createElement('a');
        const date: Date = new Date();

        link.download = `geometrica-${date.toLocaleDateString()}-${date.toLocaleTimeString()}.png`;
        link.href = canvas.value.toDataURL();
        link.click();
    }
}

async function draw(): Promise<any> {
    await nextTick();

    switch (selectedShape.value) {
        case 'circle':
            // this.canvasBackgroundColor = circle.bgColor;
            // this.canvasBorderRadius = circle.bgBorderRadius;
            drawCircle();
            break;

        case 'polygon':
            // this.canvasBackgroundColor = polygon.bgColor;
            // this.canvasBorderRadius = polygon.bgBorderRadius;
            drawPolygon();
            break;

        default:
            // this.canvasBackgroundColor = rect.bgColor;
            // this.canvasBorderRadius = rect.rect;
            drawRect();
            break;
    }
}

onMounted(() => {
    if (canvas.value) {
        const context = canvas.value.getContext('2d');

        canvas.value.width = canvasW.value;
        canvas.value.height = canvasH.value;

        if (context) {
            ctx.value = context;

            ctx.value.scale(2, 2);
            ctx.value.imageSmoothingEnabled = false;

            draw();
        } else {
            console.error('2D context is not supported.');
        }
    } else {
        console.error('Canvas element not found.');
    }
});
</script>

<template>
    <div class="home grid">
        <div class="bg-base-200 p-4 w-full justify-items-center overflow-scroll">
            <div class="flex items-center justify-center">
                <div class="tabs tabs-box bg-base-300 tabs-xs mb-4">
                    <template v-for="shape in shapesOptions" :key="shape.value">
                        <input
                            :id="shape.value"
                            v-model="selectedShape"
                            name="shape"
                            type="radio"
                            class="tab"
                            :aria-label="shape.name"
                            :value="shape.value"
                            @change="draw"
                        />
                    </template>
                </div>
            </div>

            <div class="control__shapes">
                <RectControl v-if="selectedShape === 'rect'" v-model="rect" @rect-update="draw" />
                <CircleControl
                    v-if="selectedShape === 'circle'"
                    v-model="circle"
                    @circle-update="draw"
                />
                <PolygonControl
                    v-if="selectedShape === 'polygon'"
                    v-model="polygon"
                    @polygon-update="draw"
                />
            </div>

            <button class="btn btn-primary btn-block mt-4" @click="download">Download</button>
        </div>

        <div class="context">
            <canvas
                class="context__canvas shadow-md shadow-black/50"
                ref="canvas"
                :style="{
                    'background-color': '#000',
                    'border-radius': '10%'
                }"
                @contextmenu.prevent.stop
            />
        </div>
    </div>
</template>

<style scoped>
.home {
    --navbar-height: 4rem;

    margin-top: var(--navbar-height);
    height: calc(100vh - var(--navbar-height));
    height: calc(100dvh - var(--navbar-height));
    grid-template-areas: 'control context';
    grid-template-columns: minmax(0, 24rem) 1fr;
    grid-template-rows: minmax(0, 1fr);
}

.control {
    grid-area: control;
}

.control__shapes {
    grid-area: shapes;
}

.context {
    align-items: center;
    display: flex;
    grid-area: context;
    justify-content: center;
}

.context__canvas {
    border: 1px solid var(--niekes-black-10);
    max-height: 75%;
    max-width: 75%;
    aspect-ratio: 1;
}
</style>
