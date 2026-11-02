import { describe, it, expect, vi, afterEach } from 'vitest';
import { useCopy } from '../useCopy';

describe('useCopy', () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it('puts the text on the clipboard, says so and forgets it two seconds later', async () => {
        vi.useFakeTimers();
        const writeText = vi.fn(() => Promise.resolve());
        vi.stubGlobal('navigator', { clipboard: { writeText } });
        const { state, copy } = useCopy();

        await copy('https://example.com/?c=abc');

        expect(writeText).toHaveBeenCalledWith('https://example.com/?c=abc');
        expect(state.value).toBe('copied');

        vi.advanceTimersByTime(2000);

        expect(state.value).toBe('idle');
    });

    it('keeps saying so for two seconds after the last copy, not the first', async () => {
        vi.useFakeTimers();
        vi.stubGlobal('navigator', { clipboard: { writeText: () => Promise.resolve() } });
        const { state, copy } = useCopy();

        await copy('first');
        vi.advanceTimersByTime(1500);
        await copy('second');
        vi.advanceTimersByTime(1500);

        expect(state.value).toBe('copied');
    });

    it('says so when the clipboard refuses', async () => {
        vi.stubGlobal('navigator', { clipboard: { writeText: () => Promise.reject(new Error()) } });
        const { state, copy } = useCopy();

        await copy('draw');

        expect(state.value).toBe('failed');
    });

    it('says so where the browser has no clipboard', async () => {
        vi.stubGlobal('navigator', {});
        const { state, copy } = useCopy();

        await copy('draw');

        expect(state.value).toBe('failed');
    });
});
