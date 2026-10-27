export type BaseControl = {
    min: number;
    max: number;
    step: number;
    label: string;
    format?: (value: number) => string;
};
