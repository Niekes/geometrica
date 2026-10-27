import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import HomeView from '../../views/HomeView.vue';

describe('HomeView', () => {
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
