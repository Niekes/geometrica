import {
    select,
} from 'd3';

const s = {
    type: null,
};

const getters = {
    downloadIsOpen: state => state.type === 'download',
    galleryIsOpen: state => state.type === 'gallery',
    navigationMenuIsOpen: state => state.type === 'navigation-menu',
};

const actions = {
    openGallery({ commit }) {
        commit('setOverflow', 'hidden');
        commit('setType', 'gallery');
    },

    openNavigationMenu({ commit }) {
        commit('setOverflow', 'hidden');
        commit('setType', 'navigation-menu');
    },

    openDownload({ commit }) {
        commit('setOverflow', 'hidden');
        commit('setType', 'download');
    },

    close({ commit }) {
        commit('setOverflow', 'auto');
        commit('setType', null);
    },
};

const mutations = {
    setOverflow(st, overflow) {
        select('body').style('overflow', overflow);
    },

    setType: (st, t) => {
        const state = st;
        state.type = t;
    },

};

export default {
    namespaced: true,
    state: s,
    getters,
    actions,
    mutations,
};
