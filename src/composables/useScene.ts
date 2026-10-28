import { computed, ref } from 'vue';
import { type Layer, type ShapePreset } from '../types/Layer';
import { type Background, buildLayer, defaultBackground } from '../config/defaults';

export default function useScene() {
    const background = ref<Background>({ ...defaultBackground });
    const layers = ref<Layer[]>([freshLayer('rect', 'Layer 1')]);
    const selectedLayerId = ref(layers.value[0]?.id ?? '');

    // invariant: the scene always holds at least one layer, so a selection always exists
    const selectedLayer = computed<Layer>({
        get: () =>
            layers.value.find((layer) => layer.id === selectedLayerId.value) ?? layers.value[0]!,
        set: (value) => {
            const index = layers.value.findIndex((layer) => layer.id === value.id);

            if (index === -1) {
                layers.value.push(value);
            } else {
                layers.value[index] = value;
            }
        }
    });

    function createLayer(shape: ShapePreset): Layer {
        return { ...buildLayer(shape), id: crypto.randomUUID() };
    }

    function freshLayer(shape: ShapePreset, name: string): Layer {
        const layer = createLayer(shape);
        layer.name = name;
        return layer;
    }

    function uniqueName(): string {
        const names = new Set(layers.value.map((layer) => layer.name));
        let index = layers.value.length + 1;

        while (names.has(`Layer ${index}`)) index += 1;

        return `Layer ${index}`;
    }

    function init(layersFromUrl: Layer[]) {
        layers.value =
            layersFromUrl.length === 0 ? [freshLayer('rect', 'Layer 1')] : [...layersFromUrl];

        selectFirstLayer();
    }

    function selectFirstLayer() {
        selectedLayerId.value = layers.value[0]?.id ?? '';
    }

    function addLayer() {
        duplicateLayer(selectedLayer.value.id);
    }

    function duplicateLayer(id: string) {
        const source = layers.value.find((layer) => layer.id === id);

        if (!source) return;

        // structuredClone cannot handle reactive proxies; all layer fields are JSON-safe
        const layer = JSON.parse(JSON.stringify(source)) as Layer;
        layer.id = crypto.randomUUID();
        layer.name = uniqueName();

        const index = layers.value.findIndex((l) => l.id === id);

        layers.value.splice(index === -1 ? 0 : index, 0, layer);
        selectedLayerId.value = layer.id;
    }

    function removeLayer(id: string) {
        if (layers.value.length <= 1) return;

        const index = layers.value.findIndex((layer) => layer.id === id);

        if (index === -1) return;

        layers.value.splice(index, 1);

        if (selectedLayerId.value === id) {
            const neighbor = layers.value[Math.min(index, layers.value.length - 1)];
            if (neighbor) selectedLayerId.value = neighbor.id;
        }
    }

    function moveLayer(id: string, direction: -1 | 1) {
        const index = layers.value.findIndex((layer) => layer.id === id);
        const target = index + direction;

        if (index === -1 || target < 0 || target >= layers.value.length) return;

        const [layer] = layers.value.splice(index, 1);
        if (!layer) return;
        layers.value.splice(target, 0, layer);
    }

    function toggleVisibility(id: string) {
        const layer = layers.value.find((l) => l.id === id);

        if (layer) layer.visible = !layer.visible;
    }

    function renameLayer(id: string, name: string) {
        const layer = layers.value.find((l) => l.id === id);
        const trimmed = name.trim();

        // a blank name would leave the layer without a label in the list
        if (layer && trimmed) layer.name = trimmed;
    }

    return {
        background,
        layers,
        selectedLayer,
        selectedLayerId,
        init,
        selectFirstLayer,
        addLayer,
        duplicateLayer,
        removeLayer,
        moveLayer,
        toggleVisibility,
        renameLayer
    };
}
