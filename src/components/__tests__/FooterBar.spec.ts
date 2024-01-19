import { describe, it, expect } from 'vitest';

import { shallowMount } from '@vue/test-utils';
import FooterBar from '../base/FooterBar.vue';

describe('FooterBar', () => {
    it('renders properly', () => {
        const wrapper = shallowMount(FooterBar);
        expect(wrapper.text()).toContain('© niekes.com');
    });
});
