<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';
import RectControl from '../components/RectControl.vue';
import CircleControl from '../components/CircleControl.vue';
import PolygonControl from '../components/PolygonControl.vue';
import { type Rect } from '../types/Rect';
import { type Circle } from '../types/Circle';
import { type Polygon } from '../types/Polygon';
import useRectDrawing from '../composables/rect';
import useCircleDrawing from '../composables/circle';
import usePolygonDrawing from '../composables/polygon';
import { NiekesButton } from '@niekes/lib';
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
const rect: Rect = {
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
};

const circle: Circle = {
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
};

const polygon: Polygon = {
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
};

const shapes = {
    rect,
    circle,
    polygon
};

const initRect = Object.assign({}, rect);
const initCircle = Object.assign({}, circle);
const initPolygon = Object.assign({}, polygon);

const selectedShape = ref<string>('rect'); // config.defaults.shape
const { drawRect } = useRectDrawing(canvas, rect);
const { drawCircle } = useCircleDrawing(canvas, circle);
const { drawPolygon } = usePolygonDrawing(canvas, polygon);

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

function download() {
    if (canvas.value) {
        const link: HTMLAnchorElement = document.createElement('a');
        const date: Date = new Date();

        link.download = `geometrica-${date.toLocaleDateString()}-${date.toLocaleTimeString()}.png`;
        link.href = canvas.value.toDataURL();
        link.click();
    }
}

async function draw(event?: CustomEvent<{ name: string; value: any }>): Promise<any> {
    if (!event) return;

    const e = event;

    if (e && e.detail) {
        const propertyName = e.detail.name as never;
        const s = shapes[selectedShape.value as never];

        s[propertyName] = e.detail.value as never;
    }

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
</script>

<template>
    <div class="home">
        <div class="control">
            <div class="control__radio">
                <div v-for="shape in shapesOptions" :key="shape.value" class="radio__wrapper">
                    <input
                        :id="shape.value"
                        v-model="selectedShape"
                        name="shape"
                        type="radio"
                        :value="shape.value"
                        @change="(event) => draw(event as CustomEvent)"
                    />
                    <label :for="shape.value" v-text="shape.name" />
                </div>
            </div>
            <div class="control__shapes">
                <RectControl
                    v-if="selectedShape === 'rect'"
                    :rect="rect"
                    :init-rect="initRect"
                    @rect-update="draw"
                />
                <CircleControl
                    v-if="selectedShape === 'circle'"
                    :circle="circle"
                    :init-circle="initCircle"
                    @circle-update="draw"
                />
                <PolygonControl
                    v-if="selectedShape === 'polygon'"
                    :polygon="polygon"
                    :init-polygon="initPolygon"
                    @polygon-update="draw"
                />
            </div>
            <div class="control__actions">
                <niekes-button text="DOWNLOAD" @click="download"></niekes-button>
            </div>
        </div>
        <div class="context">
            <canvas
                class="context__canvas"
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
    display: grid;
    margin-top: 5rem;
    height: calc(100dvh - 5rem);
    height: calc(100vh - 5rem);
    grid-template-areas: 'control context';
    grid-template-columns: minmax(0, 24rem) 1fr;
    grid-template-rows: minmax(0, 1fr);
}

.control {
    background-color: var(--niekes-primary);
    display: grid;
    gap: 0;
    grid-area: control;
    grid-template-areas: 'radio' 'shapes' 'actions';
    grid-template-columns: 1fr;
    grid-template-rows: min-content 1fr min-content;
    overflow: auto;
    padding: var(--niekes-spacing-md);
}

.control__shapes {
    grid-area: shapes;
}

.shapes__rectangle,
.shapes__circle,
.shapes__polygon {
    width: 100%;
}

.control__actions {
    grid-area: actions;

    button {
        width: 100%;

        &:not(:last-child) {
            margin-bottom: var(--niekes-spacing-md);
        }
    }
}

.control__radio {
    border: var(--niekes-border-width) solid var(--niekes-tertiary);
    border-radius: var(--niekes-border-radius-xs);
    display: flex;
    grid-area: radio;
    overflow: hidden;
}

.radio__wrapper {
    display: flex;
    flex: 1;

    & input {
        display: none;

        & + label {
            background-color: var(--niekes-black-10);
            color: var(--niekes-white-50);
            cursor: pointer;
            display: flex;
            justify-content: center;
            padding: var(--niekes-padding);
            transition:
                background-color 325ms ease-in-out,
                color 325ms ease-in-out;
            width: 100%;

            &:hover {
                background: var(--niekes-primary);
                color: var(--niekes-black);
            }

            svg {
                height: 1rem;
                width: 1rem;
            }
        }

        &:checked + label {
            background-color: var(--niekes-primary);
            color: var(--niekes-black);
            background: linear-gradient(var(--niekes-tertiary), var(--niekes-secondary));
            background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: bold;
            position: relative;

            &::after {
                content: '';
                position: absolute;
                bottom: 0;
                width: 75%;
                left: 0;
                right: 0;
                margin: 0 auto;
                height: 3px;
                border-radius: 2px;
                background: linear-gradient(
                    111.3deg,
                    var(--niekes-tertiary),
                    var(--niekes-secondary)
                );
            }
        }
    }
}

.context {
    align-items: center;
    background-color: var(--niekes-white);
    display: flex;
    grid-area: context;
    justify-content: center;
}

.context__canvas {
    border: 1px solid var(--niekes-black-10);
    box-shadow: var(--niekes-box-shadow);
    max-height: 75%;
    max-width: 75%;
    aspect-ratio: 1;
}

@media (max-width: 1024px) {
    .home {
        grid-template-areas: 'context' 'control';
        grid-template-columns: 1fr;
        grid-template-rows: minmax(0, 2.5fr) minmax(0, 3fr);
    }

    .context {
        border-bottom: var(--niekes-border-width) solid var(--niekes-black-50);
    }

    .context__canvas {
        aspect-ratio: 1;
        max-height: 90%;
        max-width: 90%;
        height: 90%;
    }
}
</style>
