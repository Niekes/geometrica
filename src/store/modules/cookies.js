/*
    Set initital state
*/
const s = {
    data: null,
};

const getters = {
    isMobile: state => state.data && state.data.isMobile,
    isTablet: state => state.data && state.data.isTablet,
    isiOs: state => state.data && state.data.isiOs,
    isAndroid: state => state.data && state.data.isAndroid,
};


/*
    Set mutations
*/
const mutations = {

    set: (st, data) => {
        const state = st;
        state.data = data;
    },

};

export default {
    namespaced: true,
    state: s,
    getters,
    mutations,
};
