const defaults = Object.freeze({
    amount: 16 as number,
    applyColorSchemeToEachShape: false as boolean,
    bgBorderRadius: 10 as number,
    bgColor: '#000000' as string,
    borderRadius: {
        tl: 0 as number,
        tr: 0 as number,
        bl: 0 as number,
        br: 0 as number
    } as object,
    borderRadiusIsLocked: true,
    calcOpacity: [] as number[], // Assuming calcOpacity is an array of numbers
    calcStrokeWidth: [] as number[], // Assuming calcStrokeWidth is an array of numbers
    colorInterPolator: 'interpolateBrBG' as string,
    cx: 0 as number,
    cy: 0 as number,
    distance: 16 as number,
    flipColorInterpolator: false,
    height: 256 as number,
    radiusX: 256 as number,
    radiusY: 256 as number,
    rotation: 0 as number,
    shape: 'rect' as string,
    sides: 5 as number,
    size: 256 as number,
    sizeIsLocked: true as boolean,
    stroke: true as boolean,
    strokeWidth: 3 as number,
    width: 256 as number
});

export default { DEFAULTS: defaults } as const;
