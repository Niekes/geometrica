const path = require('path');
const StylelintPlugin = require('stylelint-webpack-plugin');

process.env.VUE_APP_VERSION = require('./package.json').version;

module.exports = {
    publicPath: process.env.VUE_APP_BASE,
    configureWebpack: {
        resolve: {
            alias: {
                localstyles: path.resolve(__dirname, 'src/scss/_variables.scss'),
            },
        },
        plugins: [
            new StylelintPlugin({
                files: ['**/*.vue', '**/*.scss'],
            }),
        ],
    },
    css: {
        loaderOptions: {
            sass: {
                data: `
                    @import "@/scss/_variables.scss";
                    @import '@/scss/mixins/_input-range.scss';
                `,
            },
        },
    },
    devServer: {
        hot: true,
    },
    pwa: {
        name: process.env.VUE_APP_TITLE,
        appleMobileWebAppCapable: 'yes',
        appleMobileWebAppStatusBarStyle: 'black',
        themeColor: '#000',
        workboxOptions: {
            skipWaiting: true,
        },
    },
};
