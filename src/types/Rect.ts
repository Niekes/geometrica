import { type ColorInterPolator } from './ColorInterPolators';

export type Rect = {
    amount: number;
    applyColorSchemeToEachShape: boolean;
    bgBorderRadius: number;
    bgColor: string;
    borderRadiusBl: number;
    borderRadiusBr: number;
    borderRadiusTl: number;
    borderRadiusTr: number;
    calcOpacity: Array<'interpolate' | 'flip'>;
    calcStrokeWidth: Array<'interpolate' | 'flip'>;
    colorInterPolator: ColorInterPolator;
    cx: number;
    cy: number;
    distance: number;
    flipColorInterpolator: boolean;
    height: number;
    rotation: number;
    stroke: boolean;
    strokeWidth: number;
    width: number;
}
