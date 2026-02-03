import { canvasHeight, canvasWidth } from './canvas';
import { type Rect } from '../types/Rect';
import { type Circle } from '../types/Circle';
import { type Polygon } from '../types/Polygon';

export const defaultRect: Rect = Object.freeze({
    amount: 16,
    applyColorSchemeToEachShape: false,
    bgBorderRadius: 10,
    bgColor: '#000',
    borderRadiusBl: 0,
    borderRadiusBr: 0,
    borderRadiusTl: 0,
    borderRadiusTr: 0,
    calcOpacity: [],
    calcStrokeWidth: [],
    colorInterPolator: 'interpolateMagma',
    cx: 0,
    cy: 0,
    distance: 32,
    flipColorInterpolator: false,
    height: canvasHeight / 4,
    rotation: 0,
    strokeWidth: 3,
    width: canvasWidth / 4
});

export const defaultCircle: Circle = Object.freeze({
    amount: 16,
    applyColorSchemeToEachShape: false,
    bgBorderRadius: 10,
    bgColor: '#000',
    calcOpacity: [],
    calcStrokeWidth: [],
    colorInterPolator: 'interpolateMagma',
    cx: 0,
    cy: 0,
    distance: 32,
    flipColorInterpolator: false,
    radiusX: canvasHeight / 4,
    radiusY: canvasWidth / 4,
    rotation: 0,
    strokeWidth: 3
});

export const defaultPolygon: Polygon = Object.freeze({
    amount: 16,
    applyColorSchemeToEachShape: false,
    bgBorderRadius: 10,
    bgColor: '#000',
    borderRadius: 0,
    calcOpacity: [],
    calcStrokeWidth: [],
    colorInterPolator: 'interpolateMagma',
    cx: 0,
    cy: 0,
    distance: 32,
    flipColorInterpolator: false,
    rotation: 0,
    sides: 5,
    size: canvasHeight / 4,
    strokeWidth: 3
});
