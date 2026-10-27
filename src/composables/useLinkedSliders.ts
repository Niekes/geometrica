import { watch, type Ref } from 'vue';
import { type Layer } from '../types/Layer';

/**
 * Watches linked layer fields and, while the lock is active and the guard
 * matches, copies a changed value onto all linked fields.
 */
export function useLinkedSliders(
    layer: Ref<Layer>,
    fields: (keyof Layer)[],
    lock: Ref<boolean>,
    isActive: () => boolean
) {
    watch(
        fields.map((field) => () => layer.value[field] as number),
        (newValues, oldValues) => {
            if (!lock.value || !isActive()) return;

            const changedIndex = newValues.findIndex((value, i) => value !== oldValues[i]);

            if (changedIndex !== -1) {
                const value = newValues[changedIndex] ?? 0;

                fields.forEach((field) => {
                    (layer.value[field] as number) = value;
                });
            }
        }
    );
}
