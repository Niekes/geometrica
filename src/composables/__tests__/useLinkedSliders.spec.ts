import { describe, it, expect } from 'vitest';
import { nextTick, ref } from 'vue';
import { useLinkedSliders } from '../useLinkedSliders';
import { buildLayer } from '../../config/defaults';

describe('useLinkedSliders', () => {
    it('copies a changed value onto all linked fields while the lock is on', async () => {
        const layer = ref(buildLayer('rect'));
        const lock = ref(true);

        useLinkedSliders(
            layer,
            ['borderRadiusTl', 'borderRadiusTr', 'borderRadiusBl', 'borderRadiusBr'],
            lock,
            () => layer.value.shape === 'rect'
        );

        layer.value.borderRadiusTl = 0.5;
        await nextTick();

        expect(layer.value.borderRadiusTr).toBe(0.5);
        expect(layer.value.borderRadiusBl).toBe(0.5);
        expect(layer.value.borderRadiusBr).toBe(0.5);
    });

    it('leaves the other fields alone when the lock is off', async () => {
        const layer = ref(buildLayer('rect'));
        const lock = ref(false);

        useLinkedSliders(layer, ['width', 'height'], lock, () => layer.value.shape === 'rect');

        layer.value.width = 100;
        await nextTick();

        expect(layer.value.height).not.toBe(100);
    });

    it('does not fire for other shapes', async () => {
        const layer = ref(buildLayer('circle'));
        const lock = ref(true);

        useLinkedSliders(layer, ['width', 'height'], lock, () => layer.value.shape === 'rect');

        layer.value.width = 100;
        await nextTick();

        expect(layer.value.height).not.toBe(100);
    });
});
