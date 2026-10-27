import { type ColorInterPolator } from './ColorInterPolators';

export type ShapePreset = 'rect' | 'circle' | 'polygon' | 'custom';

export type FillMode = 'stroke' | 'fill' | 'fillStroke';

export type GradientType = 'linear' | 'radial';

export type Layer = {
    id: string;
    name: string;
    visible: boolean;
    opacity: number;
    shape: ShapePreset;
    fillMode: FillMode;
    gradientType: GradientType;
    gradientAngle: number;
    path: string;
    amount: number;
    distance: number;
    rotation: number;
    cx: number;
    cy: number;
    strokeWidth: number;
    colorInterPolator: ColorInterPolator;
    applyColorSchemeToEachShape: boolean;
    flipColorInterpolator: boolean;
    calcOpacity: Array<'interpolate' | 'flip'>;
    calcStrokeWidth: Array<'interpolate' | 'flip'>;
    width: number;
    height: number;
    borderRadiusTl: number;
    borderRadiusTr: number;
    borderRadiusBl: number;
    borderRadiusBr: number;
    radiusX: number;
    radiusY: number;
    sides: number;
    borderRadius: number;
    size: number;
};
