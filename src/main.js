import Vue from 'vue';
import VueGtag from 'vue-gtag';
import router from '@/router';
import store from '@/store';
import App from './App';
import i18n from './i18n';
import './registerServiceWorker';
/*
    Register all SVG Icons here
*/

/* eslint-disable import/extensions */
import '@/assets/svg/change.svg?sprite';
import '@/assets/svg/close.svg?sprite';
import '@/assets/svg/image.svg?sprite';
import '@/assets/svg/logo.svg?sprite';
import '@/assets/svg/reset.svg?sprite';
import '@/assets/svg/upload.svg?sprite';

/*
    Google Analytics
*/
Vue.use(VueGtag, {
    config: {
        id: 'G-XXXXXX', // TODO Add new property in google analytics
    },
    appName: process.env.VUE_APP_TITLE,
    enabled: process.env.NODE_ENV === 'production' && process.env.VUE_APP_URL === 'https://polyfy.niekes.com',
}, router);

Vue.config.productionTip = false;

new Vue({
    router,
    i18n,
    store,
    render: h => h(App),
}).$mount('#app');
