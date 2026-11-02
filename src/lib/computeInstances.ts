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

// the lattice spans the size of the shape: width and height, both diameters, or the size twice
function latticeSpan(layer: Layer): [number, number] {
    switch (layer.shape) {
        case 'rect':
            return [layer.width, layer.height];
        case 'circle':
            return [layer.radiusX, layer.radiusY];
        default:
            return [layer.size, layer.size];
    }
}

// the cells divide the span of the shape among them, less the gaps; a 1 × 1 lattice is the shape
export function latticeCell(layer: Layer): { cell: Layer; pitch: [number, number] } {
    const [spanX, spanY] = latticeSpan(layer);
    const width = (spanX - (layer.columns - 1) * layer.columnGap) / layer.columns;
    const height = (spanY - (layer.rows - 1) * layer.rowGap) / layer.rows;

    return {
        cell: {
            ...layer,
            width,
            height,
            radiusX: width,
            radiusY: height,
            size: Math.min(width, height)
        },
        pitch: [width + layer.columnGap, height + layer.rowGap]
    };
}

export function computeInstances(layer: Layer): Instance[] {
    const adjustedAmount = layer.amount - 1;
    const radians = (layer.rotation * Math.PI) / 180;
    // the shrink works on every cell in place, so a cell sets where the repetition ends
    const base = baseDimension(latticeCell(layer).cell);

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
