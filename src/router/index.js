import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home';
import Faq from '@/views/Faq';
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
            component: () => import(/* webpackChunkName: "cookies" */ '@/views/Cookies'),
        },
        {
            path: '/imprint',
            name: 'Imprint',
            component: () => import(/* webpackChunkName: "imprint" */ '@/views/Imprint'),
        },
        {
            path: '*',
            redirect: '/',
        },
    ],
});
