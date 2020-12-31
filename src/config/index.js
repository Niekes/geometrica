import {
    interpolateBrBG,
    interpolatePRGn,
    interpolatePiYG,
    interpolatePuOr,
    interpolateRdBu,
    interpolateRdGy,
    interpolateRdYlBu,
    interpolateRdYlGn,
    interpolateSpectral,
    interpolateBlues,
    interpolateGreens,
    interpolateGreys,
    interpolateOranges,
    interpolatePurples,
    interpolateReds,
    interpolateTurbo,
    interpolateViridis,
    interpolateInferno,
    interpolateMagma,
    interpolatePlasma,
    interpolateCividis,
    interpolateWarm,
    interpolateCool,
    interpolateCubehelixDefault,
    interpolateBuGn,
    interpolateBuPu,
    interpolateGnBu,
    interpolateOrRd,
    interpolatePuBuGn,
    interpolatePuBu,
    interpolatePuRd,
    interpolateRdPu,
    interpolateYlGnBu,
    interpolateYlGn,
    interpolateYlOrBr,
    interpolateYlOrRd,
    interpolateRainbow,
    interpolateSinebow,
} from 'd3';

import i18n from '@/i18n';

const q = new URLSearchParams(window.location.search);
const shape = q.get('shape');
const isRect = shape === 'rect';
const isCircle = shape === 'circle';
const isPolygon = shape === 'polygon';

