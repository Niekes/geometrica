import { color } from 'd3';
import { normalizePath } from './pathBounds';
import { type SceneState } from './urlState';
import { colorInterPolators } from '../config/colorInterPolators';
import {
    calcOpacityOptions,
    calcStrokeWidthOptions,
    gradientTypeOptions,
    shapeOptions
} from '../config/controlOptions';
import {
    type Background,
    buildLayer,
    defaultBackground,
    layerNameMaxLength,
    maxLayers,
    normalizeLayerName
} from '../config/defaults';
import { backgroundRanges, layerRanges } from '../config/ranges';
import { surfaceSize } from '../config/surface';
import { type Range } from '../types/Control';
import { type Layer, type ShapePreset } from '../types/Layer';

// the scene hands out the ids of its layers, so an artwork from an agent carries none
export type Artwork = {
    background: Background;
    layers: Omit<Layer, 'id'>[];
};

export type ArtworkAccess = {
    read(): { artwork: SceneState; selectedLayer: number };
    write(artwork: Artwork): void;
};

type Schema = { description?: string } & (
    | { type: 'number'; minimum: number; maximum: number }
    | { type: 'integer'; minimum: number; maximum: number }
    | { type: 'boolean' }
    | { type: 'string'; enum?: string[]; maxLength?: number }
    | { type: 'array'; items: Schema; minItems?: number; maxItems?: number }
    | {
          type: 'object';
          properties: Record<string, Schema>;
          required?: string[];
          additionalProperties: false;
      }
);

const number = ({ min, max, step }: Range, description: string): Schema => {
    const bounds = { minimum: min, maximum: max, description };

    // a slider moving in whole steps never sets a fraction
    return Number.isInteger(step) ? { type: 'integer', ...bounds } : { type: 'number', ...bounds };
};

const oneOf = (options: { value: unknown }[], description?: string): Schema => ({
    type: 'string',
    enum: options.map((option) => String(option.value)),
    description
});

const corner = (name: string) =>
    `Rounding of the ${name} corner of the rect shape, 0 (sharp) to 1 (fully round).`;

const layerProperties: Record<keyof Artwork['layers'][number], Schema> = {
    name: {
        type: 'string',
        maxLength: layerNameMaxLength,
        description: 'Label of the layer in the layer list.'
    },
    visible: { type: 'boolean', description: 'A hidden layer is not drawn.' },
    shape: oneOf(shapeOptions, 'The shape preset; "custom" draws the SVG path in path.'),
    path: {
        type: 'string',
        description:
            'SVG path data of the custom shape, e.g. "M0 0 L100 0 L50 87 Z"; it is scaled to size.'
    },
    amount: number(layerRanges.amount, 'Number of instances in the repetition.'),
    distance: number(
        layerRanges.distance,
        'Pixels by which each instance is smaller than the one before; negative values grow. ' +
            'The repetition ends where an instance would shrink below zero.'
    ),
    rotation: number(
        layerRanges.rotation,
        'Degrees the last instance is turned; the instances in between turn evenly.'
    ),
    cx: number(
        layerRanges.cx,
        'Horizontal offset of the shape center from the surface center in px, positive is right.'
    ),
    cy: number(
        layerRanges.cy,
        'Vertical offset of the shape center from the surface center in px, positive is up.'
    ),
    rotationCx: number(
        layerRanges.rotationCx,
        'Horizontal offset of the rotation center from cx in px. At 0/0 every instance turns ' +
            'in place; elsewhere the instances circle around the rotation center.'
    ),
    rotationCy: number(
        layerRanges.rotationCy,
        'Vertical offset of the rotation center from cy in px, positive is up.'
    ),
    width: number(layerRanges.width, 'Width of the rect shape in px.'),
    height: number(layerRanges.height, 'Height of the rect shape in px.'),
    radiusX: number(layerRanges.radiusX, 'Width of the circle shape in px, the full diameter.'),
    radiusY: number(layerRanges.radiusY, 'Height of the circle shape in px, the full diameter.'),
    sides: number(layerRanges.sides, 'Number of sides of the polygon shape.'),
    size: number(layerRanges.size, 'Size of the polygon and the custom shape in px.'),
    borderRadius: number(
        layerRanges.borderRadius,
        'Corner radius of the polygon shape in units of 100 px, at most a quarter of size.'
    ),
    borderRadiusTl: number(layerRanges.borderRadiusTl, corner('top left')),
    borderRadiusTr: number(layerRanges.borderRadiusTr, corner('top right')),
    borderRadiusBl: number(layerRanges.borderRadiusBl, corner('bottom left')),
    borderRadiusBr: number(layerRanges.borderRadiusBr, corner('bottom right')),
    strokeWidth: number(layerRanges.strokeWidth, 'Stroke width in px.'),
    opacity: number(
        layerRanges.opacity,
        'Opacity of the whole layer; it scales fillOpacity and strokeOpacity.'
    ),
    fillOpacity: number(
        layerRanges.fillOpacity,
        'Opacity of the fill, 0 draws no fill. Fill and stroke share one color.'
    ),
    strokeOpacity: number(layerRanges.strokeOpacity, 'Opacity of the stroke, 0 draws no stroke.'),
    colorInterPolator: {
        type: 'string',
        enum: colorInterPolators.map((interpolator) => interpolator.name),
        description: 'The d3 color ramp the colors are taken from.'
    },
    flipColorInterpolator: { type: 'boolean', description: 'Runs the color ramp the other way.' },
    applyColorSchemeToEachShape: {
        type: 'boolean',
        description:
            'false: each instance has one color, taken from the color ramp from the first to the ' +
            'last instance. true: fill and stroke of each instance show the whole color ramp as ' +
            'a gradient.'
    },
    gradientType: oneOf(
        gradientTypeOptions,
        'The gradient inside each instance while applyColorSchemeToEachShape is true.'
    ),
    gradientAngle: number(layerRanges.gradientAngle, 'Angle of the linear gradient in degrees.'),
    calcOpacity: {
        type: 'array',
        items: oneOf(calcOpacityOptions),
        description:
            '["interpolate"] fades the instances in from the first to the last; add "flip" to ' +
            'fade them the other way.'
    },
    calcStrokeWidth: {
        type: 'array',
        items: oneOf(calcStrokeWidthOptions),
        description:
            '["interpolate"] grows the stroke from 0 at the first instance to strokeWidth at the ' +
            'last; ["flip"] grows it the other way.'
    }
};

