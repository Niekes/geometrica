export type Range = {
    min: number;
    max: number;
    step: number;
};

export type BaseControl = Range & {
    label: string;
    format?: (value: number) => string;
};
