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
    interpolateLab,
    interpolateRgbBasis
} from 'd3';

const interpolateBlueToPink = interpolateLab('#00adf6', '#e701e6');
const interpolateMegatron = interpolateRgbBasis(['#C6FFDD', '#FBD786', '#ec38bc']);
const interpolateYoda = interpolateLab('#FF0099', '#493240');
const interpolateArgon = interpolateRgbBasis([
    '#03001e',
    '#7303c0',
    '#000',
    '#fff',
    '#ec38bc',
    '#fdeff9'
]);

export const colorInterPolators: { name: string; fn: Function }[] = [
    { name: 'interpolateMagma', fn: interpolateMagma },
    { name: 'interpolateArgon', fn: interpolateArgon },
    { name: 'interpolateMegatron', fn: interpolateMegatron },
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
    { name: 'interpolateYoda', fn: interpolateYoda },
    { name: 'interpolateViridis', fn: interpolateViridis },
    { name: 'interpolateInferno', fn: interpolateInferno },
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

export const flipColorInterpolatorOptions = [
    {
        value: false,
        label: 'Use default direction of color gradient'
    },
    {
        value: true,
        label: 'Flip color interpolator direction'
    }
];

export const applyColorSchemeToEachShapeOptions = [
    {
        value: false,
        label: 'Interpolate color scheme'
    },
    {
        value: true,
        label: 'Apply color scheme to each rectangle'
    }
];
