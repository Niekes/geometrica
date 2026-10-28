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

    it('adds a duplicated layer when clicking Add Layer', async () => {
        const wrapper = mount(HomeView, {
            global: { stubs: { RouterLink: true, TheGallery: true, Navbar: true } }
        });

        await new Promise((r) => setTimeout(r, 50));

        expect(wrapper.text()).toContain('Layer 1');

        await wrapper
            .findAll('button')
            .find((b) => b.text().includes('Add Layer'))!
            .trigger('click');
        await new Promise((r) => setTimeout(r, 50));

        expect(wrapper.text()).toContain('Layer 2');
        expect(wrapper.findAll('button').some((b) => b.text().includes('Layer 1'))).toBe(true);

        wrapper.unmount();
    });

    it('shows the grid on the drawing surface but keeps it out of the download', async () => {
        const createObjectURL = vi.fn((_blob: Blob) => 'blob:geometrica');
        vi.stubGlobal('URL', { createObjectURL, revokeObjectURL: vi.fn() });
        const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
        const wrapper = mount(HomeView, {
            global: { stubs: { RouterLink: true, TheGallery: true, Navbar: true } }
        });

        expect(wrapper.find('.context').html()).toContain('non-scaling-stroke');

        await wrapper
            .findAll('button')
            .find((b) => b.text() === 'Download')!
            .trigger('click');

        const exported = await createObjectURL.mock.calls[0]![0].text();

        expect(exported).toMatch(/^<svg/);
        expect(exported).not.toContain('non-scaling-stroke');

        click.mockRestore();
        vi.unstubAllGlobals();
        wrapper.unmount();
    });

    it('hides the grid when unchecking Grid', async () => {
        const wrapper = mount(HomeView, {
            global: { stubs: { RouterLink: true, TheGallery: true, Navbar: true } }
        });
        const checkbox = wrapper
            .findAll('label')
            .find((label) => label.text() === 'Grid')!
            .find('input');

        await checkbox.setValue(false);

        expect(wrapper.find('.context__grid').exists()).toBe(false);

        await checkbox.setValue(true);

        expect(wrapper.find('.context__grid').exists()).toBe(true);

        wrapper.unmount();
    });

    it('drags the selected layer across the drawing surface and snaps it to the grid', async () => {
        const wrapper = mount(HomeView, {
            global: { stubs: { RouterLink: true, TheGallery: true, Navbar: true } }
        });
        const surface = wrapper.find('.context__surface');
        const grid = wrapper
            .findAll('label')
            .find((label) => label.text() === 'Grid')!
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

        await grid.setValue(false);
        await drag(5, 0);

        expect(surface.html()).toContain('translate(549 532)');

        // the jitter of a click moves nothing, so it does not snap the layer either
        await grid.setValue(true);
        await drag(1, 1);

        expect(surface.html()).toContain('translate(549 532)');

        wrapper.unmount();
    });
});
