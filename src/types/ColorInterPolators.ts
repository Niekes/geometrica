import type * as chromatic from 'd3-scale-chromatic';

// every ramp of d3-scale-chromatic plus the custom ramps in config
export type ColorInterPolator =
    | Extract<keyof typeof chromatic, `interpolate${string}`>
    | 'interpolateArgon'
    | 'interpolateBlueToPink'
    | 'interpolateGold'
    | 'interpolateMegatron'
    | 'interpolateYoda';
