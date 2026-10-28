import { describe, it, expect, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import BaseTerminal from '../BaseTerminal.vue';

describe('BaseTerminal', () => {
    it('copies the bare code without its prefix and says so', async () => {
        const writeText = vi.fn(() => Promise.resolve());

        vi.stubGlobal('navigator', { clipboard: { writeText } });

        const wrapper = mount(BaseTerminal, { props: { prefix: '$', code: 'npm test' } });

        expect(wrapper.find('pre').attributes('data-prefix')).toBe('$');

        await wrapper.find('button').trigger('click');
        await flushPromises();

        expect(writeText).toHaveBeenCalledWith('npm test');
        expect(wrapper.find('button').text()).toBe('Copied');

        vi.unstubAllGlobals();
        wrapper.unmount();
    });

    it('tells when the clipboard refuses', async () => {
        vi.stubGlobal('navigator', { clipboard: { writeText: () => Promise.reject(new Error()) } });

        const wrapper = mount(BaseTerminal, { props: { prefix: '>', code: 'draw' } });

        await wrapper.find('button').trigger('click');
        await flushPromises();

        expect(wrapper.find('button').text()).toBe('Copy failed');

        vi.unstubAllGlobals();
        wrapper.unmount();
    });
});
