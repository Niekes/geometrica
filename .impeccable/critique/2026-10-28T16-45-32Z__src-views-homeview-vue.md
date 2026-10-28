---
target: Geometrica editor panel (HomeView + layer controls)
total_score: 17
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 3
target_identity: "file:/Users/niekes/Coder/geometrica/src/views/HomeView.vue"
target_fingerprint: "sha256:2287b08640b738b18b32e43c367bcab60a6da55988b186eaa71e9279a2c1f3d0"
target_path: /Users/niekes/Coder/geometrica/src/views/HomeView.vue
timestamp: 2026-10-28T16-45-32Z
slug: src-views-homeview-vue
---
Method: dual-agent (A: design review in own browser tab · B: detector + browser overlay)

## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Instant render; Stroke group silently disabled when Stroke Opacity is 0 |
| 2 | Match System / Real World | 2 | "General", "CX/CY", "color scheme"; screen readers read d3 ids |
| 3 | User Control and Freedom | 1 | No undo beyond browser back; Reset Layer is partial |
| 4 | Consistency and Standards | 1 | Corner radius built three ways; same labels, different semantics |
| 5 | Error Prevention | 2 | Stroke Opacity 0 silently kills the Stroke group |
| 6 | Recognition Rather Than Recall | 2 | 43 unnamed ramp swatches; enabling condition lives in another accordion |
| 7 | Flexibility and Efficiency | 1 | No numeric entry, no shortcuts, accordions collapse on layer switch |
| 8 | Aesthetic and Minimalist Design | 2 | Seven equal-weight cards, swatch wall, grid on by default |
| 9 | Error Recovery | 2 | Good SVG import feedback, little else |
| 10 | Help and Documentation | 1 | Tooltips only on layer row icons |
| Total | | 17/40 | Poor |

## Design Specificity Verdict
LLM: panel is a generic daisyUI form stack; the authored character lives on the canvas (keyline grid, CSS-only checkerboard, pivot marker, drag+snap, ramp swatches, gallery). Panel vocabulary ("General", "Rotation CX", "Background") ignores GLOSSARY.md (Wiederholung, Drehpunkt, Instanz, Zeichenfläche).
Deterministic: CLI 0 findings (regex-only for .vue, element rules did not run: undercount). Browser overlay 1 finding `repeating-stripes-gradient` on the transparency checkerboard (HomeView.vue:258) — false positive.

## Owner concerns
1. Stroke split: strokeOpacity in Fill & Color (LayerColorControl.vue:41) gates Stroke fieldset (LayerControl.vue:118,195); stroke paint = shared ramp. Also rotation split (General vs Position), corner radius x3 (rect accordion, polygon in Size, background raw range 0-50), layer opacity + calcOpacity (affects fill and stroke, renderScene.ts:80) under Fill. Flip semantics differ: opacity flip alone = no-op (renderScene.ts:146), stroke flip alone = interpolate (renderScene.ts:152).
2. Grid/Background to canvas: Background is exported artboard data; Grid is view-only but also gates snapping (HomeView.vue:106) and pivot marker (HomeView.vue:208), documented in GLOSSARY but invisible in UI. Canvas bar with Artboard | View clusters.
3. Layers right: anchored ~240px card top-right of canvas area, collapsible below ~1280px; left panel then needs a layer-name header.
4. Shape picker: 4 full-width unlabeled radios louder than section titles (LayerControl.vue:129); LayerList centered by justify-items-center (HomeView.vue:137); shape switch adds/removes accordions. Use a 4-icon segmented control in the layer header.

Proposed IA: Navbar (Gallery, Export) · left panel = selected layer (header: name, shape segmented, opacity, reset; sections Shape, Repeat, Position, Color, Fill, Stroke) · canvas bar (Artboard: color/opacity/radius | View: grid/snap/pivot) · right Layers card.

## Priority Issues
- [P0] Accordions and sliders not keyboard/screen-reader operable: div header without focus/aria-expanded (BaseAccordion.vue:16), collapsed content stays tabbable, slider labels unlinked (BaseRangeSlider.vue:53), unnamed steppers, radios without name (BaseRadioButton.vue:28). Fix: details/summary or button[aria-expanded], id/for, aria-label, name + fieldset/legend. /impeccable harden
- [P1] Groups follow components, not the model (concern 1). Fix: regroup per IA; Stroke Opacity becomes Stroke on/off; custom path open in Shape; rename Interpolate pairs (aligning flip logic changes shared URLs). /impeccable layout
- [P1] Document, view, layers and export share one scroll column (~3,900px open; concerns 2-4). Fix: navbar export/gallery, canvas bar, right layers card, split grid/snap/pivot. /impeccable layout
- [P1] No precise value entry: rotation ±1440° on one slider, distance ±64 step 0.1. Fix: number input in slider label, arrows ±step, Shift ×10. /impeccable polish
- [P2] Color section and labels hard to read: 43 unnamed swatches, booleans as sentence radio pairs (controlOptions.ts:11-31), active swatch via undefined --niekes-* vars (ColorInterpolator.vue:52). Fix: named grouped ramp dropdown, reverse toggle, segmented along-sequence/per-shape, ring selection. /impeccable clarify

## Persona Red Flags
Alex: no numeric entry, no shortcuts (0 keydown handlers), :key remount resets accordions/locks on layer switch (HomeView.vue:154), reorder only via arrows, no rename.
Sam: P0 items; swatches named by d3 id without aria-pressed; lock buttons unlabeled; selected layer only by tint, no aria-current; 12px uppercase 60% section labels.

## Minor Observations
Reset Layer partial (LayerControl.vue:227); grid on by default; two slider visual languages (BaseRangeSlider.vue:84); permanent scrollbars (HomeView.vue:137); dev gallery baseUrl ignores /geometrica/ (TheGallery.vue:6).

## Questions to Consider
Why is the repetition (the artwork itself) called "General" and collapsed? Is the artboard layer 0? Should a layer have two independent paints for fill and stroke?
