import { type GradientType, type ShapePreset, type StrokeJoin } from '../types/Layer';

export const shapeOptions: { value: ShapePreset; label: string }[] = [
    { value: 'rect', label: 'Rect' },
    { value: 'circle', label: 'Circle' },
    { value: 'polygon', label: 'Polygon' },
    { value: 'custom', label: 'Custom' }
];

// "reverse" alone leaves the opacity as it is, but tapers the width the other way round
export const calcOpacityOptions = [
    { value: 'interpolate', label: 'Fade along the repetition' },
    { value: 'flip', label: 'Reverse the fade' }
];

export const calcStrokeWidthOptions = [
    { value: 'interpolate', label: 'Taper along the repetition' },
    { value: 'flip', label: 'Reverse the taper' }
];

export const colorModeOptions = [
    { value: false, label: 'Across the repetition' },
    { value: true, label: 'Within each shape' }
];

export const gradientTypeOptions: { value: GradientType; label: string }[] = [
    { value: 'linear', label: 'Linear' },
    { value: 'radial', label: 'Radial' }
];

export const strokeJoinOptions: { value: StrokeJoin; label: string }[] = [
    { value: 'miter', label: 'Miter' },
    { value: 'round', label: 'Round' },
    { value: 'bevel', label: 'Bevel' }
];
