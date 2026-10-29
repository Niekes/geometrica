# Recipes

What the engine can and cannot do, learned while recreating references. Each entry holds for any reference.

## Placement

- **Even ring of n instances** around the surface center at radius r: `cx = −r`, `rotationCx = r`, `rotation = 360 · (n − 1) / n` (times the number of turns for a spiral). Rotation is a whole number: when n does not divide 360, round it; the last instance then misses by under half a degree.
- **Instance 0 of a preset is unturned**: a rect sits axis-aligned, a polygon has a corner pointing up. A fan that starts at another angle needs a custom motif drawn already turned; one motif with four petals fans all four in one layer.
- **Exact alignment across layers**: start a custom path with `M-h -hM h h`, set `size = 2h` and `cx = cy = 0`. Path units then equal surface px from the surface center, with y pointing down (unlike `cy`, which points up).

## Repetition

- Instance i is `i × distance` px smaller in its base dimension (diameter, size, or both sides of a rect), so any point moves at most `|distance| / 2 ≤ 32` px per instance. Rings farther apart than that come from separate layers or from an orbit around the rotation center.
- A growing repetition that drifts along an orbit nests like a tunnel only while the drift per instance stays below the growth of the radius per instance; above it the instances cross into a cusp.

## Color

Layer colors come only from color ramps; the background takes any CSS color.

- Without `applyColorSchemeToEachShape`, instance i takes the ramp at `i / (amount − 1)`. A single instance shows the ramp's first color, or its last with `flipColorInterpolator`.
- Cyclic ramps (Sinebow, Rainbow) are equal at both ends, so a repetition of two instances is one color.
- **Flat outline in a repeated layer**: `applyColorSchemeToEachShape` with a radial gradient centers the ramp on each instance with half its larger side as radius. The outline of a circle or a square sits at t ≥ 1, so a stroke-only layer shows the ramp's last color flat. Ellipses, long rects and elongated motifs span t from short side over long side to 1 and stay graded.
- **Flat dots in a repeated layer**: with the alignment prefix above, a dot at distance ρ from the center takes the color at t = ρ / h, and keeps it while the repetition scales. Dots at different distances in one path get different colors.
- **Gradient mirrored about the middle** (dark tips, light flanks): a radial gradient cannot separate the tips of a tall motif from its flanks, both lie near the same distance. Draw only the upper half inside the alignment box, with a linear gradient at 90°, and complete it with `amount` 2, `rotation` 180 around the motif's middle (`rotationCy`); the turn mirrors the gradient. With the middle d px above the box center, the flanks sit at t = 0.5 − d / (2h). Let each half run 3 px past the middle: halves that only touch show a seam.
- Known flat hits: Inferno at t ≈ 0.8 is orange (#fca50a); Greys flipped at t ≈ 0.9 is near white. No ramp ends in orange.
- Spectral from 0 to 0.42 runs crimson, coral, orange, pale yellow: a warm flame.
- Megatron and Argon read pale on dark grounds.
- Alpha only mixes toward what lies below: on a dark ground a translucent layer comes out darker, never brighter. Draw a designed overlap color as its own layer.

## Shapes and strokes

- Open strokes end flat (butt caps). Round ends are filled outlines: a union of capsules under the nonzero fill rule.
- `strokeJoin` is per layer: use round where stroked shapes share corners; miter tips poke through neighbours.
- A hole in a custom path runs in the opposite winding direction.
- A circle of radius r stroked wider than 2r renders as a ring with a hole, so a stroke cannot grow a dot.
- Compact dot of radius r at (x, y): `M{x+r} {y}a{r} {r} 0 1 0 0 1z`.

## Limits

- The link must stay below about 8,000 characters: GitHub Pages answers 414 above ~8,170. Each layer costs ~270 characters before its path; long custom paths cost the most.
- An artwork holds at most ten layers; the skill aims for four.
- Positions, sizes and rotation are whole numbers; distance moves in steps of 0.1.

## Measuring

- Convert a PNG with `sips -s format bmp in.png --out in.bmp` and read the pixels with the Python standard library (`struct`), e.g. to count colors or to measure the radius of an outline per angle.
- Compare line counts only at the same resolution as the reference.
- Sample a band across its width to read its gradient: flat across but changing along the band is linear; changing across is radial.
