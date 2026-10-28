import { interpolateLab, interpolateRgbBasis } from 'd3';
import * as chromatic from 'd3-scale-chromatic';
import { type ColorInterPolator } from '../types/ColorInterPolators';

type Ramp = (t: number) => string;

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
const interpolateGold = interpolateRgbBasis([
    '#5e3d0c',
    '#b8862d',
    '#f6e3a1',
    '#d4a640',
    '#7a5418'
]);

const customRamps = {
    interpolateArgon,
    interpolateMegatron,
    interpolateBlueToPink,
    interpolateYoda,
    interpolateGold
} satisfies Partial<Record<ColorInterPolator, Ramp>>;

// every ramp d3 ships comes in by itself; Magma leads as the fallback for unknown names
const ramps = {
    interpolateMagma: chromatic.interpolateMagma,
    ...customRamps,
    ...Object.fromEntries(
        Object.entries(chromatic).filter(([name]) => name.startsWith('interpolate'))
    )
} as Record<ColorInterPolator, Ramp>;

export const colorInterPolators = Object.entries(ramps).map(([name, fn]) => ({
    name: name as ColorInterPolator,
    fn
}));
