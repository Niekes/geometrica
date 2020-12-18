<template>
    <modal>
        <div class="download-dialogue">
            <div class="download-dialogue__thanks">
                <div v-text="$t('downloadDialogue.thanksForUsing')" />
            </div>
            <div class="download-dialogue__reminder">
                <a
                    class="cross-fade"
                    :href="buymeacoffee"
                    target="_blank"
                    v-text="$t('downloadDialogue.pleaseConsider')"
                />
            </div>
            <div
                v-if="!isMobile"
                class="download-dialogue__control"
            >
                <base-button
                    class="control__button"
                    :variant="2"
                    :text="$t('downloadDialogue.downloadAsPng')"
                    @click.native="downloadAsPng"
                />
                <base-button
                    class="control__button"
                    :variant="2"
                    :text="$t('downloadDialogue.downloadAsSvg')"
                    @click.native="downloadAsSvg"
                />
            </div>
            <div
                v-if="isMobile"
                class="download-dialogue__control--mobile"
            >
                <input
                    v-model="recipient"
                    type="email"
                    name="email"
                    :placeholder="$t('downloadDialogue.pleaseEnterEmail')"
                >
                <base-button
                    class="control__button"
                    :disabled="!isEmailValid || isLoading"
                    :variant="2"
                    :text="$t('downloadDialogue.sendImages')"
                    @click.native="sendImages"
                />
            </div>
        </div>
    </modal>
</template>

<script>
import axios from 'axios';

import {
    select,
} from 'd3';

import {
    saveSvgAsPng,
} from 'save-svg-as-png';

import Modal from '@/components/Modal';
import BaseButton from '@/components/BaseButton';
import FlashMessageMixin from '@/mixins/flash-message-mixin';

import config from '@/config';

export default {
    name: 'DownloadDialogue',

    components: {
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
    },

    created() {
        this.buymeacoffee = config.links.buymeacoffee;
    },

    methods: {
        downloadAsSvg() {
            let source = new XMLSerializer().serializeToString(select('#svg').node());

            source = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\r\n${source}`;

            const image = `data:image/svg+xml;charset=utf-8,${window.encodeURIComponent(source)}`;
            const a = document.createElement('a');

            a.style.display = 'none';
            a.href = image;

            a.setAttribute('download', `geometrica-${new Date().toISOString()}.svg`);

            document.body.appendChild(a);

            a.click();

            document.body.removeChild(a);
        },

        downloadAsPng() {
            saveSvgAsPng(select('#svg').node(), `geometrica-${new Date().toISOString()}.png`, { scale: 2 });
        },

        async sendImages() {
            if (this.isEmailValid) {
                this.isLoading = true;

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
                    if (this.sendImagesResponse.status === 201) {
                        this.recipient = '';
                        this.sendFlashMessage({
                            text: this.$t('downloadDialogue.imageSendSuccess', { recipient: this.sendImagesResponse.data.recipient }),
                        });
                    }

                    if (this.sendImagesResponse.status !== 201) {
                        this.sendFlashMessage({
                            text: this.$t('downloadDialogue.imageSendError'),
                        });
                    }

                    this.isLoading = false;
                }
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.download-dialogue {
    display: grid;
    gap: $margin-y * 2 0;
    grid-template-areas: "thanks" "reminder" "control";
    grid-template-columns: 1fr;
    grid-template-rows: min-content min-content 1fr;
}

.download-dialogue__thanks {
    display: flex;
    font-size: $font-size * 3;
    font-weight: bolder;
    grid-area: thanks;
    justify-content: center;
    margin: $margin-y * 4 0;
}

.download-dialogue__reminder {
    display: flex;
    font-size: $font-size * 2.5;
    font-weight: lighter;
    grid-area: reminder;
    justify-content: center;
    margin: $margin-y * 4 0;
}

.download-dialogue__control {
    align-items: center;
    display: flex;
    grid-area: control;
    justify-content: space-evenly;

    &--mobile {
        align-items: center;
        display: flex;
        flex-direction: column;
        grid-area: control;
        justify-content: space-evenly;

        input {
            border: $border-width $black solid;
            border-radius: $border-radius;
            max-width: 35rem;
            padding: $padding-y * 2;
            width: 100%;
        }
    }
}

.cross-fade {
    border: $border-width $black solid;
    border-radius: $border-radius;
    color: $primary;
    display: inline-block;
    overflow: hidden;
    padding: $padding-y * 2 $padding-x * 2;
    position: relative;
    text-align: center;
    text-decoration: none;
    transition: color $transition-duration * 1.25 $transition-timing-function;
    z-index: 1;

    &::before,
    &::after {
        content: '';
        height: 100%;
        left: -25%;
        position: absolute;
        top: 0;
        transition: transform $transition-duration * 1.25 $transition-timing-function;
        width: 150%;
        z-index: -1;
    }

    &::before {
        background: rgba($primary, 0.5);
        transform: translate3d(100%, 0, 0) skew(20deg);
        transform-origin: 0 0;
    }

    &::after {
        background: rgba($tertiary, 0.5);
        transform: translate3d(-100%, 0, 0) skew(20deg);
        transform-origin: 100% 100%;
    }

    &:hover {
        color: $white;

        &::before,
        &::after {
            transform: translate3d(0, 0, 0) skew(20deg);
        }
    }
}

.control__button {
    padding: $padding-y * 3 $padding-x * 3.5;
}

@media (max-width: $breakpoint-sm) {
    .download-dialogue__thanks {
        font-size: $font-size * 2;
        margin: $margin-y * 3 0;
        width: 100%;
    }

    .download-dialogue__reminder {
        font-size: $font-size * 1.5;
        margin: $margin-y * 3 0;
        width: 100%;

        a {
            width: 100%;
        }
    }
}
</style>
