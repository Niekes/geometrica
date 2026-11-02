# Geometrica

Interactive generator for geometric line art: shapes are repeated on the surface, colored and exported as SVG.

## Language

### Composition

**Artwork**:
Everything composed on the surface: the background and all layers in their z-order. An artwork is exported as SVG and shared as a link.
_Avoid_: Scene, Picture, Image, Effect, Icon

**Logo**:
The artwork that identifies Geometrica in the navbar, the icons and the social preview. It is an artwork like any other, kept apart from the gallery so reordering the gallery never swaps it.
_Avoid_: Icon, Brand mark, Favicon

**Export**:
The SVG file made from an artwork: the background and all visible layers. It carries the artwork's link, the date it was made and the Geometrica version that made it, so the link reopens the artwork. Transparency pattern, grid, rotation center and bounding box are working aids and never part of it.
_Avoid_: Download, Save

**Link**:
The address that carries a complete artwork: the background and all layers with their names. It is the only storage of a shared artwork; no server resolves it. An artwork lives exactly as long as its link.
_Avoid_: URL, Permalink, Short link, Hash

**Surface**:
The square area on which layers are composed. Everything drawn on it is exported; the transparency pattern and the grid are working aids only.
_Avoid_: Canvas, Stage, Artboard, Drawing area

**Background**:
Color, opacity and corner radius of the surface. It belongs to no layer and is part of the export; instances are clipped to its shape.
_Avoid_: bgColor, Canvas background

**Background opacity**:
The opacity of the background, continuous from 0 (transparent) to 1.
_Avoid_: Alpha, Background transparency

**Transparency pattern**:
The checkered pattern behind the surface that makes the transparent areas of the export visible. It is not exported.
_Avoid_: Checkerboard, Chessboard

**Grid**:
Guide lines and keylines over the surface for aligning shapes. It scales with the surface and is not exported.
_Avoid_: Lattice, Raster

**Keyline**:
A guide shape of the grid following the Material icon guidelines: circle, inner circle, square, portrait or landscape rectangle.
_Avoid_: Guide shape

**Snap**:
Aligning the position or the rotation center of a layer to the grid lines while it is moved on the surface. The rotation center also snaps to the position. It is turned on and off independently of the grid.
_Avoid_: Magnet, Lock

**Shape**:
A path geometry (Rect, Circle, Polygon or a custom shape from pasted SVG paths). Several pasted paths form one shape together, and so do the cells of a lattice. The shape itself is only the geometry, without repetition or style parameters.
_Avoid_: Figure, Object

**Position**:
How far the center of the shape lies from the center of the surface. All instances of a layer share it.
_Avoid_: Offset, Coordinate

**Rotation center**:
The point the instances of a layer turn around and scale toward along the repetition. Every layer has its own. It is measured from the position and moves along when the layer is moved. On the position, each instance turns around its own center; beside it, the instances circle around it. It is visible and draggable on the surface while it is shown, independent of the grid; it is never exported.
_Avoid_: Pivot, Origin, Anchor point

**Bounding box**:
The rectangle around all instances of the selected layer, including their stroke. It shows that the layer can be moved right now. It is a working aid and never exported.
_Avoid_: Selection frame, Selection

**Instance**:
One drawn occurrence of a shape on the surface.
_Avoid_: Copy, Iteration

**Repetition**:
The sequence of instances of a shape, controlled by amount, shrink, rotation and scale.
_Avoid_: Loop, Series

**Shrink**:
How many px each instance is smaller than the one before. The shape gets smaller in place, in a lattice every cell on its own; shrink alone never moves an instance or a cell.
_Avoid_: Distance, Inset

**Scale**:
The size of the last instance relative to the first, spread evenly over the repetition like the rotation. Each instance scales toward the rotation center, its position and its stroke along, so the instances run into a tunnel or a spiral. More instances make it denser, never longer.
_Avoid_: Zoom, Factor, Perspective

