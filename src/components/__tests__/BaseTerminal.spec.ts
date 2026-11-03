import { describe, it, expect, vi, afterEach } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import BaseTerminal from '../BaseTerminal.vue';
import {
    stubClipboardApi,
    dropNavigatorProps,
    flushMicrotasks
} from '@/composables/__tests__/stubClipboard';

describe('BaseTerminal', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        dropNavigatorProps('clipboard', 'permissions');
    });

    it('copies the bare code without its prefix and says so', async () => {
        const write = vi.fn((_items: unknown[]) => Promise.resolve());
        stubClipboardApi(write);

        const wrapper = mount(BaseTerminal, { props: { prefix: '$', code: 'npm test' } });
        await flushMicrotasks();

        expect(wrapper.find('pre').attributes('data-prefix')).toBe('$');

        await wrapper.find('button').trigger('click');
        await flushPromises();

        const items = write.mock.calls[0]![0] as { init: Record<string, unknown> }[];
        expect(items[0]!.init['text/plain']).toBe('npm test');
        expect(wrapper.find('button').text()).toBe('Copied');

        wrapper.unmount();
    });

    it('tells when the clipboard refuses', async () => {
        stubClipboardApi(vi.fn(() => Promise.reject(new Error('denied'))));
        // the legacy fallback runs after a refused write; make it refuse as well
        const execCommand = Object.getOwnPropertyDescriptor(document, 'execCommand');
        Object.defineProperty(document, 'execCommand', {
            value: () => {
                throw new Error('denied');
            },
            configurable: true
        });

        const wrapper = mount(BaseTerminal, { props: { prefix: '>', code: 'draw' } });
        await flushMicrotasks();

        await wrapper.find('button').trigger('click');
        await flushPromises();

        expect(wrapper.find('button').text()).toBe('Copy failed');

        if (execCommand) Object.defineProperty(document, 'execCommand', execCommand);
        else delete (document as unknown as Record<string, unknown>).execCommand;
        wrapper.unmount();
    });
});
