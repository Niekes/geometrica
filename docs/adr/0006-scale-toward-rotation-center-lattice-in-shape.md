# Scale toward the rotation center, lattice as part of the shape

The repetition only turned instances around one point and shrank them in place, so every artwork came out circular; a grid had to be pasted as a custom path (gallery #78). We add **scale**, the size of the last instance relative to the first, spread geometrically like the rotation: each instance scales toward the rotation center, its position and stroke along, so tunnels and logarithmic spirals need no new point on the surface, and more instances make them denser, never longer. And we make the **lattice** part of the shape: columns × rows cells divide the shape's size, each instance is a complete lattice in one color, the shrink insets every cell in place, while rotation and scale move the whole lattice.

## Considered Options

- A switch that lets the px shrink pull the position along: rejected, it gives only an evenly wound spiral and an even tunnel, and it changes what an existing field means.
- Scale as a factor per step: rejected, the amount would then change the shape of the spiral instead of its density.
- Lattice cells as instances, colored row by row: rejected, shrink and rotation would then act cell by cell and fight with the orbit around the rotation center.
- A lattice that copies the whole repetition into each cell: deferred, every cell would show the same colors; it can follow as its own option.

## Consequences

Links gain `scale`, `columns`, `rows`, `columnGap`, `rowGap` and `offsetRows`. Missing fields read as 1, 1 × 1, 0 and false, so old links draw as before and the format stays v2. Each cell multiplies the path data of every instance, so columns and rows stop at 16. Colors sweep across the cells only with the gradient within each shape.
