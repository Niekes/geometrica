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
    interpolateLab
} from 'd3';

import { parse } from 'qs';

import { type QueryParameters } from '../interfaces/rect';

const defaults: QueryParameters = Object.freeze({
    amount: '16',
    applyColorSchemeToEachShape: 'false',
    bgBorderRadius: 10,
    bgColor: '#000000',
    borderRadius: {
        tl: '0',
        tr: '0',
        bl: '0',
        br: '0'
    },
    borderRadiusIsLocked: 'true',
    calcOpacity: [],
    calcStrokeWidth: [],
    colorInterPolator: 'interpolateBrBG',
    cx: '0',
    cy: '0',
    distance: '16',
    flipColorInterpolator: 'false',
    height: '256',
    radiusX: '256',
    radiusY: '256',
    rotation: '0',
    shape: 'rect',
    sides: '5',
    size: '256',
    sizeIsLocked: 'true',
    stroke: 'true',
    strokeWidth: '3',
    width: '256'
});

const qs: any = parse(window.location.search.substring(1));
const query: QueryParameters = qs;

const { shape } = query;
const isRect = shape === 'rect';
// const isCircle = shape === 'circle';
// const isPolygon = shape === 'polygon';

const interpolateBlueToPink = interpolateLab('#00adf6', '#e701e6');

const shapes = {
    selected: shape || defaults.shape,
    rect: {
        amount: (isRect && query.amount) || defaults.amount,
        bgColor: (isRect && query.bgColor) || defaults.bgColor,
        bgBorderRadius: (isRect && query.bgBorderRadius) || defaults.bgBorderRadius,
        borderRadius: {
            tl: (isRect && query.borderRadius?.tl) || defaults.borderRadius.tl,
            tr: (isRect && query.borderRadius?.tr) || defaults.borderRadius.tr,
            bl: (isRect && query.borderRadius?.bl) || defaults.borderRadius.bl,
            br: (isRect && query.borderRadius?.br) || defaults.borderRadius.br
        },
        colorInterPolator: (isRect && query.colorInterPolator) || defaults.colorInterPolator,
        applyColorSchemeToEachShape: isRect
            ? JSON.parse(query.applyColorSchemeToEachShape)
            : defaults.applyColorSchemeToEachShape,
        applyColorSchemeToEachShapeOptions: [
            {
                value: true,
                text: 'home.applyColorSchemeToEachRect'
            }
        ],
        cx: (isRect && +query.cx) || defaults.cx,
        cy: (isRect && +query.cy) || defaults.cy,
        distance: (isRect && +query.distance) || defaults.distance,
        height: (isRect && +query.height) || defaults.height,
        calcOpacity: (isRect && query.calcOpacity.split(',')) || defaults.calcOpacity,
        calcOpacityOptions: [
            {
                value: 'interpolate',
                text: 'home.interpolateOpacity'
            },
            {
                value: 'flip',
                text: 'home.flip'
            }
        ],
        flipColorInterpolator: isRect
            ? JSON.parse(query.flipColorInterpolator)
            : defaults.flipColorInterpolator,
        flipColorInterpolatorOptions: [
            {
                value: true,
                text: 'home.flipColorScheme'
            }
        ],
        rotation: (isRect && +query.rotation) || defaults.rotation,
        stroke: isRect ? JSON.parse(query.stroke) : defaults.stroke,
        strokeOptions: [
            {
                value: true,
                text: 'home.stroke'
            },
            {
                value: false,
                text: 'home.fill'
            }
        ],
        strokeWidth: (isRect && +query.strokeWidth) || defaults.strokeWidth,
        calcStrokeWidth: (isRect && query.calcStrokeWidth.split(',')) || defaults.calcStrokeWidth,
        calcStrokeWidthOptions: [
            {
                value: 'interpolate',
                text: 'home.interpolateStrokeWidth'
            },
            {
                value: 'flip',
                text: 'home.flip'
            }
        ],
        width: (isRect && +query.width) || defaults.width,
        borderRadiusIsLocked: isRect
            ? JSON.parse(query.borderRadiusIsLocked)
            : defaults.borderRadiusIsLocked,
        sizeIsLocked: isRect ? JSON.parse(query.sizeIsLocked) : defaults.sizeIsLocked
    }
};

const colorInterPolators: { name: string; fn: Function }[] = [
    { name: 'interpolateBrBG', fn: interpolateBrBG },
    { name: 'interpolatePRGn', fn: interpolatePRGn },
    { name: 'interpolatePiYG', fn: interpolatePiYG },
    { name: 'interpolatePuOr', fn: interpolatePuOr },
    { name: 'interpolateRdBu', fn: interpolateRdBu },
    { name: 'interpolateRdGy', fn: interpolateRdGy },
    { name: 'interpolateRdYlBu', fn: interpolateRdYlBu },
    { name: 'interpolateRdYlGn', fn: interpolateRdYlGn },
    { name: 'interpolateSpectral', fn: interpolateSpectral },
    { name: 'interpolateBlueToPink', fn: interpolateBlueToPink },
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
    { name: 'interpolateSinebow', fn: interpolateSinebow }
];

export default { defaults, shapes, colorInterPolators } as const;
