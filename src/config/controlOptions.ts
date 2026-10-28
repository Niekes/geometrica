export const calcStrokeWidthOptions = [
    { value: 'interpolate', label: 'Interpolate' },
    { value: 'flip', label: 'Flip interpolation' }
];

export const calcOpacityOptions = [
    { value: 'interpolate', label: 'Interpolate' },
    { value: 'flip', label: 'Flip interpolation' }
];

export const flipColorInterpolatorOptions = [
    {
        value: false,
        label: 'Use default direction of color gradient'
    },
    {
        value: true,
        label: 'Flip color interpolator direction'
    }
];

export const applyColorSchemeToEachShapeOptions = [
    {
        value: false,
        label: 'Interpolate color scheme along the repetition'
    },
    {
        value: true,
        label: 'Apply color scheme to each shape'
    }
];

export const shapeOptions = [
    { value: 'rect', label: 'Rectangle' },
    { value: 'circle', label: 'Circle' },
    { value: 'polygon', label: 'Polygon' },
    { value: 'custom', label: 'Custom Shape' }
];

export const gradientTypeOptions = [
    { value: 'linear', label: 'Linear gradient' },
    { value: 'radial', label: 'Radial gradient' }
];
