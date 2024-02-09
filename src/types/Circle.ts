import { type ColorInterPolator } from './ColorInterPolators';

export type Circle = {
    amount: number;
    applyColorSchemeToEachShape: boolean;
    bgBorderRadius: number;
    bgColor: string;
    calcOpacity: Array<'interpolate' | 'flip'>;
    calcStrokeWidth: Array<'interpolate' | 'flip'>;
    colorInterPolator: ColorInterPolator;
    cx: number;
    cy: number;
    distance: number;
    flipColorInterpolator: boolean;
    radiusX: number;
    radiusY: number;
    rotation: number;
    strokeWidth: number;
};
