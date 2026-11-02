import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import UndoRedoButtons from '../UndoRedoButtons.vue';

describe('UndoRedoButtons', () => {
    it('greys out what there is nothing for and reports a click on the other', async () => {
        const wrapper = mount(UndoRedoButtons, { props: { canUndo: true, canRedo: false } });
        const [undo, redo] = wrapper.findAll('button');

        expect(undo!.attributes('aria-label')).toMatch(/^Undo \(.+Z\)$/);
        expect(undo!.attributes('disabled')).toBeUndefined();
        expect(redo!.attributes('disabled')).toBeDefined();

        await undo!.trigger('click');

        expect(wrapper.emitted('undo')).toHaveLength(1);
    });
});
