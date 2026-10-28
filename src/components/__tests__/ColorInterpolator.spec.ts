import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import ColorInterpolator from '../ColorInterpolator.vue';
import { colorInterPolators } from '../../config/colorInterPolators';

describe('ColorInterpolator', () => {
    it('shows every color ramp as a gradient swatch and marks the active one', () => {
        const wrapper = shallowMount(ColorInterpolator, { props: { active: 'interpolateMagma' } });
        const swatches = wrapper.findAll('button');

        expect(swatches).toHaveLength(colorInterPolators.length);
        expect(swatches[0]!.attributes('aria-label')).toBe('interpolateMagma');
        expect(swatches[0]!.attributes('style')).toContain('linear-gradient');
        expect(swatches[0]!.classes()).toContain('is-active');
        expect(swatches[1]!.classes()).not.toContain('is-active');
    });

    it('emits the chosen color ramp', async () => {
        const wrapper = shallowMount(ColorInterpolator, { props: { active: 'interpolateMagma' } });

        await wrapper.findAll('button')[1]!.trigger('click');

        expect(wrapper.emitted('update-color-interpolator')![0]).toEqual([colorInterPolators[1]]);
    });
});
