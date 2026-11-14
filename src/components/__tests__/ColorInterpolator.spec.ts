import { color } from 'd3';
import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import ColorInterpolator from '../ColorInterpolator.vue';
import { colorInterPolators } from '../../config/colorInterPolators';

describe('ColorInterpolator', () => {
    it('lists every color interpolator by name as a gradient and marks the active one', () => {
        const wrapper = shallowMount(ColorInterpolator, {
            props: { modelValue: 'interpolateMagma' }
        });
        const options = wrapper.findAll('button[aria-current]');
        const magma = options.find((option) => option.text() === 'Magma')!;

        expect(options).toHaveLength(colorInterPolators.length);
        expect(magma.find('span').attributes('style')).toContain('linear-gradient');
        expect(magma.attributes('aria-current')).toBe('true');
        expect(
            options.filter((option) => option.attributes('aria-current') === 'true')
        ).toHaveLength(1);
    });

    it('lists the color interpolators alphabetically, ignoring case', () => {
        const wrapper = shallowMount(ColorInterpolator, {
            props: { modelValue: 'interpolateMagma' }
        });
        const names = wrapper.findAll('button[aria-current]').map((option) => option.text());

        expect(names.slice(0, 5)).toEqual(['Argon', 'Blues', 'BlueToPink', 'BrBG', 'BuGn']);
    });

    it('offers every d3 ramp next to the custom ones, each mapping t to a color', () => {
        const names = colorInterPolators.map((interpolator) => interpolator.name);

        expect(names[0]).toBe('interpolateMagma');
        expect(names).toEqual(expect.arrayContaining(['interpolateTurbo', 'interpolateGold']));
        expect(new Set(names).size).toBe(names.length);
        expect(colorInterPolators.every(({ fn }) => color(fn(0.5)) !== null)).toBe(true);
    });

    it('filters the color interpolators by name, ignoring case', async () => {
        const wrapper = shallowMount(ColorInterpolator, {
            props: { modelValue: 'interpolateMagma' }
        });

        await wrapper.find('input[type="search"]').setValue('PINK');

        expect(wrapper.findAll('button[aria-current]').map((option) => option.text())).toEqual([
            'BlueToPink'
        ]);
    });

    it('says so when no color interpolator matches', async () => {
        const wrapper = shallowMount(ColorInterpolator, {
            props: { modelValue: 'interpolateMagma' }
        });

        await wrapper.find('input[type="search"]').setValue('zzz');

        expect(wrapper.findAll('button[aria-current]')).toHaveLength(0);
        expect(wrapper.text()).toContain('No color interpolator');
    });

    it('picks the first match on Enter', async () => {
        const wrapper = shallowMount(ColorInterpolator, {
            props: { modelValue: 'interpolateMagma' }
        });
        const search = wrapper.find('input[type="search"]');

        await search.setValue('zzz');
        await search.trigger('keydown.enter');
        await search.setValue('vir');
        // closing hands focus back to the trigger, which the same Enter would press and reopen
        const enter = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
        search.element.dispatchEvent(enter);

        expect(wrapper.emitted('update:modelValue')).toEqual([['interpolateViridis']]);
        expect(enter.defaultPrevented).toBe(true);
    });

    it('clears the search when the list closes', async () => {
        const wrapper = shallowMount(ColorInterpolator, {
            props: { modelValue: 'interpolateMagma' }
        });
        const search = wrapper.find<HTMLInputElement>('input[type="search"]');

        await search.setValue('pink');
        await wrapper.find('[popover]').trigger('toggle', { newState: 'open' });
        expect(search.element.value).toBe('pink');
        await wrapper.find('[popover]').trigger('toggle', { newState: 'closed' });

        expect(search.element.value).toBe('');
        expect(wrapper.findAll('button[aria-current]')).toHaveLength(colorInterPolators.length);
    });

    it('selects the chosen color interpolator', async () => {
        const wrapper = shallowMount(ColorInterpolator, {
            props: { modelValue: 'interpolateMagma' }
        });

        await wrapper.findAll('button[aria-current]')[1]!.trigger('click');

        expect(wrapper.emitted('update:modelValue')![0]).toEqual(['interpolateBlues']);
    });
});
