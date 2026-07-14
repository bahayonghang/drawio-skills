# Palette Interaction Rehearsal

Date: 2026-07-14

These two policy traces exercise the agent-facing decision path. Runtime
behavior is backed by `palette-integration.test.js`; wording and release
surfaces are backed by `tests/palette-skill-policy.test.js`.

## Case 1: Academic create for IEEE print

Prompt:

> Create an IEEE camera-ready workflow figure for single-column print. I have
> not selected a palette.

Decision trace:

1. Route to the academic overlay and determine the venue before color choice.
2. Because no palette was named, ask one single-select palette question.
3. Present `ieee-bw` first as `(Recommended)`, followed by
   `tol-high-contrast` and `ieee-color`, with colorblind/grayscale safety in
   each description.
4. Select `ieee-bw` for this rehearsal and keep the academic theme for
   typography, spacing, shapes, and line styles.
5. Normalize the decision as:

```yaml
meta:
  profile: academic-paper
  theme: academic
  palette: ieee-bw
  print:
    target: ieee-single
```

Evidence:

- `academic-ieee-print-palette` encodes the full assertion checklist in the
  academic eval set.
- `palette-integration.test.js` asserts that `ieee-bw` with
  `print.target: ieee-single` does not throw under strict validation.
- Result: PASS. The completion report must name `ieee-bw` and its safety
  flags.

## Case 2: Replicate while preserving source colors

Prompt:

> Replicate the uploaded architecture diagram and preserve its existing blue,
> teal, and gray colors exactly. Do not normalize the style.

Decision trace:

1. Route to base `replicate`.
2. Preserve extracted source colors and skip palette selection.
3. Do not set `meta.palette`; `meta.replication.palette` may record extracted
   colors as source evidence.
4. Rebuild the figure with native editable cells and compare the exported SVG
   or Desktop artifact with the source.

Evidence:

- `base-replicate-palette-preservation` encodes the complete assertion
  checklist in the base eval set.
- `tests/palette-skill-policy.test.js` asserts that replicate preserves the
  source palette and explicitly skips the question.
- Result: PASS. No palette question is triggered.

## Probe Decision

The two SKILL frontmatter descriptions were not changed. The conditional
26-probe description suite therefore does not apply; the root metadata tests
still verify installer limits.
