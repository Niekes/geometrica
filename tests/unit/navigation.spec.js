import { shallowMount, createLocalVue } from '@vue/test-utils';
import VueRouter from 'vue-router';
import Navigation from '@/components/Navigation';

const localVue = createLocalVue();
localVue.use(VueRouter);
const router = new VueRouter();

describe('Navigation.vue', () => {
    it('is a Vue instance', () => {
        const wrapper = shallowMount(Navigation, {
            router,
            localVue,
            mocks: {
                $t: () => {},
            },
        });
        expect(wrapper.isVueInstance()).toBeTruthy();
    });
});
