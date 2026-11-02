# Recipes

What the engine can and cannot do, learned while recreating references. Each entry holds for any reference.

## Placement

- **Even ring of n instances** around the surface center at radius r: `cx = −r`, `rotationCx = r`, `rotation = 360 · (n − 1) / n` (times the number of turns for a spiral). Rotation is a whole number: when n does not divide 360, round it; the last instance then misses by under half a degree.
- **Instance 0 of a preset is unturned**: a rect sits axis-aligned, a polygon has a corner pointing up. A fan that starts at another angle needs a custom motif drawn already turned; one motif with four petals fans all four in one layer.
- **Exact alignment across layers**: start a custom path with `M-h -hM h h`, set `size = 2h` and `cx = cy = 0`. Path units then equal surface px from the surface center, with y pointing down (unlike `cy`, which points up).
- **Ring of an off-center motif**: draw the motif in surface px from the ring center, set `cx`/`cy` to the center of its box (`cy` up) and `rotationCx`/`rotationCy` to their negatives. Instance 0 then stands unturned where it was drawn.
- **Mirrored half rings**: two layers with the same motif, `rotation` +180 and −180, both starting at the top, mirror anything that walks along the repetition (color, fade) left to right.

## Repetition

- Instance i is `i × distance` px smaller in its base dimension (diameter, size, or both sides of a rect), so any point moves at most `|distance| / 2 ≤ 32` px per instance. Rings farther apart than that come from separate layers, from an orbit around the rotation center, or from `scale`.
- **Tunnel or spiral**: `scale` is the size of the last instance relative to the first, spread geometrically like the rotation. Each instance scales toward the rotation center, its position and stroke along. With the rotation center away from the position, `rotation` 0 runs a tunnel into it and a rotation winds a logarithmic spiral. Shrink still steps in px in place on top of it: set `distance` 0 for a clean spiral.
- **Lattice of equal cells**: `columns` × `rows` cells divide the shape's size (width and height, the diameters, or `size`), less `columnGap` and `rowGap`; `offsetRows` shifts every second row by half a cell for brick and hex patterns. Each instance is the whole lattice in one color: the shrink insets every cell in place, `scale` pulls the whole lattice toward the rotation center into a dome or tunnel. Prefer it to pasting the cells as one custom path.
- One layer runs one repetition. A ring of nested motifs (n positions × m sizes) cannot come from turning and shrinking together, since every position then gets another size: draw the nesting into the motif, or spend a layer per size.
- A growing repetition that drifts along an orbit nests like a tunnel only while the drift per instance stays below the growth of the radius per instance; above it the instances cross into a cusp.
- **Cells of overlapping petals** (a rosette colored by how many petals cover each spot): draw the cells, not the petals. A cell edge is a petal outline offset by half the gap; for an elliptical petal, an arc with semi-axes a ± g and b ± g. One motif holds every cell of one color within one sector.

## Color

Layer colors come only from color ramps; the background takes any CSS color.

- Without `applyColorSchemeToEachShape`, instance i takes the ramp at `i / (amount − 1)`. A single instance shows the ramp's first color, or its last with `flipColorInterpolator`.
- Cyclic ramps (Sinebow, Rainbow) are equal at both ends, so a repetition of two instances is one color.
- **Flat outline in a repeated layer**: `applyColorSchemeToEachShape` with a radial gradient centers the ramp on each instance with half its larger side as radius. The outline of a circle or a square sits at t ≥ 1, so a stroke-only layer shows the ramp's last color flat. Ellipses, long rects and elongated motifs span t from short side over long side to 1 and stay graded.
- **Flat dots in a repeated layer**: with the alignment prefix above, a dot at distance ρ from the center takes the color at t = ρ / h, and keeps it while the repetition scales. Dots at different distances in one path get different colors.
- **Flat color in each instance**: a linear gradient at 0° on a narrow radial motif (with the alignment prefix) hits only the middle of the ramp, t = 0.5. At 90° or 270° it moves to t ≈ 0.5 ∓ ρ / (2h), graded slightly along the motif.
- **Part of a ramp inside a shape**: moveto-only phantom points enlarge the motif's box, and with it the gradient. A phantom beyond the tip raises the tip's t, one beyond the base lowers the middle. Recenter `cx`/`cy` on the new box and set `size` to its larger side.
- **A gradient fixed to the surface** (e.g. top to bottom) cannot come from a gradient inside each shape, which turns with the instance. Build it from a flat base layer and the second color above it in mirrored half rings with `calcOpacity` `["interpolate", "flip"]`: the fade mixes the two.
- **Gradient mirrored about the middle** (dark tips, light flanks): a radial gradient cannot separate the tips of a tall motif from its flanks, both lie near the same distance. Draw only the upper half inside the alignment box, with a linear gradient at 90°, and complete it with `amount` 2, `rotation` 180 around the motif's middle (`rotationCy`); the turn mirrors the gradient. With the middle d px above the box center, the flanks sit at t = 0.5 − d / (2h). Let each half run 3 px past the middle: halves that only touch show a seam.
- **Flat color from the pad**: a linear gradient runs t = 0.5 + (p − box center) · u / the box's larger side and pads past 1 with the ramp's last color. Spread phantom corners to a 1024 box (`size` 1024), push the motif into one corner and aim `gradientAngle` into it: every point sits at t ≥ 1, one flat color for the whole ring, even for a 310 × 130 px motif.
- A color from inside a ramp is never flat: across a motif w px wide along the gradient, t spans at least w / 1024, so a 120 px cell drifts by ΔE ≈ 13 on Viridis.
- Known flat hits: Inferno at t ≈ 0.8 is orange (#fca50a); Greys flipped at t ≈ 0.9 is near white. No ramp ends in orange.
- The ramp end nearest a greyish navy is PuBu's (#023858, ΔE 11). Teal (#17A187) exists only inside a ramp, at Viridis ≈ 0.57.
- Spectral from 0 to 0.42 runs crimson, coral, orange, pale yellow: a warm flame.
- Megatron and Argon read pale on dark grounds.
- Alpha only mixes toward what lies below: on a dark ground a translucent layer comes out darker, never brighter. Draw a designed overlap color as its own layer.

## Shapes and strokes

- Open strokes end flat (butt caps). Round ends are filled outlines: a union of capsules under the nonzero fill rule.
- `strokeJoin` is per layer: use round where stroked shapes share corners; miter tips poke through neighbours.
- A hole in a custom path runs in the opposite winding direction.
- A circle of radius r stroked wider than 2r renders as a ring with a hole, so a stroke cannot grow a dot.
- Compact dot of radius r at (x, y): `M{x+r} {y}a{r} {r} 0 1 0 0 1z`.
- Rounding corners with a round-joined stroke (inset by r, stroke 2r) rounds outwards: an acute corner between concave sides ends in a ball. Keep such corners sharp.

## Limits

- The link must stay below about 8,000 characters: GitHub Pages answers 414 above ~8,170. Each layer costs ~270 characters before its path; long custom paths cost the most.
- An artwork holds at most ten layers; the skill aims for four.
- Positions, sizes and rotation are whole numbers; distance moves in steps of 0.1.

## Measuring

- Convert a PNG with `sips -s format bmp in.png --out in.bmp` and read the pixels with the Python standard library (`struct`), e.g. to count colors or to measure the radius of an outline per angle.
- Compare line counts only at the same resolution as the reference.
- Sample a band across its width to read its gradient: flat across but changing along the band is linear; changing across is radial.
- Along circles of growing radius, the angles of the gap lines give a petal's half-width per radius; fit its shape from that, e.g. an ellipse through the center.
