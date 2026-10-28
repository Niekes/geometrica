export type Range = {
    min: number;
    max: number;
    step: number;
};

export type BaseControl = Range & {
    label: string;
    // the field shows the value times the scale, in this unit
    scale?: number;
    unit?: string;
};
