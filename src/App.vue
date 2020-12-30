<template>
    <div
        id="app"
    >
        <navigation id="nav" />
        <router-view id="content" />
    </div>
</template>

<script>
import axios from 'axios';
import Navigation from '@/components/Navigation';

export default {
    name: 'Main',

    components: {
        Navigation,
    },

    data() {
        return {
            isMobileReponse: null,
            showDropItOverlay: false,
        };
    },

    async created() {
        if (process.env.NODE_ENV === 'production') {
            try {
                this.isMobileReponse = await axios({
                    url: 'api/is-mobile.php',
                });
            } catch (error) {
                throw new Error(error);
            } finally {
                if (this.isMobileReponse !== null && this.isMobileReponse.status === 200) {
                    this.$store.commit('mobile/set', this.isMobileReponse.data);
                }
            }
        }
    },
};
</script>

<style lang="scss">
@import './scss/main';

* {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

html,
body,
#app {
    height: 100%;
    max-height: 100%;
    min-height: 100%;
}

body {
    font-family:
        BeVietnam,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        Roboto,
        Helvetica,
        Arial,
        sans-serif,
        "Apple Color Emoji",
        "Segoe UI Emoji",
        "Segoe UI Symbol";
    position: relative;
}

#app {
    height: 100%;
    max-height: 100%;
    min-height: 100%;
    padding: 0;
    position: relative;
}

#nav {
    height: 70px;
    max-height: 70px;
    min-height: 70px;
}

#content {
    height: calc(100% - 70px);
    max-height: calc(100% - 70px);
    min-height: calc(100% - 70px);
}
</style>
