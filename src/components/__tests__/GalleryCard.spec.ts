import { describe, it, expect, vi, afterEach } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import GalleryCard from '../GalleryCard.vue';

describe('GalleryCard', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('shows the artwork with its number, counted from 1, and opens it here', () => {
        const wrapper = mount(GalleryCard, { props: { link: 'c=abc', index: 84 } });
        const thumbnail = wrapper.find('img');

        expect(wrapper.text()).toContain('85');
        expect(thumbnail.attributes('src')).toBe('./gallery/84.avif');
        expect(thumbnail.element.closest('a')!.getAttribute('href')).toBe('/?c=abc');
        expect(thumbnail.element.closest('a')!.hasAttribute('target')).toBe(false);
    });

    it('opens the artwork in a new tab, so the one on the surface stays', () => {
        const wrapper = mount(GalleryCard, { props: { link: 'c=abc', index: 0 } });
        const newTab = wrapper.find('a[aria-label="Open in new tab"]');

        expect(newTab.attributes('href')).toBe('/?c=abc');
        expect(newTab.attributes('target')).toBe('_blank');
    });

    it('copies the full link of the artwork and says so', async () => {
        const writeText = vi.fn(() => Promise.resolve());
        vi.stubGlobal('navigator', { clipboard: { writeText } });
        const wrapper = mount(GalleryCard, { props: { link: 'c=abc', index: 0 } });

        await wrapper.find('button[aria-label="Copy link"]').trigger('click');
        await flushPromises();

        expect(writeText).toHaveBeenCalledWith(`${location.origin}/?c=abc`);
        expect(wrapper.find('button').attributes('title')).toBe('Link copied');
        expect(wrapper.find('[aria-live="polite"]').text()).toBe('Link copied');
    });

    it('offers no copy where the browser has no clipboard, as on a page over plain http', () => {
        vi.stubGlobal('navigator', {});
        const wrapper = mount(GalleryCard, { props: { link: 'c=abc', index: 0 } });

        expect(wrapper.find('button').exists()).toBe(false);
        expect(wrapper.find('a[aria-label="Open in new tab"]').exists()).toBe(true);
    });
});
