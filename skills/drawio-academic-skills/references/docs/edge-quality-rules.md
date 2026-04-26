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
   - When multiple edges leave or enter the same face, use `0.25`, `0.5`, `0.75` slots.
5. **Preserve corridor spacing**
   - Parallel corridors should be at least `30px` apart.
6. **Keep the final segment readable**
   - The segment entering the target should be at least `30px`.
7. **Offset labels away from the line**
   - Horizontal edges: `y=-12` or stronger.
   - Vertical edges: `x=12` or stronger.
   - Do not use `labelBackgroundColor` to hide the line.

## Audit Checklist

- Does any edge cross an unrelated node?
- Do two edges share the same face slot?
- Is any arrow forced through a corner?
- Is the target entry segment too short?
- Would aligning two nodes make the arrow straight?
- Are waypoint arrays free of duplicate points?

## Default Face Policy

- Left/right faces vary on `Y`.
- Top/bottom faces vary on `X`.
- Use the following sequence when a face has multiple edges:
  - `0.25`
  - `0.5`
  - `0.75`
  - `0.33`
  - `0.66`

## When to Escalate

Use `--strict` when:

- The diagram is paper-facing.
- The diagram is dense enough that routing quality affects readability.
- The output is intended to be reused as a reference asset or screenshot.
