import {
    select,
} from 'd3';

export default {
    methods: {
        closeModal() {
            select('.modal__mask').classed('modal__mask--fading-out', true);

            window.setTimeout(() => {
                this.$store.dispatch('modal/close');
            }, 450);
        },
    },
};
