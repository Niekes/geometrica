// a field that holds text undoes its own typing; sliders, checkboxes and buttons hold none
const textField =
    'textarea, [contenteditable], input:not([type=range], [type=checkbox], [type=radio], [type=button], [type=color])';

// ⌘Z or Ctrl+Z undoes; with Shift, or Ctrl+Y, it redoes
export function historyShortcut(event: KeyboardEvent): 'undo' | 'redo' | null {
    if (!(event.metaKey || event.ctrlKey)) return null;
    if (event.target instanceof Element && event.target.matches(textField)) return null;

    const key = event.key.toLowerCase();

    if (key === 'z') return event.shiftKey ? 'redo' : 'undo';
    if (key === 'y' && event.ctrlKey) return 'redo';

    return null;
}
