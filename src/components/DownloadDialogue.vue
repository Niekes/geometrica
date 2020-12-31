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
                @focus="scrollToBottom"
            >

            <beer-button
                class="download-dialogue__sponsor"
            />

            <base-button
                class="download-dialogue__send"
                :disabled="!isEmailValid || isLoading"
                :variant="2"
                :text="isLoading ? '...' : $t('downloadDialogue.sendIcon')"
                @click.native="sendImages"
            />
        </div>
    </modal>
</template>

<script>
import axios from 'axios';

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
    },

    methods: {
        async sendImages() {
            if (this.isEmailValid) {
                this.isLoading = true;

                try {
                    this.sendImagesResponse = await axios({
                        method: 'POST',
                        url: 'api/send-images.php',
                        data: {
                            image: null,
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
                }
            }
        },
        scrollToBottom() {
            try {
                window.scrollTo({
                    top: document.body.scrollHeight,
                    left: 0,
                    behavior: 'smooth',
                });
            } catch (e) {
                window.scrollTo(0, document.body.scrollHeight);
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
    grid-template-rows: 3fr min-content min-content min-content;
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
        padding: $padding-y * 3 $padding-x * 2;
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
