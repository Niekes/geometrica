import { watch, onUnmounted, type Ref } from 'vue';
import { parse, stringify } from 'qs';
import type { Rect } from '../types/Rect';
import type { Circle } from '../types/Circle';
import type { Polygon } from '../types/Polygon';

interface ShapeState {
    selectedShape: Ref<string>;
    rect: Ref<Rect>;
    circle: Ref<Circle>;
    polygon: Ref<Polygon>;
}

/**
 * Composable for bidirectional URL query parameter synchronization
 * Parses URL params on init and updates URL when state changes
 */
export function useUrlSync(state: ShapeState) {
    const { selectedShape, rect, circle, polygon } = state;

    /**
     * Helper to process configuration arrays (convert string back to array)
     */
    function processParsedConfig(config: any) {
        if (!config) return {};

        // Parse arrays from comma-separated strings
        if (config.calcOpacity && typeof config.calcOpacity === 'string') {
            config.calcOpacity = config.calcOpacity.split(',');
        }
        if (config.calcStrokeWidth && typeof config.calcStrokeWidth === 'string') {
            config.calcStrokeWidth = config.calcStrokeWidth.split(',');
        }

        // Parse booleans
        if (config.applyColorSchemeToEachShape !== undefined) {
            config.applyColorSchemeToEachShape = config.applyColorSchemeToEachShape === 'true';
        }
        if (config.flipColorInterpolator !== undefined) {
            config.flipColorInterpolator = config.flipColorInterpolator === 'true';
        }

        // Parse numbers
        const numericFields = [
            'amount',
            'bgBorderRadius',
            'borderRadiusBl',
            'borderRadiusBr',
            'borderRadiusTl',
            'borderRadiusTr',
            'cx',
            'cy',
            'distance',
            'height',
            'width',
            'rotation',
            'strokeWidth',
            'radiusX',
            'radiusY',
            'sides',
            'size',
            'borderRadius'
        ];

        numericFields.forEach((field) => {
            if (config[field] !== undefined) {
                config[field] = Number(config[field]);
            }
        });

        return config;
    }

    /**
     * Parse URL query parameters and return initial state
     */
    function parseUrlParams(): any {
        const queryString = window.location.search.substring(1);
        if (!queryString) {
            return { shape: selectedShape.value };
        }

        const params: any = parse(queryString);
        return params;
    }

    /**
     * Initialize state from URL parameters
     */
    function initFromUrl() {
        const params = parseUrlParams();
        const shape = params.shape || selectedShape.value;

        selectedShape.value = shape;

        // Initialize all shapes if present in URL
        if (params.rect) {
            Object.assign(rect.value, processParsedConfig(params.rect));
        }
        if (params.circle) {
            Object.assign(circle.value, processParsedConfig(params.circle));
        }
        if (params.polygon) {
            Object.assign(polygon.value, processParsedConfig(params.polygon));
        }
    }

    /**
     * Helper to prepare config for serialization (convert arrays to strings)
     */
    function prepareConfigForUrl(config: any) {
        const processed = { ...config };

        // Convert arrays to comma-separated strings
        if (processed.calcOpacity && Array.isArray(processed.calcOpacity)) {
            processed.calcOpacity = processed.calcOpacity.join(',');
        }
        if (processed.calcStrokeWidth && Array.isArray(processed.calcStrokeWidth)) {
            processed.calcStrokeWidth = processed.calcStrokeWidth.join(',');
        }
        return processed;
    }

    /**
     * Serialize state to URL query parameters
     */
    function serializeToUrl() {
        const currentState = {
            shape: selectedShape.value,
            rect: prepareConfigForUrl(rect.value),
            circle: prepareConfigForUrl(circle.value),
            polygon: prepareConfigForUrl(polygon.value)
        };

        const queryString = stringify(currentState, {
            arrayFormat: 'comma'
        });

        const newUrl = `${window.location.pathname}?${queryString}`;
        window.history.pushState({}, '', newUrl);
    }

    /**
     * Set up watchers to sync state changes to URL
     */
    function setupWatchers() {
        // Watch selected shape - use 'sync' flush to ensure immediate URL update
        watch(
            selectedShape,
            () => {
                serializeToUrl();
            },
            { flush: 'sync' }
        );

        // Watch rect state
        watch(
            rect,
            () => {
                serializeToUrl();
            },
            { deep: true }
        );

        // Watch circle state
        watch(
            circle,
            () => {
                serializeToUrl();
            },
            { deep: true }
        );

        // Watch polygon state
        watch(
            polygon,
            () => {
                serializeToUrl();
            },
            { deep: true }
        );

        // Listen for browser navigation (back/forward)
        window.addEventListener('popstate', initFromUrl);

        onUnmounted(() => {
            window.removeEventListener('popstate', initFromUrl);
        });
    }

    return {
        initFromUrl,
        setupWatchers,
        serializeToUrl
    };
}
