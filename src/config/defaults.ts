import { surfaceSize } from './surface';
import { type Layer, type ShapePreset } from '../types/Layer';

export type Background = {
    color: string;
    opacity: number;
    borderRadius: number;
};

export const defaultBackground: Background = Object.freeze({
    color: '#000',
    opacity: 1,
    borderRadius: 10
});

// every character of a name ends up in the shared link
export const layerNameMaxLength = 40;

// an artwork stays a few repeated shapes
export const maxLayers = 10;

// a blank name would leave the layer without a label in the list
export function normalizeLayerName(name: unknown, fallback: string): string {
    if (typeof name !== 'string') return fallback;

    // the cut counts UTF-16 units like the maxlength of a text field; half an emoji, from the cut
    // or from the input, would end up as "�" in the link
    const cut = name
        .trim()
        .slice(0, layerNameMaxLength)
        .replace(/\p{Cs}/gu, '')
        .trim();

    return cut || fallback;
}

export function buildLayer(shape: ShapePreset): Layer {
    const layer: Layer = {
        id: '',
        name: '',
        visible: true,
        opacity: 1,
        shape,
        fillOpacity: 0,
        strokeOpacity: 1,
        gradientType: 'linear',
        gradientAngle: 0,
        path: '',
        amount: 16,
        distance: 32,
        rotation: 0,
        cx: 0,
        cy: 0,
        rotationCx: 0,
        rotationCy: 0,
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
