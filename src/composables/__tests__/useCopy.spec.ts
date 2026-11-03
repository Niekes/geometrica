import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCopy } from '../useCopy';
import { stubClipboardApi, dropNavigatorProps, flushMicrotasks } from './stubClipboard';

describe('useCopy', () => {
    let execCommandDescriptor: PropertyDescriptor | undefined;

    beforeEach(() => {
        execCommandDescriptor = Object.getOwnPropertyDescriptor(document, 'execCommand');
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        dropNavigatorProps('clipboard', 'permissions');
        if (execCommandDescriptor) {
            Object.defineProperty(document, 'execCommand', execCommandDescriptor);
        } else {
            delete (document as unknown as Record<string, unknown>).execCommand;
        }
    });

    it('puts the text on the clipboard, says so and forgets it two seconds later', async () => {
        vi.useFakeTimers();
        const write = vi.fn((_items: unknown[]) => Promise.resolve());
        stubClipboardApi(write);
        const { state, copy, isSupported } = useCopy();

        expect(isSupported.value).toBe(true);

        await flushMicrotasks();
        await copy('https://example.com/?c=abc');

        const items = write.mock.calls[0]![0] as { init: Record<string, unknown> }[];
        expect(items[0]!.init['text/plain']).toBe('https://example.com/?c=abc');
        expect(state.value).toBe('copied');

        vi.advanceTimersByTime(2000);

        expect(state.value).toBe('idle');
    });

    it('keeps saying so for two seconds after the last copy, not the first', async () => {
        vi.useFakeTimers();
        stubClipboardApi(vi.fn(() => Promise.resolve()));
        const { state, copy } = useCopy();

        await flushMicrotasks();
        await copy('first');
        vi.advanceTimersByTime(1500);
        await copy('second');
        vi.advanceTimersByTime(1500);

        expect(state.value).toBe('copied');

        vi.advanceTimersByTime(500);

        expect(state.value).toBe('idle');
    });

    it('says so when the clipboard refuses, and forgets it two seconds later', async () => {
        vi.useFakeTimers();
        stubClipboardApi(vi.fn(() => Promise.reject(new Error('denied'))));
        // the legacy fallback runs after a refused write; make it refuse as well
        Object.defineProperty(document, 'execCommand', {
            value: () => {
                throw new Error('denied');
            },
            configurable: true
        });
        const { state, copy } = useCopy();

        await flushMicrotasks();
        await copy('draw');

        expect(state.value).toBe('failed');

        vi.advanceTimersByTime(2000);

        expect(state.value).toBe('idle');
    });

    it('says so where the browser has no clipboard', async () => {
        dropNavigatorProps('clipboard');
        const { state, copy, isSupported } = useCopy();

        expect(isSupported.value).toBe(false);

        await copy('draw');

        expect(state.value).toBe('failed');
    });
});
