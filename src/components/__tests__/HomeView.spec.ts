import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
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
});
