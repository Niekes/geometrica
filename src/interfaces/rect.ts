// export interface QueryParameters {
//     amount?: string;
//     applyColorSchemeToEachShape?: string;
//     bgBorderRadius?: string;
//     bgColor?: string;
//     borderRadius?: {
//         tl?: string;
//         tr?: string;
//         bl?: string;
//         br?: string;
//     };
//     borderRadiusIsLocked?: string;
//     calcOpacity: string;
//     calcStrokeWidth: string;
//     colorInterPolator: string;
//     cx: string;
//     cy: string;
//     distance: string;
//     flipColorInterpolator: string;
//     height: string;
//     radiusX: string;
//     radiusY: string;
//     rotation: string;
//     shape: string;
//     sides: string;
//     size: string;
//     sizeIsLocked: string;
//     stroke: string;
//     strokeWidth: string;
//     width: string;
// }

export interface Rect {
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
    colorInterPolator: string;
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

export interface QueryParameters extends Rect {
    shape: string;
}
