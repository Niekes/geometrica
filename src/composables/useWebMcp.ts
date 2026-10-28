import { onScopeDispose } from 'vue';
import type useScene from './useScene';
import { artworkTools } from '../lib/artworkTools';

/**
 * Offers the artwork tools to an agent in the browser, as long as the browser supports WebMCP.
 */
export function useWebMcp(
    scene: Pick<ReturnType<typeof useScene>, 'background' | 'layers' | 'selectedLayerId'>
) {
    const modelContext = document.modelContext;

    if (!modelContext) return;

    const selectedIndex = () =>
        scene.layers.value.findIndex((layer) => layer.id === scene.selectedLayerId.value);

    const tools = artworkTools({
        read: () => ({
            artwork: { background: scene.background.value, layers: scene.layers.value },
            selectedLayer: selectedIndex()
        }),
        // fresh ids rebuild the panel: a panel kept across the swap would treat the new values as
        // edits, and its locked sliders would overwrite them. The selection keeps its position.
        write: ({ background, layers }) => {
            const index = Math.min(Math.max(selectedIndex(), 0), layers.length - 1);

            scene.background.value = background;
            scene.layers.value = layers.map((layer) => ({ ...layer, id: crypto.randomUUID() }));
            scene.selectedLayerId.value = scene.layers.value[index]!.id;
        }
    });

    // aborting the signal unregisters the tools
    const controller = new AbortController();

    for (const tool of tools) modelContext.registerTool(tool, { signal: controller.signal });

    onScopeDispose(() => controller.abort());
}
