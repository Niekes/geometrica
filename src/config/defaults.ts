import { canvasHeight, canvasWidth } from './canvas';
import { type Layer, type ShapePreset } from '../types/Layer';

export type Background = {
    color: string;
    borderRadius: number;
};

export const defaultBackground: Background = Object.freeze({
    color: '#000',
    borderRadius: 10
});

export function buildLayer(shape: ShapePreset): Layer {
    const layer: Layer = {
        id: '',
        name: '',
        visible: true,
        opacity: 1,
        shape,
        fillMode: 'stroke',
        gradientType: 'linear',
        gradientAngle: 0,
        path: '',
        amount: 16,
        distance: 32,
        rotation: 0,
        cx: 0,
        cy: 0,
        strokeWidth: 3,
        colorInterPolator: 'interpolateMagma',
        applyColorSchemeToEachShape: false,
        flipColorInterpolator: false,
        calcOpacity: [],
        calcStrokeWidth: [],
        width: canvasWidth / 4,
        height: canvasHeight / 4,
        borderRadiusTl: 0,
        borderRadiusTr: 0,
        borderRadiusBl: 0,
        borderRadiusBr: 0,
        radiusX: canvasHeight / 4,
        radiusY: canvasWidth / 4,
        sides: 5,
        borderRadius: 0,
        size: canvasHeight / 4
    };

    return layer;
}
