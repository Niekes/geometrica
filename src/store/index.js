import Vue from 'vue';
import Vuex from 'vuex';
import canvas from '@/store/modules/canvas';
import cookies from '@/store/modules/cookies';
import mobile from '@/store/modules/mobile';
import modal from '@/store/modules/modal';

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        canvas,
        cookies,
        mobile,
        modal,
    },
});