**Lattice**:
The shape laid out in columns and rows of cells, with a gap between the columns and one between the rows, and optionally every second row shifted by half a cell. The cells divide the shape's size among them, and the whole lattice is one shape: each instance is a complete lattice in one color.
_Avoid_: Grid (the guide lines), Tiling, Array, Matrix

**Cell**:
One place of a lattice, holding the shape's outline once.
_Avoid_: Tile, Slot

**Layer**:
A complete configuration of shape, repetition, color and fill. Layers stack in z-order on the surface; an artwork holds at most ten. Every layer carries a freely chosen name that labels it in the layer list. The name travels in the link, and through the link embedded in the export, but is never drawn.
_Avoid_: Level, Plane

**Preset**:
A ready-made shape choice within a layer. Rect, Circle and Polygon are presets, not modes of their own.
_Avoid_: Shape type, Primitive

### Color & fill

**Gradient**:
A color transition that fills the area of an instance (linear or radial), with color stops from a color interpolator.
_Avoid_: Color scheme

**Sequence gradient**:
The colors along the repetition: the place of an instance in the repetition picks its color from the color interpolator.
_Avoid_: Color interpolation across instances

**Color interpolator**:
A named d3 color ramp function that maps a position in [0..1] to a color.
_Avoid_: Color scheme, Palette

**Fill opacity**:
The opacity of the fill of an instance, continuous from 0 (no fill) to 1. Fill and stroke share the same color.
_Avoid_: Fill mode, Draw mode

**Stroke opacity**:
The opacity of the stroke of an instance, continuous from 0 (no stroke) to 1. It is set independently of the fill opacity.
_Avoid_: Fill mode, Draw mode

**Stroke join**:
How the stroke of an instance turns a sharp corner: miter (pointed), round or bevel (cut off). Corners without a sharp turn, such as rounded corners and circles, look the same in all three.
_Avoid_: Line join, Corner style, Join type

**Layer opacity**:
The opacity of a whole layer, which fades fill opacity and stroke opacity together. Overlapping instances of the same layer still add up.
_Avoid_: Layer alpha, Layer transparency

### Interaction

**Agent**:
A program that reads and replaces the artwork on request, instead of someone moving the sliders.
_Avoid_: Bot, AI, Assistant

**Layer list**:
The layers of the artwork in z-order, where a layer is selected, added, duplicated, reordered, hidden, renamed or removed.
_Avoid_: Sidebar, Layer panel

**Layer properties**:
Every setting of the selected layer: shape, repetition, color and fill.
_Avoid_: Sidebar, Layer panel, Inspector, Settings panel

**Reference**:
A picture from outside Geometrica (PNG or SVG) that an artwork is recreated from. It is never part of the artwork or its export.
_Avoid_: Image, Template, Source image

**Gallery**:
The curated collection of finished artworks, from which one is opened to keep working on it. Each artwork in it carries a name that is unique within the gallery and describes what it shows. The name belongs to the gallery, not to the artwork: it is never part of the link or the export.
_Avoid_: Templates, Examples, Presets, Number, Title

**Step**:
The artwork in its history, as it stands once a change has come to rest. A slider drag, a drag on the surface or a pause in typing a name ends one step. The agent makes steps too, so its changes are undone like any other.
_Avoid_: Snapshot, Revision, Version, History entry, State

**Undo**:
Going back one step, at most to the artwork the page was opened with. It works on the whole artwork, never on one layer, and leaves the selected layer and the working aids alone.
_Avoid_: Revert, Back (the browser's button)

**Redo**:
Going forward one step that was undone. A new change after an undo discards the steps that lay ahead.
_Avoid_: Repeat, Forward

### Architecture

**Zone**:
A tier of the app architecture with fixed import rights. Dependencies point inwards only (types → config → lib → composables → components → views); fallow enforces the boundaries.
_Avoid_: Layer (collides with the artwork layer), Tier
