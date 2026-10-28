import { surfaceSize } from './surface';
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
        width: surfaceSize / 2,
        height: surfaceSize / 2,
        borderRadiusTl: 0,
        borderRadiusTr: 0,
        borderRadiusBl: 0,
        borderRadiusBr: 0,
        radiusX: surfaceSize / 2,
        radiusY: surfaceSize / 2,
        sides: 5,
        borderRadius: 0,
        size: surfaceSize / 2
    };

    return layer;
}
