import {
    select,
} from 'd3';

const topOffset = 48;

export default {
    methods: {
        sendFlashMessage(context) {
            const type = context.type || 'success';
            const flashMessages = select('body').selectAll('.flash-message');
            const fmSize = flashMessages.size();
            const lastFm = flashMessages.nodes()[fmSize - 1];

            let top = topOffset;

            if (lastFm) {
                top = Number.parseInt(lastFm.style.top, 10)
                    + Number.parseInt(lastFm.offsetHeight, 10) + 16;
            }

            const flashMsg = select('body')
                .append('div')
                .attr('class', `flash-message flash-message--${type}`)
                .style('top', `-${topOffset}px`);

            const content = flashMsg
                .append('div')
                .attr('class', 'flash-message__content');

            content
                .append('span')
                .attr('class', 'flash-message__message')
                .html(`<span class="flash-message__text">${context.text}</span>`);

            flashMsg
                .transition()
                .duration(1000)
                .style('opacity', 1)
                .style('top', `${top}px`)
                .transition()
                .duration(1000)
                .delay(3000)
                .style('opacity', 0)
                .style('top', `-${topOffset}px`)
                .remove();
        },
    },
};
