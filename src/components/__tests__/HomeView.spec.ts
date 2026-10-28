import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import HomeView from '../../views/HomeView.vue';

describe('HomeView', () => {
    it('resolves every component it renders', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const wrapper = mount(HomeView, {
            global: { stubs: { RouterLink: true, TheGallery: true, Navbar: true } }
        });

        const unresolved = warn.mock.calls.filter(([message]) =>
            String(message).includes('Failed to resolve component')
        );

        expect(unresolved).toEqual([]);

        warn.mockRestore();
        wrapper.unmount();
    });

    it('adds a layer when clicking Add layer', async () => {
        const wrapper = mount(HomeView, {
            global: { stubs: { RouterLink: true, TheGallery: true, Navbar: true } }
        });

        await new Promise((r) => setTimeout(r, 50));

        expect(wrapper.text()).toContain('Layer 1');

        await wrapper.find('button[aria-label="Add layer"]').trigger('click');
        await new Promise((r) => setTimeout(r, 50));

        expect(wrapper.text()).toContain('Layer 2');
        expect(wrapper.findAll('button').some((b) => b.text().includes('Layer 1'))).toBe(true);

        wrapper.unmount();
    });

    it('shows the grid on the drawing surface but keeps it out of the export', async () => {
        const createObjectURL = vi.fn((_blob: Blob) => 'blob:geometrica');
        vi.stubGlobal('URL', { createObjectURL, revokeObjectURL: vi.fn() });
        const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
        const wrapper = mount(HomeView, {
            global: { stubs: { RouterLink: true, TheGallery: true, Navbar: true } }
        });

        await wrapper
            .findAll('label')
            .find((label) => label.text() === 'Grid')!
            .find('input')
            .setValue(true);

        expect(wrapper.find('.context').html()).toContain('non-scaling-stroke');

        await wrapper
            .findAll('button')
            .find((b) => b.text() === 'Export SVG')!
            .trigger('click');

        const exported = await createObjectURL.mock.calls[0]![0].text();

        expect(exported).toMatch(/^<svg/);
        expect(exported).not.toContain('non-scaling-stroke');

        click.mockRestore();
        vi.unstubAllGlobals();
        wrapper.unmount();
    });

    it('starts with the grid hidden and shows it when checking Grid', async () => {
        const wrapper = mount(HomeView, {
            global: { stubs: { RouterLink: true, TheGallery: true, Navbar: true } }
        });
        const checkbox = wrapper
            .findAll('label')
            .find((label) => label.text() === 'Grid')!
            .find('input');

        expect(wrapper.find('.context__grid').exists()).toBe(false);

        await checkbox.setValue(true);

        expect(wrapper.find('.context__grid').exists()).toBe(true);

        await checkbox.setValue(false);

        expect(wrapper.find('.context__grid').exists()).toBe(false);

        wrapper.unmount();
    });

    it('rounds the transparency pattern with the corner radius of the background', () => {
        const wrapper = mount(HomeView, {
            global: { stubs: { RouterLink: true, TheGallery: true, Navbar: true } }
        });

        expect(wrapper.find('.context__surface').attributes('style')).toContain(
            'border-radius: 10%'
        );

        wrapper.unmount();
    });

    it('drags the selected layer across the drawing surface and snaps it to the grid', async () => {
        const wrapper = mount(HomeView, {
            global: { stubs: { RouterLink: true, TheGallery: true, Navbar: true } }
        });
        const surface = wrapper.find('.context__surface');
        const snap = wrapper
            .findAll('label')
            .find((label) => label.text() === 'Snap')!
            .find('input');
        // jsdom lacks PointerEvent; a MouseEvent carries the same coordinates and button
        const pointer = (type: string, clientX = 0, clientY = 0) =>
            surface.element.dispatchEvent(new MouseEvent(type, { clientX, clientY }));
        const drag = async (dx: number, dy: number) => {
            pointer('pointerdown');
            pointer('pointermove', dx, dy);
            pointer('pointerup');
            await nextTick();
        };

        // jsdom has no layout: a surface 1024 pixels wide maps one pixel to one unit
        Object.defineProperty(surface.element, 'clientWidth', { value: 1024 });
        surface.element.setPointerCapture = vi.fn();

        // x lands within a quarter cell of 32 and snaps; y moves down, so cy turns negative
        await drag(37, 20);

        expect(surface.html()).toContain('translate(544 532)');

        await snap.setValue(false);
        await drag(5, 0);

        expect(surface.html()).toContain('translate(549 532)');

        // the jitter of a click moves nothing, so it does not snap the layer either
        await snap.setValue(true);
        await drag(1, 1);

        expect(surface.html()).toContain('translate(549 532)');

        wrapper.unmount();
    });

    it('drags the rotation center without moving the layer and snaps it to the position', async () => {
        const wrapper = mount(HomeView, {
            global: { stubs: { RouterLink: true, TheGallery: true, Navbar: true } }
        });
        const surface = wrapper.find('.context__surface');
        const marker = () => wrapper.find<SVGElement>('.context__rotation-center');
        const toggle = (text: string) =>
            wrapper
                .findAll('label')
                .find((label) => label.text() === text)!
                .find('input');
        // the pointer goes down on the marker and bubbles to the surface, which captures the rest
        const pointer = (target: Element, type: string, clientX = 0, clientY = 0) =>
            target.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX, clientY }));
        const drag = async (target: Element, dx: number, dy: number) => {
            pointer(target, 'pointerdown');
            pointer(surface.element, 'pointermove', dx, dy);
            pointer(surface.element, 'pointerup');
            await nextTick();
        };
        // the marker sits at a share of the surface, counted from its center with y pointing up
        const markerAt = () => [marker().element.style.left, marker().element.style.top];
        const share = (x: number, y: number) => [
            `${((512 + x) / 1024) * 100}%`,
            `${((512 - y) / 1024) * 100}%`
        ];

        Object.defineProperty(surface.element, 'clientWidth', { value: 1024 });
        surface.element.setPointerCapture = vi.fn();

        // a layer between the grid lines, so its position pulls on its own
        await toggle('Snap').setValue(false);
        await drag(surface.element, 5, 0);
        await toggle('Snap').setValue(true);

        expect(markerAt()).toEqual(share(5, 0));

        // x lands within a quarter cell of 32 and snaps; y moves up and stays free
        await drag(marker().element, 30, -20);

        expect(markerAt()).toEqual(share(32, 20));
        expect(surface.html()).toContain('translate(517 512)');

        // 7 lies near the grid line at 0, but the position at 5 pulls first
        await drag(marker().element, -25, 0);

        expect(markerAt()).toEqual(share(5, 20));

        // moving the layer carries the rotation center along
        await drag(surface.element, 27, 0);

        expect(markerAt()).toEqual(share(32, 20));

        // the marker has a toggle of its own, apart from the grid
        await toggle('Grid').setValue(false);

        expect(marker().exists()).toBe(true);

        await toggle('Rotation center').setValue(false);

        expect(marker().exists()).toBe(false);

        wrapper.unmount();
    });

    it('draws the artwork an agent sets, untouched by the locked sliders of the panel', async () => {
        const tools: ModelContextTool[] = [];

        Object.defineProperty(document, 'modelContext', {
            configurable: true,
            value: { registerTool: (tool: ModelContextTool) => tools.push(tool) }
        });

        const wrapper = mount(HomeView, {
            global: { stubs: { RouterLink: true, TheGallery: true, Navbar: true } }
        });
        const run = (name: string, input: Record<string, unknown> = {}) =>
            tools.find((tool) => tool.name === name)!.execute(input);

        await new Promise((r) => setTimeout(r, 50));
        await run('set_artwork', {
            layers: [{ shape: 'rect', width: 600, height: 200, borderRadiusTl: 1 }]
        });
        await new Promise((r) => setTimeout(r, 50));

        const { layers } = (await run('get_artwork')) as { layers: Record<string, number>[] };

        expect(layers[0]).toMatchObject({
            width: 600,
            height: 200,
            borderRadiusTl: 1,
            borderRadiusTr: 0
        });

        wrapper.unmount();
        delete (document as { modelContext?: unknown }).modelContext;
    });
});