export default {
    base: process.env.VUE_APP_BASE,
    title: process.env.VUE_APP_TITLE,
    url: process.env.VUE_APP_URL,
    version: process.env.VUE_APP_VERSION,
    links: {
        buymeacoffee: 'https://www.buymeacoffee.com/niekes',
    },
    shapes: {
        selected: shape || 'rect',
        rect: {
            amount: (isRect && +q.get('amount')) || 16,
            bgColor: '#000000',
            borderRadius: {
                tl: 0, tr: 0, bl: 0, br: 0,
            },
            colorInterPolator: 'interpolateBrBG',
            cx: (isRect && +q.get('cx')) || 0,
            cy: (isRect && +q.get('cy')) || 0,
            distance: (isRect && +q.get('distance')) || 16,
            height: (isRect && +q.get('height')) || 256,
            calcOpacity: [],
            calcOpacityOptions: [
                {
                    value: 'interpolate',
                    text: i18n.t('home.interpolateOpacity'),
                },
                {
                    value: 'flip',
                    text: i18n.t('home.flip'),
                },
            ],
            flipColorInterpolator: (isRect && JSON.parse(q.get('flipColorInterpolator'))) || false,
            flipColorInterpolatorOptions: [
                {
                    value: true,
                    text: i18n.t('home.flipColorScheme'),
                },
            ],
            rotation: (isRect && +q.get('rotation')) || 0,
            stroke: (isRect && JSON.parse(q.get('stroke'))) || true,
            strokeOptions: [
                {
                    value: true,
                    text: i18n.t('home.stroke'),
                },
                {
                    value: false,
                    text: i18n.t('home.fill'),
                },
            ],
            strokeWidth: (isRect && +q.get('strokeWidth')) || 1,
            calcStrokeWidth: [],
            calcStrokeWidthOptions: [
                {
                    value: 'interpolate',
                    text: i18n.t('home.interpolateStrokeWidth'),
                },
                {
                    value: 'flip',
                    text: i18n.t('home.flip'),
                },
            ],
            width: (isRect && +q.get('width')) || 256,
            borderRadiusIsLocked: (isRect && JSON.parse(q.get('borderRadiusIsLocked'))) || true,
            sizeIsLocked: (isRect && JSON.parse(q.get('sizeIsLocked'))) || true,

        },
        circle: {
            amount: (isCircle && +q.get('amount')) || 16,
            bgColor: '#000000',
            colorInterPolator: 'interpolateBrBG',
            cx: 0,
            cy: 0,
            distance: 16,
            flipColorInterpolator: false,
            flipColorInterpolatorOptions: [
                {
                    value: true,
                    text: i18n.t('home.flipColorScheme'),
                },
            ],
            strokeWidth: 1,
            calcStrokeWidth: [],
            calcStrokeWidthOptions: [
                {
                    value: 'interpolate',
                    text: i18n.t('home.interpolateStrokeWidth'),
                },
                {
                    value: 'flip',
                    text: i18n.t('home.flip'),
                },
            ],
            calcOpacity: [],
            calcOpacityOptions: [
                {
                    value: 'interpolate',
                    text: i18n.t('home.interpolateOpacity'),
                },
                {
                    value: 'flip',
                    text: i18n.t('home.flip'),
                },
            ],
            radiusX: 256,
            radiusY: 256,
            rotation: (isCircle && +q.get('rotation')) || 0,
            stroke: true,
            strokeOptions: [
                {
                    value: true,
                    text: i18n.t('home.stroke'),
                },
                {
                    value: false,
                    text: i18n.t('home.fill'),
                },
            ],
            radiusIsLocked: true,
        },
        polygon: {
            amount: (isPolygon && +q.get('amount')) || 16,
            bgColor: '#000000',
            borderRadius: 0,
            colorInterPolator: 'interpolateBrBG',
            cx: 0,
            cy: 0,
            distance: (isPolygon && +q.get('distance')) || 16,
            flipColorInterpolator: false,
            flipColorInterpolatorOptions: [
                {
                    value: true,
                    text: i18n.t('home.flipColorScheme'),
                },
            ],
            strokeWidth: 1,
            calcStrokeWidth: [],
            calcStrokeWidthOptions: [
                {
                    value: 'interpolate',
                    text: i18n.t('home.interpolateStrokeWidth'),
                },
                {
                    value: 'flip',
                    text: i18n.t('home.flip'),
                },
            ],
            calcOpacity: [],
            calcOpacityOptions: [
                {
                    value: 'interpolate',
                    text: i18n.t('home.interpolateOpacity'),
                },
                {
                    value: 'flip',
                    text: i18n.t('home.flip'),
                },
            ],
            rotation: 0,
            sides: 5,
            size: 256,
            stroke: true,
            strokeOptions: [
                {
                    value: true,
                    text: i18n.t('home.stroke'),
                },
                {
                    value: false,
                    text: i18n.t('home.fill'),
                },
            ],
        },
    },
    icons: [
        /* eslint-disable global-require */
        {
            src: require('@/assets/img/icon-0.png'),
            shape: 'circle',
            parameters: {
                amount: 24,
                distance: 5.6,
                radiusX: 400,
                radiusY: 265,
                rotation: 1000,
                strokeWidth: 30,
                calcOpacity: ['interpolate', 'flip'],
                colorInterPolator: 'interpolatePlasma',
                radiusIsLocked: false,
            },
        },
        {
            src: require('@/assets/img/icon-1.png'),
            shape: 'circle',
            parameters: {
                amount: 76,
                distance: 1.8,
                radiusX: 140,
                radiusY: 440,
                rotation: 1333,
                strokeWidth: 16,
                calcOpacity: ['interpolate', 'flip'],
                calcStrokeWidth: ['interpolate', 'flip'],
                colorInterPolator: 'interpolateViridis',
                radiusIsLocked: false,
            },
        },
        {
            src: require('@/assets/img/icon-2.png'),
            shape: 'circle',
            parameters: {
                amount: 33,
                distance: 3.6,
                radiusX: 422,
                radiusY: 265,
                rotation: 937,
                strokeWidth: 30,
                calcOpacity: ['interpolate', 'flip'],
                colorInterPolator: 'interpolateRdPu',
                radiusIsLocked: false,
            },
        },
        {
            src: require('@/assets/img/icon-3.png'),
            shape: 'circle',
            parameters: {
                amount: 173,
                distance: 1,
                radiusX: 162,
                radiusY: 418,
                rotation: -84,
                strokeWidth: 6,
                calcOpacity: ['interpolate', 'flip'],
                colorInterPolator: 'interpolatePlasma',
                radiusIsLocked: false,
                flipColorInterpolator: true,
            },
        },
        {
            src: require('@/assets/img/icon-0.png'),
            shape: 'rect',
            parameters: {
                amount: 22,
                bgColor: '#000000',
                borderRadius: {
                    tl: 0.1, tr: 0.1, bl: 0.5, br: 0.5,
                },
                rotation: 100,
            },
        },
        {
            src: require('@/assets/img/icon-0.png'),
            shape: 'rect',
            parameters: {
                amount: 22,
                bgColor: '#000000',
                borderRadius: {
                    tl: 0.1, tr: 0.1, bl: 0.5, br: 0.5,
                },
                rotation: 100,
            },
        },
        {
            src: require('@/assets/img/icon-0.png'),
            shape: 'rect',
            parameters: {
                amount: 22,
                bgColor: '#000000',
                borderRadius: {
                    tl: 0.1, tr: 0.1, bl: 0.5, br: 0.5,
                },
                rotation: 100,
            },
        },
        /* eslint-enable global-require */
    ],
    format: {
        float: '.2~f',
        standard: '.4~s',
        currency: '$.3~s',
        percent: '.1~%',
    },
    colorInterPolators: [
        { name: 'interpolateBrBG', fn: interpolateBrBG },
        { name: 'interpolatePRGn', fn: interpolatePRGn },
        { name: 'interpolatePiYG', fn: interpolatePiYG },
        { name: 'interpolatePuOr', fn: interpolatePuOr },
        { name: 'interpolateRdBu', fn: interpolateRdBu },
        { name: 'interpolateRdGy', fn: interpolateRdGy },
        { name: 'interpolateRdYlBu', fn: interpolateRdYlBu },
        { name: 'interpolateRdYlGn', fn: interpolateRdYlGn },
        { name: 'interpolateSpectral', fn: interpolateSpectral },
        { name: 'interpolateBlues', fn: interpolateBlues },
        { name: 'interpolateGreens', fn: interpolateGreens },
        { name: 'interpolateGreys', fn: interpolateGreys },
        { name: 'interpolateOranges', fn: interpolateOranges },
        { name: 'interpolatePurples', fn: interpolatePurples },
        { name: 'interpolateReds', fn: interpolateReds },
        { name: 'interpolateTurbo', fn: interpolateTurbo },
        { name: 'interpolateViridis', fn: interpolateViridis },
        { name: 'interpolateInferno', fn: interpolateInferno },
        { name: 'interpolateMagma', fn: interpolateMagma },
        { name: 'interpolatePlasma', fn: interpolatePlasma },
        { name: 'interpolateCividis', fn: interpolateCividis },
        { name: 'interpolateWarm', fn: interpolateWarm },
        { name: 'interpolateCool', fn: interpolateCool },
        { name: 'interpolateCubehelixDefault', fn: interpolateCubehelixDefault },
        { name: 'interpolateBuGn', fn: interpolateBuGn },
        { name: 'interpolateBuPu', fn: interpolateBuPu },
        { name: 'interpolateGnBu', fn: interpolateGnBu },
        { name: 'interpolateOrRd', fn: interpolateOrRd },
        { name: 'interpolatePuBuGn', fn: interpolatePuBuGn },
        { name: 'interpolatePuBu', fn: interpolatePuBu },
        { name: 'interpolatePuRd', fn: interpolatePuRd },
        { name: 'interpolateRdPu', fn: interpolateRdPu },
        { name: 'interpolateYlGnBu', fn: interpolateYlGnBu },
        { name: 'interpolateYlGn', fn: interpolateYlGn },
        { name: 'interpolateYlOrBr', fn: interpolateYlOrBr },
        { name: 'interpolateYlOrRd', fn: interpolateYlOrRd },
        { name: 'interpolateRainbow', fn: interpolateRainbow },
        { name: 'interpolateSinebow', fn: interpolateSinebow },
    ],
};
