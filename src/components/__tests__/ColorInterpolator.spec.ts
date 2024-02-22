import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import ColorInterpolator from '../ColorInterpolator.vue';

describe('ColorInterpolator', () => {
    it('renders correctly', () => {
        const wrapper = shallowMount(ColorInterpolator, { props: { active: 'interpolateMagma' } });

        expect(wrapper.exists()).toBe(true);
    });

    // Add more test cases as needed
});
