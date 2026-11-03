import { useDark, useToggle } from '@vueuse/core';

// the theme is the data-theme attribute daisyUI reads on <html>; the choice is kept in
// localStorage and a first visit follows the operating system (VueUse's defaults)
export function useTheme() {
    const isDark = useDark({
        selector: 'html',
        attribute: 'data-theme',
        valueDark: 'dark',
        valueLight: 'light',
        storageKey: 'geometrica-theme'
    });
    // wrapped so it can be passed straight to @click: VueUse's toggle would read the click
    // event as its value argument and set the theme to a truthy event instead of flipping
    const toggle = useToggle(isDark);
    const toggleTheme = () => toggle();

    return { isDark, toggleTheme };
}
