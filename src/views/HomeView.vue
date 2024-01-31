<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';
import config from '../components/config';
import RectControl from '../components/RectControl.vue';
import { type Rect } from '../types/Rect';
import useRectDrawing from '../composables/rect';

const PI: number = Math.PI;
const HALF_PI: number = PI / 2;
const TAU: number = PI * 2;
const canvas = ref<HTMLCanvasElement | null>(null);
const canvasHeight = ref<number>(1024);
const canvasWidth = ref<number>(1024);
const ctx = ref<CanvasRenderingContext2D | null>(null);

const shapes: { name: string }[] = [{ name: 'rect' }, { name: 'circle' }, { name: 'polygon' }];
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
    colorInterPolator: 'interpolateBrBG',
    cx: 0,
    cy: 0,
    distance: 16,
    flipColorInterpolator: false,
    height: 256,
    rotation: 0,
    stroke: true,
    strokeWidth: 3,
    width: 256
};

const selectedShape = ref<string>(config.defaults.shape);
const { drawRect } = useRectDrawing(canvas, rect, canvasWidth.value, canvasHeight.value, PI);

onMounted(() => {
    if (canvas.value) {
        const context = canvas.value.getContext('2d');

        canvas.value.width = canvasWidth.value;
        canvas.value.height = canvasHeight.value;

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

async function draw(event?: CustomEvent<{ name: string; value: any }>): Promise<any> {
    if (!event) return;

    const e = event;

    if (e && e.detail) {
        const propertyName = e.detail.name as keyof typeof rect;

        rect[propertyName] = e.detail.value;
    }

    await nextTick();

    switch (selectedShape.value) {
        case 'circle':
            // this.canvasBackgroundColor = this.circle.bgColor;
            // this.canvasBorderRadius = this.circle.bgBorderRadius;
            // this.drawCircle();
            break;

        case 'polygon':
            // this.canvasBackgroundColor = this.polygon.bgColor;
            // this.canvasBorderRadius = this.polygon.bgBorderRadius;
            // this.drawPolygon();
            break;

        default:
            // this.canvasBackgroundColor = this.rect.bgColor;
            // this.canvasBorderRadius = this.rect.bgBorderRadius;
            drawRect();

            break;
    }
}
</script>

<template>
    <div class="home">
        <div class="control">
            <div class="control__radio">
                <div v-for="shape in shapes" :key="shape.name" class="radio__wrapper">
                    <input
                        :id="shape.name"
                        v-model="selectedShape"
                        name="shape"
                        type="radio"
                        :value="shape.name"
                        @change="(event) => draw(event as CustomEvent)"
                    />
                    <label :for="shape.name" v-text="shape.name" />
                </div>
            </div>
            <div class="control__shapes">
                <RectControl v-if="selectedShape === 'rect'" :rect="rect" @rect-update="draw" />
            </div>
            <div class="control__actions">control__actions</div>
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
    height: calc(100vh - 13rem);
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
    padding: var(--niekes-padding);
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
            margin-bottom: var(--niekes-margin-y);
        }
    }
}

.control__radio {
    border: var(--niekes-border-width) solid var(--niekes-tertiary);
    border-radius: var(--niekes-border-radius-xs);
    display: flex;
    grid-area: radio;
    margin-bottom: var(--niekes-margin-y);
    overflow: hidden;
}

.radio__wrapper {
    display: flex;
    flex: 1;

    input {
        display: none;

        + label {
            background: var(--niekes-secondary);
            color: var(--niekes-white-50);
            cursor: pointer;
            display: flex;
            justify-content: center;
            padding: var(--niekes-padding);
            transition:
                background 50ms ease-in-out,
                color 50ms ease-in-out;
            width: 100%;

            &:hover {
                background: var(--niekes-primary);
                color: var(--niekes-tertiary);
            }

            svg {
                height: 1rem;
                width: 1rem;
            }
        }

        &:checked + label {
            background: var(--niekes-primary);
            color: var(--niekes-tertiary);
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
/*
@media (max-width: 1024px) {
    .home {
        display: grid;
        grid-template-areas: 'context' 'control';
        grid-template-columns: 1fr;
        grid-template-rows: minmax(0, 1.5fr) minmax(0, 3fr);
    }

    .context {
        border-bottom: --niekes-border-width solid --niekes-black-50;
        border-radius: 0;

        &__canvas {
            height: auto !important;
            max-height: 90%;
            width: auto !important;
        }
    }
} */
</style>
../interfaces/Rect ../types/rect
