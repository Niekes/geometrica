import { describe, it, expect } from 'vitest';

import { type Circle } from '../../types/Circle';
import { shallowMount } from '@vue/test-utils';
import CircleControl from '../CircleControl.vue';

describe('CircleControl', () => {
    it('renders correctly', () => {
        const circle: Circle = {
            amount: 16,
            applyColorSchemeToEachShape: false,
            bgBorderRadius: 10,
            bgColor: '#000',
            calcOpacity: [],
            calcStrokeWidth: [],
            colorInterPolator: 'interpolateMagma',
            cx: 0,
            cy: 0,
            distance: 32,
            flipColorInterpolator: false,
            radiusX: 512,
            radiusY: 512,
            rotation: 0,
            strokeWidth: 3
        };

        const initCircle = Object.assign({}, circle);

        const props = {
            circle,
            initCircle
        };

        const wrapper = shallowMount(CircleControl, {
            props
        });

        expect(wrapper.exists()).toBe(true);
    });

    // Add more test cases as needed
});
