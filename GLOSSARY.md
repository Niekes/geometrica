# Geometrica

Interactive generator for geometric line art: shapes are repeated on the surface, colored and exported as SVG.

## Language

### Composition

**Artwork**:
Everything composed on the surface: the background and all layers in their z-order. An artwork is exported as SVG and shared as a link.
_Avoid_: Scene, Picture, Image, Effect, Icon

**Logo**:
The artwork that identifies Geometrica in the navbar, the icons, the README and the social preview. It is an artwork like any other, kept apart from the gallery so reordering the gallery never swaps it.
_Avoid_: Icon, Brand mark, Favicon

**Export**:
The SVG file made from an artwork: the background and all visible layers. Transparency pattern, grid, rotation center and bounding box are working aids and never part of it.
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
A path geometry (Rect, Circle, Polygon or a custom shape from pasted SVG paths). Several pasted paths form one shape together. The shape itself is only the geometry, without repetition or style parameters.
_Avoid_: Figure, Object

**Position**:
How far the center of the shape lies from the center of the surface. All instances of a layer share it.
_Avoid_: Offset, Coordinate

**Rotation center**:
The point the instances of a layer turn around along the repetition. Every layer has its own. It is measured from the position and moves along when the layer is moved. On the position, each instance turns around its own center; beside it, the instances circle around it. It is visible and draggable on the surface while it is shown, independent of the grid; it is never exported.
_Avoid_: Pivot, Origin, Anchor point

**Bounding box**:
The rectangle around all instances of the selected layer, including their stroke. It shows that the layer can be moved right now. It is a working aid and never exported.
_Avoid_: Selection frame, Selection

**Instance**:
One drawn occurrence of a shape on the surface.
_Avoid_: Copy, Iteration

**Repetition**:
The sequence of instances of a shape, controlled by amount, distance and rotation.
_Avoid_: Loop, Series

**Layer**:
A complete configuration of shape, repetition, color and fill. Layers stack in z-order on the surface; an artwork holds at most ten. Every layer carries a freely chosen name that labels it in the layer list. The name travels in the shared link but is not exported.
_Avoid_: Level, Plane

**Preset**:
A ready-made shape choice within a layer. Rect, Circle and Polygon are presets, not modes of their own.
_Avoid_: Shape type

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

**Layer opacity**:
The opacity of a whole layer, which fades fill opacity and stroke opacity together. Overlapping instances of the same layer still add up.
_Avoid_: Layer alpha, Layer transparency

### Interaction

**Agent**:
A program that reads and replaces the artwork on request, instead of someone moving the sliders.
_Avoid_: Bot, AI, Assistant

**Gallery**:
The curated collection of finished artworks, from which one is opened to keep working on it.
_Avoid_: Templates, Examples, Presets

### Architecture

**Zone**:
A tier of the app architecture with fixed import rights. Dependencies point inwards only (types → config → lib → composables → components → views); fallow enforces the boundaries.
_Avoid_: Layer (collides with the artwork layer), Tier
