import { mount } from '@vue/test-utils';
import SvgIcon from '@/components/SvgIcon';

describe('SvgIcon.vue', () => {
    it('is a Vue instance', () => {
        const wrapper = mount(SvgIcon);
        expect(wrapper.isVueInstance()).toBeTruthy();
    });
});
