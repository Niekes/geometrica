import { type ColorInterPolator } from './ColorInterPolators';

export type Polygon = {
    amount: number;
    applyColorSchemeToEachShape: boolean;
    bgBorderRadius: number;
    bgColor: string;
    borderRadius: number;
    calcOpacity: Array<'interpolate' | 'flip'>;
    calcStrokeWidth: Array<'interpolate' | 'flip'>;
    colorInterPolator: ColorInterPolator;
    cx: number;
    cy: number;
    distance: number;
    flipColorInterpolator: boolean;
    rotation: number;
    sides: number;
    size: number;
    strokeWidth: number;
};
