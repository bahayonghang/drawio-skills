# Edge Quality Rules

Use these rules for professional draw.io routing. They apply to architecture diagrams, network diagrams, and paper figures.

## Blocking Rules

1. **Non-waypoint edges need full connection points**
   - Set `exitX`, `exitY`, `entryX`, `entryY`, `exitDx=0`, `exitDy=0`, `entryDx=0`, `entryDy=0`.
2. **Waypoint edges must not mix explicit connection points**
   - If `waypoints` are present, remove manual exit/entry hints.
3. **Corners are forbidden**
   - Do not use `0/0`, `0/1`, `1/0`, `1/1` corner pairs. Use face centers or distributed slots.
4. **Distribute edges on shared faces**
   - A face with a single edge connects at its `0.5` center.
   - When multiple edges leave or enter the same face, distribute them by their counterparts' projected positions (see Default Face Policy), keeping each edge collinear.
5. **Preserve corridor spacing**
   - Parallel corridors should be at least `30px` apart.
6. **Keep the final segment readable**
   - The segment entering the target should be at least `30px`.
7. **Offset labels away from the line**
   - draw.io centers an edge label on its offset point, so the offset must cover **half the label extent plus ~8px clearance** — `y=-12` only clears a single short line.
   - Horizontal edges: `y = -(8 + labelHeight/2)`. Vertical edges: `x = 8 + labelWidth/2`.
   - On a bent (fallback) edge the label anchors to the middle segment; offset perpendicular to that segment.
   - Do not use `labelBackgroundColor` to hide the line.
8. **Collinear before anything else**
   - A vertical edge must have the same absolute X at exit and entry (`sourceX + exitX × sourceWidth == targetX + entryX × targetWidth`); a horizontal edge the same absolute Y. Compute fractions from the shared absolute coordinate — never pick `0.25/0.5/0.75` blindly on both ends.
   - Anchor the shared coordinate on the center of the narrower face, clamped into the faces' overlap interval (8px off corners).
   - Only when the two faces have no overlap on the shared axis is a bend legitimate; prefer explicit waypoints there.
9. **Native bound edges only**
   - Every connector is an `edge="1"` cell with both `source` and `target` referencing node ids, so it stays attached when shapes move.
   - Never simulate a connector with standalone arrow shapes (`shape=singleArrow`, `shape=triangle`, `mxgraph.arrows2.*`) or floating edges positioned by raw coordinates. `--validate` reports both.
10. **Plain text boxes stay transparent**
    - Standalone text (captions, callouts, vertical labels) always renders `fillColor=none;strokeColor=none;labelBackgroundColor=none`. The converter ignores white fills on `type: text` and warns; use a shape node or `formula` type when a filled label is intended.

## Arrowhead Defaults

- Connectors default to a bold **open** head: `endArrow=open;endSize=12` (an unfilled two-line "V"; and `startSize=12` when a start arrow exists). Small stock arrowheads read as afterthoughts on 2px architecture connectors, so open heads still carry `endSize=12`.
- Filled heads are opt-in: explicitly-requested `block`/`classic` and UML/ER semantic markers (e.g. inheritance `endArrow=block;endFill=0`, composition `endArrow=diamond;endFill=1`) keep their own fill and also get `endSize=12`.
- Override per edge via `edge.style.endArrow` / `edge.style.endSize`, or per theme via `theme.connector.<type>.endSize`.

## Audit Checklist

- Does any edge cross an unrelated node?
- Do two edges share the same face slot?
- Is any arrow forced through a corner?
- Is the target entry segment too short?
- Is any no-waypoint edge bent although the two faces overlap on the shared axis (a collinear solution exists)?
- Is every connector a bound edge (`source` + `target` set), with no arrow-shape stand-ins?
- Does any edge label sit on its own line, cross another connector, or overlap another label?
- Are waypoint arrays free of duplicate points?

## Default Face Policy

- Left/right faces vary on `Y`.
- Top/bottom faces vary on `X`.
- Each edge takes the shared absolute coordinate derived from its counterpart (narrower-face center, clamped into the overlap interval). Edges that land within `30px` of each other on the same face spread symmetrically around their mean — both endpoints move together so the line stays straight. Bidirectional pairs become two parallel straight lines.
- The `0.25 / 0.5 / 0.75 / 0.33 / 0.66` slot sequence is only the fallback for edges whose faces have no overlap on the shared axis.

## When to Escalate

Use `--strict` when:

- The diagram is paper-facing.
- The diagram is dense enough that routing quality affects readability.
- The output is intended to be reused as a reference asset or screenshot.
