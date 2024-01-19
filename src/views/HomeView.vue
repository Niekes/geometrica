<script setup lang="ts">
import { ref } from 'vue';
import config from '../components/config';
import RectControl from '@/components/RectControl.vue';

const shapes: { name: string }[] = [{ name: 'rect' }, { name: 'circle' }, { name: 'polygon' }];
const selectedShape = ref<string>(config.DEFAULTS.shape);

function draw() {
    console.log('DRAW');
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
                        @change="draw"
                    />
                    <label :for="shape.name" v-text="shape.name" />
                </div>
            </div>
            <div class="control__shapes">
                <RectControl></RectControl>
            </div>
            <div class="control__actions">control__actions</div>
        </div>
        <div class="context">
            <canvas
                class="context__canvas"
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
    min-height: calc(100vh - 13rem);
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
    max-height: 90%;
    max-width: 90%;
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
