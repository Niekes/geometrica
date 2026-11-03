import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { useTheme } from '../useTheme';

// jsdom has no matchMedia, so the operating system's preference is stubbed per test
function stubOperatingSystemDark(dark: boolean) {
    vi.stubGlobal('matchMedia', (query: string) => ({
        matches: dark && query.includes('dark'),
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false
    }));
}

describe('useTheme', () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.removeAttribute('data-theme');
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('follows the operating system on a first visit', async () => {
        stubOperatingSystemDark(true);
        const { isDark } = useTheme();

        await nextTick();

        expect(isDark.value).toBe(true);
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('lets a stored choice win over the operating system', async () => {
        stubOperatingSystemDark(true);
        localStorage.setItem('geometrica-theme', 'light');
        const { isDark } = useTheme();

        await nextTick();

        expect(isDark.value).toBe(false);
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('toggles the theme, sets the attribute and keeps the choice', async () => {
        stubOperatingSystemDark(false);
        const { isDark, toggleTheme } = useTheme();

        await nextTick();

        expect(isDark.value).toBe(false);
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');

        toggleTheme();
        await nextTick();

        expect(isDark.value).toBe(true);
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
        expect(localStorage.getItem('geometrica-theme')).toBe('dark');
    });

    it('flips even when a click event is passed as the argument, as @click="toggleTheme" does', async () => {
        stubOperatingSystemDark(true);
        const { isDark, toggleTheme } = useTheme();

        await nextTick();
        expect(isDark.value).toBe(true);

        const onClick: (event: MouseEvent) => void = toggleTheme;
        onClick(new MouseEvent('click'));
        await nextTick();

        expect(isDark.value).toBe(false);
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
});
