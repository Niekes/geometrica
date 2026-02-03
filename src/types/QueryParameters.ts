import { type Rect } from './Rect';
import { type Circle } from './Circle';
import { type Polygon } from './Polygon';

/**
 * Query parameters interface supporting all shape types
 * The shape field determines which properties are relevant
 */
export interface QueryParameters extends Partial<Rect>, Partial<Circle>, Partial<Polygon> {
    shape: 'rect' | 'circle' | 'polygon';
}
