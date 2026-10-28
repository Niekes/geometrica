import { parse as qsParse, stringify as qsStringify } from 'qs';
import { type Layer, type ShapePreset } from '../types/Layer';
import { type Background, buildLayer, defaultBackground } from '../config/defaults';

export type SceneState = {
    background: Background;
    layers: Layer[];
};

const NUMERIC_FIELDS = [
    'amount',
    'borderRadius',
    'borderRadiusBl',
    'borderRadiusBr',
    'borderRadiusTl',
    'borderRadiusTr',
    'cx',
    'cy',
    'distance',
    'fillOpacity',
    'gradientAngle',
    'height',
    'opacity',
    'radiusX',
    'radiusY',
    'rotation',
    'sides',
    'size',
    'strokeOpacity',
    'strokeWidth',
    'width'
];

const BOOLEAN_FIELDS = ['applyColorSchemeToEachShape', 'flipColorInterpolator', 'visible'];

const ARRAY_FIELDS = ['calcOpacity', 'calcStrokeWidth'];

function coerceConfig(config: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(config)) {
        if (NUMERIC_FIELDS.includes(key)) {
            result[key] = Number(value);
        } else if (BOOLEAN_FIELDS.includes(key)) {
            result[key] = value === true || value === 'true';
        } else if (ARRAY_FIELDS.includes(key) && typeof value === 'string') {
            result[key] = value.split(',').filter(Boolean);
        } else {
            result[key] = value;
        }
    }

    return result;
}

const LEGACY_SHAPES: ShapePreset[] = ['rect', 'circle', 'polygon'];
const SHAPE_PRESETS: ShapePreset[] = ['rect', 'circle', 'polygon', 'custom'];

function coerceBackground(config: Record<string, unknown> | undefined): Background {
    const bg = config ?? {};

    return {
        color: typeof bg.color === 'string' ? bg.color : defaultBackground.color,
        borderRadius:
            bg.borderRadius !== undefined ? Number(bg.borderRadius) : defaultBackground.borderRadius
    };
}

// older v2 URLs store a fill mode instead of the fill and stroke opacities
const LEGACY_FILL_MODES: Record<string, Pick<Layer, 'fillOpacity' | 'strokeOpacity'>> = {
    stroke: { fillOpacity: 0, strokeOpacity: 1 },
    fill: { fillOpacity: 1, strokeOpacity: 0 },
    fillStroke: { fillOpacity: 1, strokeOpacity: 1 }
};

function coerceLayer(config: Record<string, unknown>, index: number): Layer {
    const { fillMode, ...coerced } = coerceConfig(config);
    const shape = SHAPE_PRESETS.includes(coerced.shape as ShapePreset)
        ? (coerced.shape as ShapePreset)
        : 'rect';

    return {
        ...buildLayer(shape),
        ...LEGACY_FILL_MODES[fillMode as string],
        ...coerced,
        shape,
        // custom paths only exist in v2 URLs
        path: typeof coerced.path === 'string' ? coerced.path : '',
        name:
            typeof coerced.name === 'string' && coerced.name ? coerced.name : `Layer ${index + 1}`,
        id: `l-${index}`
    };
}

export function serializeState(state: SceneState): string {
    const layers = state.layers.map(({ id: _id, ...rest }) => rest);

    return qsStringify({ v: 2, bg: state.background, l: layers });
}

export function parseState(queryString: string): SceneState | null {
    if (!queryString) return null;

    const params = qsParse(queryString);

    if (params.v === '2') {
        const rawLayers = Array.isArray(params.l) ? params.l : [];

        return {
            background: coerceBackground(params.bg as Record<string, unknown>),
            layers: rawLayers.map((config, index) =>
                coerceLayer(config as Record<string, unknown>, index)
            )
        };
    }

    // legacy v1 URLs: a single shape config becomes a single layer
    const hasLegacyParams =
        params.shape !== undefined ||
        params.rect !== undefined ||
        params.circle !== undefined ||
        params.polygon !== undefined;

    if (!hasLegacyParams) return null;

    const rawShape = typeof params.shape === 'string' ? params.shape : '';
    const source = (LEGACY_SHAPES as string[]).includes(rawShape)
        ? rawShape
        : ((LEGACY_SHAPES as string[]).find((key) => params[key] !== undefined) ?? 'rect');

    const config = (params[source] ?? {}) as Record<string, unknown>;

    const layer = coerceLayer({ ...config, shape: source }, 0);

    return {
        background: coerceBackground({
            color: config.bgColor,
            borderRadius: config.bgBorderRadius
        }),
        layers: [layer]
    };
}
