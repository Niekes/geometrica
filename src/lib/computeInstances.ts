import { type Layer } from '../types/Layer';

export type Instance = {
    index: number;
    k: number;
    flippedK: number;
    angle: number;
    shrink: number;
};

export function baseDimension(layer: Layer): number {
    switch (layer.shape) {
        case 'rect':
            return Math.min(layer.width, layer.height);
        case 'circle':
            return Math.min(layer.radiusX, layer.radiusY);
        default:
            return layer.size;
    }
}

export function computeInstances(layer: Layer): Instance[] {
    const adjustedAmount = layer.amount - 1;
    const radians = (layer.rotation * Math.PI) / 180;
    const base = baseDimension(layer);

    const instances: Instance[] = [];

    for (let i = 0; i < layer.amount; i += 1) {
        const shrink = i * layer.distance;

        if (base - shrink < 0) return instances;

        const k = adjustedAmount === 0 ? 0 : i / adjustedAmount;

        instances.push({
            index: i,
            k,
            flippedK: Math.abs(k - 1),
            angle: adjustedAmount === 0 ? 0 : (radians / adjustedAmount) * i,
            shrink
        });
    }

    return instances;
}
