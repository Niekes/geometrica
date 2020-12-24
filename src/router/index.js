import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home';
import Faq from '@/views/Faq';
import Cookies from '@/views/Cookies';
import Imprint from '@/views/Imprint';
import config from '@/config';

Vue.use(Router);

export default new Router({
    mode: 'history',
    base: config.base,
    routes: [
        {
            path: '/',
            name: 'Home',
            component: Home,
        },
        {
            path: '/faq',
            name: 'Faq',
            component: Faq,
        },
        {
            path: '/cookies',
            name: 'Cookies',
            component: Cookies,
        },
        {
            path: '/imprint',
            name: 'Imprint',
            component: Imprint,
        },
        {
            path: '*',
            redirect: '/',
        },
    ],
});
