import { surfaceSize } from './surface';
import { type Background } from './defaults';
import { type Range } from '../types/Control';
import { type Layer } from '../types/Layer';

type NumericKeys<T> = { [K in keyof T]: T[K] extends number ? K : never }[keyof T];

// the sliders and the agent tools share these bounds
export const layerRanges = {
    amount: { min: 1, max: 1000, step: 1 },
    distance: { min: -64, max: 64, step: 0.1 },
    rotation: { min: -1440, max: 1440, step: 1 },
    cx: { min: -surfaceSize / 2, max: surfaceSize / 2, step: 1 },
    cy: { min: -surfaceSize / 2, max: surfaceSize / 2, step: 1 },
    // an offset from the position: from any position it reaches every point of the surface
    rotationCx: { min: -surfaceSize, max: surfaceSize, step: 1 },
    rotationCy: { min: -surfaceSize, max: surfaceSize, step: 1 },
    width: { min: 1, max: surfaceSize, step: 1 },
    height: { min: 1, max: surfaceSize, step: 1 },
    radiusX: { min: 1, max: surfaceSize, step: 1 },
    radiusY: { min: 1, max: surfaceSize, step: 1 },
    size: { min: 1, max: surfaceSize, step: 1 },
    sides: { min: 3, max: 32, step: 1 },
    borderRadius: { min: 0, max: 1, step: 0.01 },
    borderRadiusTl: { min: 0, max: 1, step: 0.01 },
    borderRadiusTr: { min: 0, max: 1, step: 0.01 },
    borderRadiusBl: { min: 0, max: 1, step: 0.01 },
    borderRadiusBr: { min: 0, max: 1, step: 0.01 },
    strokeWidth: { min: 0.1, max: surfaceSize / 2, step: 0.1 },
    opacity: { min: 0, max: 1, step: 0.01 },
    fillOpacity: { min: 0, max: 1, step: 0.01 },
    strokeOpacity: { min: 0, max: 1, step: 0.01 },
    gradientAngle: { min: 0, max: 360, step: 1 }
} satisfies Record<NumericKeys<Layer>, Range>;

export const backgroundRanges = {
    opacity: { min: 0, max: 1, step: 0.01 },
    borderRadius: { min: 0, max: 50, step: 1 }
} satisfies Record<NumericKeys<Background>, Range>;
