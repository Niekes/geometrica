<template>
    <modal>
        <div class="download-dialogue">
            <div
                class="download-dialogue__thx"
                v-text="$t('downloadDialogue.thanksForUsing')"
            />
            <div
                class="download-dialogue__hint"
                v-text="$t('downloadDialogue.hint')"
            />
            <input
                v-model="recipient"
                :disabled="isLoading"
                class="download-dialogue__recipient"
                type="email"
                name="email"
                :placeholder="$t('downloadDialogue.pleaseEnterEmail')"
            >

            <beer-button
                class="download-dialogue__sponsor"
            />

            <base-button
                class="download-dialogue__send"
                :disabled="!isEmailValid || isLoading"
                :variant="2"
                :text="isLoading ? '...' : $t('downloadDialogue.sendImages')"
                @click.native="sendImages"
            />
        </div>
    </modal>
</template>

<script>
import axios from 'axios';

import {
    select,
} from 'd3';

import Modal from '@/components/Modal';
import BaseButton from '@/components/BaseButton';
import BeerButton from '@/components/BeerButton';
import FlashMessageMixin from '@/mixins/flash-message-mixin';

import config from '@/config';

export default {
    name: 'DownloadDialogue',

    components: {
        BeerButton,
        BaseButton,
        Modal,
    },

    mixins: [FlashMessageMixin],

    data() {
        return {
            recipient: '',
            sendImagesResponse: null,
            isLoading: false,
        };
    },

    computed: {
        isMobile() {
            return this.$store.getters['mobile/isMobile'];
        },
        isEmailValid() {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.recipient);
        },
        delaunay() {
            return this.$store.getters['canvas/delaunay'];
        },
        voronoi() {
            return this.$store.getters['canvas/voronoi'];
        },
        shape() {
            return this.$store.state.shape.shape;
        },
        fillOpacity() {
            return this.$store.state.canvas.fillOpacity;
        },
        strokeOpacity() {
            return this.$store.state.canvas.strokeOpacity;
        },
    },

    created() {
        this.buymeacoffee = config.links.buymeacoffee;
    },

    methods: {
        createSvg() {
            const data = this.shape === 'cell'
                ? this.voronoi.cellPolygons()
                : this.delaunay.trianglePolygons();

            select('#svg')
                .selectAll('path')
                .data(data)
                .enter()
                .append('path')
                .attr('fill', (d, i) => this.setColor(i).fill)
                .attr('stroke', (d, i) => this.setColor(i).stroke)
                .attr('stroke-width', 1)
                .attr('d', (d, i) => {
                    if (this.shape === 'cell') {
                        return this.voronoi.renderCell(i);
                    }

                    return this.delaunay.renderTriangle(i);
                });
        },
        emptySvg() {
            select('#svg').selectAll('path').remove();
        },

        async sendImages() {
            if (this.isEmailValid) {
                this.isLoading = true;
                this.createSvg();

                try {
                    this.sendImagesResponse = await axios({
                        method: 'POST',
                        url: 'api/send-images.php',
                        data: {
                            image: `<?xml version="1.0" encoding="UTF-8" standalone="no"?>${new XMLSerializer().serializeToString(select('#svg').node())}`,
                            recipient: this.recipient,
                        },
                    });
                } catch (error) {
                    this.sendImagesResponse = error.response;
                } finally {
                    if (this.sendImagesResponse
                        && this.sendImagesResponse.status === 201) {
                        this.recipient = '';
                        this.sendFlashMessage({
                            text: this.$t('downloadDialogue.imageSendSuccess', { recipient: this.sendImagesResponse.data.recipient }),
                        });

                        this.$gtag.event('download', {
                            event_category: this.isMobile ? 'mobile' : 'desktop',
                            event_label: 'success',
                            value: 'png|svg',
                        });
                    }

                    if (!this.sendImagesResponse
                        || ((this.sendImagesResponse && this.sendImagesResponse.status) !== 201)) {
                        this.sendFlashMessage({
                            text: this.$t('downloadDialogue.imageSendError'),
                        });

                        this.$gtag.event('download', {
                            event_category: this.isMobile ? 'mobile' : 'desktop',
                            event_label: 'error',
                            value: 'png|svg',
                        });
                    }

                    this.isLoading = false;
                    this.emptySvg();
                }
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.download-dialogue {
    display: grid;
    gap: $margin-y * 4 $margin-x * 4;
    grid-template-areas:
        "thx thx"
        "hint hint"
        "recipient recipient"
        "sponsor send";
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 3fr min-content 1fr 1fr;
    margin: 0 auto;
    max-width: $breakpoint-lg / 2;
    padding-bottom: $padding-y * 6;
    width: 100%;

    &__thx {
        align-items: center;
        display: flex;
        font-size: $font-size * 3;
        font-weight: bolder;
        grid-area: thx;
        justify-content: center;
        text-align: center;
    }

    &__hint {
        align-items: center;
        background: rgba($secondary, 0.9);
        border: $border-width solid rgba($primary, 0.75);
        border-radius: $border-radius;
        color: $white;
        display: flex;
        grid-area: hint;
        justify-content: center;
        padding: $padding;
        text-align: center;
    }

    &__recipient {
        background: rgba($secondary, 0.1);
        border: $border-width * 2 solid rgba($primary, 0.5);
        border-radius: $border-radius;
        grid-area: recipient;
        padding: $padding-y * 2 $padding-x * 2;
        transition: border $transition-duration $transition-timing-function;

        &:focus {
            border: $border-width * 2 solid $primary;
            outline: none;
        }
    }

    &__sponsor {
        grid-area: sponsor;
    }

    &__send {
        grid-area: send;
    }
}

@media (max-width: $breakpoint-sm) {
    .download-dialogue {
        padding-bottom: $padding-y;

        &__sponsor {
            font-size: $font-size * 0.8;

            svg {
                height: 1rem;
                width: 1rem;
            }
        }

        &__send {
            font-size: $font-size * 0.8;
        }
    }
}
</style>
