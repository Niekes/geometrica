import {
    select,
} from 'd3';

import Clipboard from 'clipboard';
import flashMessageMixin from '@/mixins/flash-message-mixin';

export default {
    mixins: [flashMessageMixin],
    methods: {
        copyToClipboard(data) {
            const btn = select(document.body)
                .append('button')
                .attr('id', 'clipboard')
                .style('user-select', 'none')
                .style('position', 'absolute')
                .style('display', 'none')
                .style('visibility', 'hidden');

            let cb = new Clipboard(btn.node());

            cb.on('success', (e) => {
                e.clearSelection();
                if (data.success !== null) {
                    this.sendFlashMessage({
                        text: data.success || this.$t('general.textWasCopiedToClipboard'),
                    });
                }
            });

            cb.on('error', () => {
                this.sendFlashMessage({ text: data.error || this.$t('general.error'), type: 'error' });
            });

            select('#clipboard')
                .attr('data-clipboard-text', data.text.trim())
                .node()
                .click();

            cb = null;

            btn.remove();
        },
    },
};
