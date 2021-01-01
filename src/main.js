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
import '@/assets/svg/beer.svg?sprite';
import '@/assets/svg/circle.svg?sprite';
import '@/assets/svg/close.svg?sprite';
import '@/assets/svg/lock-closed.svg?sprite';
import '@/assets/svg/lock-open.svg?sprite';
import '@/assets/svg/logo.svg?sprite';
import '@/assets/svg/menu.svg?sprite';
import '@/assets/svg/minus.svg?sprite';
import '@/assets/svg/pattern.svg?sprite';
import '@/assets/svg/plus.svg?sprite';
import '@/assets/svg/polygon.svg?sprite';
import '@/assets/svg/rect.svg?sprite';
/* eslint-enable import/extensions */

/*
    Google Analytics
*/
Vue.use(VueGtag, {
    config: {
        id: 'G-D0S3E29YB5',
    },
    appName: process.env.VUE_APP_TITLE,
    enabled: process.env.NODE_ENV === 'production' && process.env.VUE_APP_URL === 'https://geometrica.niekes.com',
}, router);

Vue.config.productionTip = false;

new Vue({
    router,
    i18n,
    store,
    render: h => h(App),
}).$mount('#app');