const backgroundProperties: Record<keyof Background, Schema> = {
    color: { type: 'string', description: 'A CSS color, e.g. "#0b0b1a".' },
    opacity: number(backgroundRanges.opacity, 'Opacity of the background, 0 is transparent.'),
    borderRadius: number(
        backgroundRanges.borderRadius,
        'Corner rounding of the surface in percent; the instances are clipped to it.'
    )
};

const inputSchema: Schema = {
    type: 'object',
    properties: {
        background: {
            type: 'object',
            properties: backgroundProperties,
            additionalProperties: false
        },
        layers: {
            type: 'array',
            items: { type: 'object', properties: layerProperties, additionalProperties: false },
            minItems: 1,
            maxItems: maxLayers,
            description: 'The layers, layers[0] on top. Omitted fields take the shape defaults.'
        }
    },
    required: ['layers'],
    additionalProperties: false
};

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const at = (path: string, key: string) => (path ? `${path}.${key}` : key);

type Check<T extends Schema['type']> = (
    value: unknown,
    schema: Extract<Schema, { type: T }>,
    path: string
) => string[];

const within = (value: unknown, minimum: number, maximum: number) =>
    typeof value === 'number' && value >= minimum && value <= maximum;

const checks: { [T in Schema['type']]: Check<T> } = {
    number: (value, { minimum, maximum }, path) =>
        within(value, minimum, maximum)
            ? []
            : [`${path} must be a number between ${minimum} and ${maximum}`],
    integer: (value, { minimum, maximum }, path) =>
        Number.isInteger(value) && within(value, minimum, maximum)
            ? []
            : [`${path} must be a whole number between ${minimum} and ${maximum}`],
    boolean: (value, _schema, path) =>
        typeof value === 'boolean' ? [] : [`${path} must be true or false`],
    string: (value, schema, path) => {
        if (typeof value !== 'string') return [`${path} must be a string`];

        if (schema.maxLength !== undefined && value.length > schema.maxLength) {
            return [`${path} must be at most ${schema.maxLength} characters`];
        }

        return !schema.enum || schema.enum.includes(value)
            ? []
            : [`${path} must be one of ${schema.enum.join(', ')}`];
    },
    array: (value, schema, path) => {
        if (!Array.isArray(value)) return [`${path} must be an array`];

        const tooShort =
            value.length < (schema.minItems ?? 0)
                ? [`${path} must hold at least ${schema.minItems} item`]
                : [];
        const tooLong =
            value.length > (schema.maxItems ?? Infinity)
                ? [`${path} must hold at most ${schema.maxItems} items`]
                : [];

        return [
            ...tooShort,
            ...tooLong,
            ...value.flatMap((item, index) => check(item, schema.items, `${path}[${index}]`))
        ];
    },
    object: (value, schema, path) => {
        if (!isObject(value)) return [`${path || 'the input'} must be an object`];

        const missing = (schema.required ?? [])
            .filter((key) => !(key in value))
            .map((key) => `${at(path, key)} is required`);

        return [
            ...missing,
            ...Object.entries(value).flatMap(([key, item]) => {
                const property = schema.properties[key];

                return property
                    ? check(item, property, at(path, key))
                    : [`${at(path, key)} is not a known field`];
            })
        ];
    }
};

