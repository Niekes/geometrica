# Undo and redo on the browser history

Every change that comes to rest already becomes a history entry carrying the whole artwork in its link, and the browser's back and forward already restore it. We build **undo** and **redo** on exactly that history instead of keeping a list of our own: undo is `history.back()`, redo `history.forward()`, and each entry Geometrica writes carries its **step** in `history.state`, counted from 0 at the artwork the page was opened with. The step tells the buttons when there is nothing to undo, so undo never leaves the page, and it survives a reload with the entry.

## Considered Options

- An undo list of our own, for example VueUse's `useRefHistory`: rejected, it would run beside the browser history, so undo and the back button would land on different artworks, unless we gave up the back button by replacing the entry instead of pushing it; the list would also be lost on a reload and hold deep copies of every layer.
- Undo reaching back past the artwork the page was opened with: rejected, a single undo would throw away an artwork just opened from the gallery; the back button still goes there.

## Consequences

Browsers do not tell a page what lies ahead in its history, so after a reload redo stays unavailable until the next undo. A page opened without a link writes its artwork into its first entry, so the address bar shows the link from the start and undo always has an artwork to return to. A change still waiting for its 300 ms of rest is written as a step first, so undo never skips it. Undo and redo cover what the link holds; the selected layer and the working aids are not part of a step.
