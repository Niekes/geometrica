---
name: recreate
description: Recreate a reference (PNG or SVG) as a Geometrica artwork through WebMCP, rebuilding its construction from shapes and repetitions.
disable-model-invocation: true
argument-hint: <path to reference> [hints]
---

Recreate the reference in `$ARGUMENTS` as a Geometrica artwork. The first word is the path to the reference; everything after it is a hint from the user and outranks your own analysis.

Your target is the reference's **construction**: the rule that generates it, a motif repeated so many times, at such a distance, turned around such a center. A recreation that shares the construction but misses a color is a success; one that copies the outline without a repetition is not. Name things by [GLOSSARY.md](../../../GLOSSARY.md).

## 1. Read the reference

- **PNG**: look at it. Where a count, a radius or a color decides the construction, measure it (see _Measuring_ in [recipes.md](recipes.md)); scripts go to the scratchpad, with the Python standard library and `sips` only.
- **SVG**: read it as measurements: coordinates, colors, counts, angles, stroke widths.

Done when you know the background color, every distinct color, and for each motif its count, size and arrangement.

## 2. Find the construction

Read [recipes.md](recipes.md) first: it holds what the engine can and cannot do, learned in earlier recreations.

Write the decomposition in three to five lines, one per layer: motif (a preset, or a custom shape), repetition (amount, distance, rotation, rotation center), color ramp. Rules:

- **At most four layers, ideally one per color.** When the reference needs more, say so now and name what each extra layer buys.
- **Presets first.** A custom shape holds exactly one motif, the unit the repetition repeats: one petal, one dot, one stroke. From an SVG reference you may take the path of that one motif; the repetition draws the rest.
- **Fit a non-square reference** whole and centered into the 1024 px surface; the margin takes the reference's background color. A transparent PNG gets `background.opacity` 0.

Done when every visible element of the reference belongs to a layer, or is listed as dropped with its reason.

## 3. Open Geometrica

1. `curl -s -o /dev/null -w '%{http_code}' http://localhost:5173/geometrica/` must print 200. Otherwise start `npm run dev` in the background and repeat until it does.
2. Open `http://localhost:5173/geometrica/` in a new tab with Claude in Chrome (`tabs_context_mcp`, `tabs_create_mcp`, `navigate`).
3. In `javascript_tool`, `(await document.modelContext.getTools()).map((t) => t.name)` lists `get_artwork` and `set_artwork`. Without `document.modelContext` the browser lacks WebMCP: tell the user, and stop.

Done when both artwork tools are listed.

## 4. Build

Call `set_artwork` in `javascript_tool`; `executeTool` takes the tool object and the input as an object:

```js
const mc = document.modelContext;
const tool = (await mc.getTools()).find((t) => t.name === 'set_artwork');
await mc.executeTool(tool, { background: { … }, layers: [ … ] });
```

The field descriptions live in [artworkTools.ts](../../../src/lib/artworkTools.ts), the bounds in [ranges.ts](../../../src/config/ranges.ts), the color ramps in [colorInterPolators.ts](../../../src/config/colorInterPolators.ts) (custom ramps spelled out, the rest from d3-scale-chromatic).

Done when the call returns "Artwork replaced." Any other answer lists the reasons; correct the input and call again.

## 5. Compare and correct

Up to three rounds: read the surface's place with `document.querySelector('svg[viewBox="0 0 1024 1024"]').getBoundingClientRect()` right before each capture (it moves when the panel changes), and capture exactly that region with the `computer` action `zoom`. The region is in the screenshot's coordinate frame, which every `screenshot` reports (e.g. `1568x741`) and which can be smaller than the page: multiply the rect by frame width / `innerWidth`. Set it beside the reference and compare counts, proportions, positions, colors and stroke weights. Correct the largest deviation: `get_artwork` returns the artwork as a JSON string; parse it, drop `selectedLayer`, change what is off, and pass it to `set_artwork`.

Done when the capture shows the reference's construction, or after the third round.

## 6. Report

Leave the tab open, so the user sees the artwork.

1. The link: `location.href` through `javascript_tool`.
2. The decomposition as built, one line per layer.
3. Every deviation from the reference, each with its reason (an engine limit, the layer budget, a hint).
4. Proposed recipes: what this run taught about the engine, one line each, phrased so it helps with any reference. Add them to [recipes.md](recipes.md) once the user agrees.
