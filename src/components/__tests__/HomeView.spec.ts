import { describe, it, expect, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import HomeView from '../../views/HomeView.vue';
import TheExportDialog from '../TheExportDialog.vue';

// a key arrives at the focused element, or at the body when no control has the focus
const space = (type: 'keydown' | 'keyup', target: Element = document.body) =>
    target.dispatchEvent(
        new KeyboardEvent(type, { code: 'Space', bubbles: true, cancelable: true })
    );

// jsdom cannot show a modal; a no-op stands in so an export can open the sponsor dialog
HTMLDialogElement.prototype.showModal ||= () => {};

// an export hands the browser a blob link; both export tests stub the URL and spy the link click
const stubExport = () => {
    const createObjectURL = vi.fn((_blob: Blob) => 'blob:geometrica');
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    return {
        createObjectURL,
        restore: () => {
            click.mockRestore();
            vi.unstubAllGlobals();
        }
    };
};

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
        const exportStub = stubExport();
        const wrapper = mount(HomeView, {
            global: { stubs: { RouterLink: true, TheGallery: true, Navbar: true } }
        });

        await wrapper
            .findAll('label')
            .find((label) => label.text() === 'Grid')!
            .find('input')
            .setValue(true);

        expect(wrapper.find('.context').html()).toContain('non-scaling-stroke');

        // the navbar button opens the dialog first, the export leaves from there
        await wrapper
            .findAll('button')
            .find((b) => b.text() === 'Export SVG')!
            .trigger('click');
        await wrapper
            .findComponent(TheExportDialog)
            .findAll('button')
            .find((b) => b.text() === 'Export SVG')!
            .trigger('click');

        const exported = await exportStub.createObjectURL.mock.calls[0]![0].text();

        expect(exported).toMatch(/^<svg/);
        expect(exported).not.toContain('non-scaling-stroke');

        exportStub.restore();
        wrapper.unmount();
    });

    it('exports the artwork from the sponsor dialog, which stays up for the sponsor ask', async () => {
        const exportStub = stubExport();
        const wrapper = mount(HomeView, {
            global: { stubs: { RouterLink: true, TheGallery: true, Navbar: true } }
        });
        const dialog = () => wrapper.findComponent(TheExportDialog);
        const exportFromDialog = () =>
            dialog()
                .findAll('button')
                .find((b) => b.text() === 'Export SVG')!
                .trigger('click');

        // the navbar button opens the dialog first; nothing leaves the page yet
        await wrapper
            .findAll('button')
            .find((b) => b.text() === 'Export SVG')!
            .trigger('click');

        expect(exportStub.createObjectURL).not.toHaveBeenCalled();
        expect(dialog().props('modelValue')).toBe(true);

        const sponsor = wrapper.find('a[href="https://github.com/sponsors/niekes"]');

        expect(sponsor.attributes('target')).toBe('_blank');

        // following the sponsor ask opens the page in its own tab and keeps the dialog up
        await sponsor.trigger('click');

        expect(dialog().props('modelValue')).toBe(true);

        await exportFromDialog();

        expect(exportStub.createObjectURL).toHaveBeenCalledTimes(1);
        expect(dialog().props('modelValue')).toBe(false);

        exportStub.restore();
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

    // jsdom has no popover API, so the browser's opening and light dismiss stay untested
    it('keeps background and view in a toolbar that its strip opens and a press outside closes', () => {
        const wrapper = mount(HomeView, {
            global: { stubs: { RouterLink: true, TheGallery: true, Navbar: true } }
        });
        const strip = wrapper.find('button[aria-label="Background and view"]');
        const toolbar = wrapper.find(`#${strip.attributes('popovertarget')}`);

        expect(toolbar.text()).toContain('Corner radius');
        expect(toolbar.text()).toContain('Rotation center');
        // an auto popover starts hidden and closes on a press outside it or on Escape
        expect(toolbar.attributes('popover')).toBe('');

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

    it('moves the selected layer only while Space is held and frames it meanwhile', async () => {
        const wrapper = mount(HomeView, {
            global: { stubs: { RouterLink: true, TheGallery: true, Navbar: true } }
        });
        const surface = wrapper.find('.context__surface');
        const bounds = () => wrapper.find('.context__bounds');
        const pointer = (type: string, clientX = 0, clientY = 0) =>
            surface.element.dispatchEvent(new MouseEvent(type, { clientX, clientY }));
        const drag = async (dx: number, dy: number) => {
            pointer('pointerdown');
            pointer('pointermove', dx, dy);
            pointer('pointerup');
            await nextTick();
        };

        Object.defineProperty(surface.element, 'clientWidth', { value: 1024 });
        surface.element.setPointerCapture = vi.fn();

        await drag(37, 20);

        expect(surface.html()).toContain('translate(512 512)');
        expect(bounds().exists()).toBe(false);

        space('keydown');
        await nextTick();

        expect(bounds().exists()).toBe(true);

        await drag(37, 20);

        expect(surface.html()).toContain('translate(544 532)');

        space('keyup');
        await nextTick();

        expect(bounds().exists()).toBe(false);

        // letting go of Space midway keeps the drag and its frame up to the end
        space('keydown');
        pointer('pointerdown');
        space('keyup');
        await nextTick();

        expect(bounds().exists()).toBe(true);

        pointer('pointermove', 32, 0);
        await nextTick();

        expect(surface.html()).toContain('translate(576 532)');
        expect(bounds().exists()).toBe(true);

        pointer('pointerup');
        await nextTick();

        expect(bounds().exists()).toBe(false);

        wrapper.unmount();
    });

    it('leaves Space to text fields, and to a focused control alongside moving', async () => {
        const wrapper = mount(HomeView, {
            attachTo: document.body,
            global: { stubs: { RouterLink: true, TheGallery: true, Navbar: true } }
        });
        const bounds = () => wrapper.find('.context__bounds');
        // dispatchEvent answers false once the page kept the key from its default action
        const pressSpaceOn = async (selector: string) => {
            const kept = space('keydown', wrapper.find(selector).element);

            await nextTick();

            return !kept;
        };

        expect(await pressSpaceOn('input[type="number"]')).toBe(false);
        expect(bounds().exists()).toBe(false);

        // a layer button a click left focused still clicks, but no longer stands in the way
        expect(await pressSpaceOn('.context button')).toBe(false);
        expect(bounds().exists()).toBe(true);

        space('keyup');

        // outside a control the page would scroll, and so would the panel around a slider
        expect(await pressSpaceOn('.context__surface')).toBe(true);
        expect(await pressSpaceOn('input[type="range"]')).toBe(true);

        space('keyup');

        // an open modal keeps Space for itself, the drawing surface lies behind it; jsdom cannot
        // show a modal, so an open dialog stands in for one
        wrapper.find('dialog').element.setAttribute('open', '');

        expect(await pressSpaceOn('.context__surface')).toBe(false);
        expect(bounds().exists()).toBe(false);

        wrapper.unmount();
    });

    it('renames a layer in the list, with spaces in its name', async () => {
        const wrapper = mount(HomeView, {
            attachTo: document.body,
            global: { stubs: { RouterLink: true, TheGallery: true, Navbar: true } }
        });

        const layerButton = () => wrapper.find('[aria-label="Layers"] button[aria-current="true"]');

        await layerButton().trigger('dblclick');

        const input = wrapper.find('input[aria-label="Name of Layer 1"]');
        space('keydown', input.element);
        await nextTick();

        // typing a space must not switch to moving the layer
        expect(wrapper.find('.context__bounds').exists()).toBe(false);

        await input.setValue('Sun rays');
        await input.trigger('keydown', { key: 'Enter' });

        expect(wrapper.find('input[aria-label="Name of Layer 1"]').exists()).toBe(false);
        expect(layerButton().text()).toBe('Sun rays');

        wrapper.unmount();
    });

    it('hands the keyboard back to the layer after renaming, without clicking it', async () => {
        const wrapper = mount(HomeView, {
            attachTo: document.body,
            global: { stubs: { RouterLink: true, TheGallery: true, Navbar: true } }
        });
        const layerButton = () => wrapper.find('[aria-label="Layers"] button[aria-current="true"]');

        await layerButton().trigger('dblclick');
        await wrapper.find('input[aria-label="Name of Layer 1"]').setValue('Sun rays');

        // dispatchEvent answers false once the page kept Enter from clicking the focused layer
        const enter = new KeyboardEvent('keydown', {
            key: 'Enter',
            bubbles: true,
            cancelable: true
        });
        const kept = !wrapper
            .find('input[aria-label="Name of Layer 1"]')
            .element.dispatchEvent(enter);
        await flushPromises();

        expect(kept).toBe(true);
        expect(document.activeElement).toBe(layerButton().element);

        // Escape drops the new name and hands the keyboard back as well
        await layerButton().trigger('keydown', { key: 'F2' });
        await wrapper.find('input[aria-label="Name of Sun rays"]').setValue('discarded');
        await wrapper
            .find('input[aria-label="Name of Sun rays"]')
            .trigger('keydown', { key: 'Escape' });
        await flushPromises();

        expect(layerButton().text()).toBe('Sun rays');
        expect(document.activeElement).toBe(layerButton().element);

        wrapper.unmount();
    });

    it('keeps renaming while Enter or Escape only ends an input method composition', async () => {
        const wrapper = mount(HomeView, {
            attachTo: document.body,
            global: { stubs: { RouterLink: true, TheGallery: true, Navbar: true } }
        });

        await wrapper.find('[aria-label="Layers"] button[aria-current="true"]').trigger('dblclick');

        const input = wrapper.find('input[aria-label="Name of Layer 1"]');
        await input.setValue('東京');
        await input.trigger('keydown', { key: 'Enter', isComposing: true });
        await input.trigger('keydown', { key: 'Escape', isComposing: true });
        // Safari ends the composition before the Enter that confirms it and marks only its key code
        await input.trigger('keydown', { key: 'Enter', keyCode: 229 });

        expect(wrapper.find('input[aria-label="Name of Layer 1"]').exists()).toBe(true);

        wrapper.unmount();
    });

    it('moves the selected layer by touch without Space and frames it while dragging', async () => {
        const wrapper = mount(HomeView, {
            global: { stubs: { RouterLink: true, TheGallery: true, Navbar: true } }
        });
        const surface = wrapper.find('.context__surface');
        const bounds = () => wrapper.find('.context__bounds');
        const touch = async (type: string, clientX = 0, clientY = 0) => {
            const event = new MouseEvent(type, { clientX, clientY });

            Object.defineProperty(event, 'pointerType', { value: 'touch' });
            surface.element.dispatchEvent(event);
            await nextTick();
        };

        Object.defineProperty(surface.element, 'clientWidth', { value: 1024 });
        surface.element.setPointerCapture = vi.fn();

        // a tap neither moves nor frames the layer
        await touch('pointerdown');

        expect(bounds().exists()).toBe(false);

        await touch('pointermove', 37, 20);

        expect(surface.html()).toContain('translate(544 532)');
        expect(bounds().exists()).toBe(true);

        await touch('pointerup');

        expect(bounds().exists()).toBe(false);

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

        space('keydown');

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
        space('keydown');
        await drag(surface.element, 5, 0);
        space('keyup');
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
        space('keydown');
        await drag(surface.element, 27, 0);
        space('keyup');

        expect(markerAt()).toEqual(share(32, 20));

        // a drag of the marker that started framed keeps its frame when Space is let go midway
        const bounds = () => wrapper.find('.context__bounds');

        space('keydown');
        pointer(marker().element, 'pointerdown');
        space('keyup');
        await nextTick();

        expect(bounds().exists()).toBe(true);

        pointer(surface.element, 'pointerup');
        await nextTick();

        expect(bounds().exists()).toBe(false);

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