// checks the subset of JSON Schema the input schema uses, so the agent and the check share one source
function check(value: unknown, schema: Schema, path = ''): string[] {
    return checks[schema.type](value, schema as never, path);
}

function toArtwork(input: Record<string, unknown>): Artwork {
    const background = (input.background ?? {}) as Partial<Background>;
    const layers = input.layers as Partial<Layer>[];

    return {
        background: { ...defaultBackground, ...background },
        layers: layers.map((layer, index) => {
            const { id: _id, ...defaults } = buildLayer((layer.shape ?? 'rect') as ShapePreset);

            return {
                ...defaults,
                ...layer,
                name: normalizeLayerName(layer.name, `Layer ${index + 1}`)
            };
        })
    };
}

// what the schema cannot say: the renderer would silently fall back or draw nothing
function drawingProblems(artwork: Artwork): string[] {
    const problems: string[] = [];

    if (!color(artwork.background.color)) problems.push('background.color must be a CSS color');

    artwork.layers.forEach((layer, index) => {
        if (layer.shape === 'custom' && !normalizePath(layer.path, layer.size)) {
            problems.push(
                `layers[${index}].path must be SVG path data, e.g. "M0 0 L100 0 L50 87 Z"`
            );
        }
    });

    return problems;
}

// the agent reads the reasons and corrects its input
function reject(problems: string[]) {
    if (problems.length > 0) throw new Error(problems.join('\n'));
}

// WebMCP tools that let an agent in the browser read and replace the artwork
export function artworkTools(access: ArtworkAccess): ModelContextTool[] {
    return [
        {
            name: 'get_artwork',
            description:
                'Returns the artwork on the drawing surface of Geometrica: the background, the layers ' +
                '(layers[0] is drawn on top) and selectedLayer, the index of the layer the user has ' +
                'selected in the panel. Change it and pass it to set_artwork to edit the artwork; ' +
                'the selection stays with the user, so set_artwork ignores selectedLayer.',
            annotations: { readOnlyHint: true },
            execute: async () => {
                const { artwork, selectedLayer } = access.read();

                return {
                    background: artwork.background,
                    layers: artwork.layers.map(({ id: _id, ...layer }) => layer),
                    selectedLayer
                };
            }
        },
        {
            name: 'set_artwork',
            description:
                'Replaces the artwork on the drawing surface of Geometrica, a generator for ' +
                `geometric line art. The surface is ${surfaceSize} × ${surfaceSize} px with the ` +
                'origin in its center. An artwork is a background and a stack of layers, layers[0] ' +
                'on top. Each layer repeats one shape: instance i is i × distance px smaller than ' +
                'the first, turned by i × rotation / (amount − 1) degrees around the rotation ' +
                'center, and its color walks the color ramp from the first to the last instance. ' +
                'Omitted fields take the defaults of the shape, so a new artwork needs only the ' +
                'fields that matter. To change the current artwork, read it with get_artwork ' +
                'first. Invalid input is rejected with the reasons and leaves the artwork ' +
                "unchanged; the browser's back button undoes a change.",
            inputSchema,
            execute: async ({ selectedLayer: _selectedLayer, ...input }) => {
                reject(check(input, inputSchema));

                const artwork = toArtwork(input);

                reject(drawingProblems(artwork));
                access.write(artwork);

                return 'Artwork replaced.';
            }
        }
    ];
}
