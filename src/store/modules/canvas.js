/*
    Set initital state
*/
const s = {
    ctx: null,
    height: 0,
    width: 0,
};

/*
    Set getters
*/
const getters = {
    ctx: state => state.ctx,
    height: state => state.height,
    width: state => state.width,
};

/*
    Set mutations
*/
const mutations = {

    setCtx: (st, ctx) => {
        const state = st;
        state.ctx = ctx;
    },

    setWidth: (st, width) => {
        const state = st;
        state.width = width;
    },

    setHeight: (st, height) => {
        const state = st;
        state.height = height;
    },

};

export default {
    namespaced: true,
    state: s,
    getters,
    mutations,
};
