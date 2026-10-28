import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseRangeSlider from '../BaseRangeSlider.vue';

const mountSlider = (modelValue: number, props = {}) =>
    mount(BaseRangeSlider, {
        props: {
            modelValue,
            min: 0,
            max: 1,
            step: 0.01,
            label: 'Opacity',
            scale: 100,
            unit: '%',
            'onUpdate:modelValue': () => {},
            ...props
        }
    });

const emitted = (wrapper: ReturnType<typeof mountSlider>) =>
    wrapper.emitted('update:modelValue')!.map(([value]) => value);

describe('BaseRangeSlider', () => {
    it('names both inputs and shows the value in its unit', () => {
        const wrapper = mountSlider(0.5);
        const field = wrapper.find('input[type="number"]');
        const range = wrapper.find('input[type="range"]');

        expect(field.attributes('aria-label')).toBe('Opacity');
        expect(wrapper.find('label').attributes('for')).toBe(range.attributes('id'));
        expect((field.element as HTMLInputElement).value).toBe('50');
        expect(wrapper.text()).toContain('%');
    });

    it('takes a typed value in its unit and clamps it once the field is left', async () => {
        const wrapper = mountSlider(0.5);
        const field = wrapper.find('input[type="number"]');
        const type = async (value: string, event: 'input' | 'change') => {
            (field.element as HTMLInputElement).value = value;
            await field.trigger(event);
        };

        await type('33', 'input');
        // out of range: waits while typing, clamps once the field is left
        await type('250', 'input');
        await type('250', 'change');

        expect(emitted(wrapper)).toEqual([0.33, 1]);
    });

    it('counts its steps from min like the native slider', async () => {
        const wrapper = mountSlider(0.5, { min: 0.5, max: 10.5, step: 1, scale: 1 });
        const field = wrapper.find('input[type="number"]');

        (field.element as HTMLInputElement).value = '3.2';
        await field.trigger('input');

        expect(emitted(wrapper)).toEqual([3.5]);
    });

    it('moves ten steps with Shift and an arrow key', async () => {
        const wrapper = mountSlider(0.5);

        await wrapper
            .find('input[type="range"]')
            .trigger('keydown', { key: 'ArrowUp', shiftKey: true });
        await wrapper
            .find('input[type="number"]')
            .trigger('keydown', { key: 'ArrowDown', shiftKey: true });

        expect(emitted(wrapper)).toEqual([0.6, 0.4]);
    });
});
