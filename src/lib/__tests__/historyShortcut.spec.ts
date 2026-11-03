import { describe, it, expect } from 'vitest';
import { historyShortcut } from '../historyShortcut';

function press(init: KeyboardEventInit, target: Element = document.body): KeyboardEvent {
    const event = new KeyboardEvent('keydown', init);
    Object.defineProperty(event, 'target', { value: target });
    return event;
}

describe('historyShortcut', () => {
    it('undoes with ⌘Z and Ctrl+Z', () => {
        expect(historyShortcut(press({ key: 'z', metaKey: true }))).toBe('undo');
        expect(historyShortcut(press({ key: 'z', ctrlKey: true }))).toBe('undo');
    });

    it('redoes with ⇧⌘Z, Ctrl+Shift+Z and Ctrl+Y', () => {
        expect(historyShortcut(press({ key: 'Z', metaKey: true, shiftKey: true }))).toBe('redo');
        expect(historyShortcut(press({ key: 'Z', ctrlKey: true, shiftKey: true }))).toBe('redo');
        expect(historyShortcut(press({ key: 'y', ctrlKey: true }))).toBe('redo');
    });

    it('ignores a plain z and other keys', () => {
        expect(historyShortcut(press({ key: 'z' }))).toBeNull();
        expect(historyShortcut(press({ key: 'x', metaKey: true }))).toBeNull();
    });

    it('leaves the shortcuts to a text field, which undoes the typing', () => {
        for (const tag of ['input', 'textarea']) {
            expect(
                historyShortcut(press({ key: 'z', metaKey: true }, document.createElement(tag)))
            ).toBeNull();
        }
    });

    it('undoes the artwork from a slider, which holds no text', () => {
        const slider = document.createElement('input');
        slider.type = 'range';

        expect(historyShortcut(press({ key: 'z', metaKey: true }, slider))).toBe('undo');
    });
});
