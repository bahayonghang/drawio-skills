# Font Policy

Draw.io diagrams in this repo use a diagram-level font contract under `meta.font`,
a per-class font-size ladder, and a box-fit system in `spec-to-drawio.js`.

## Scope / Trigger

- Trigger: changes to `skills/drawio/scripts/dsl/spec-to-drawio.js`,
  `skills/drawio/scripts/dsl/auto-layout.js`,
  `skills/drawio/assets/schemas/spec.schema.json`,
  `skills/drawio/assets/themes/academic*.json`, or tests/docs that affect
  font-family resolution, font-size planning, or label-fit validation.
- This is a code-spec because the contract changes renderer precedence and
  validation behavior.

## Signatures

- `meta.font.primary`: string
- `meta.font.cjk`: string
- `meta.font.formula`: string
- `meta.print`: `{ target?: 'cn-thesis' | 'ieee-single' | 'ieee-double', widthPt?: number, minPt?: number }`
- `FONT_LADDER`: `{ moduleTitle: 22, node: 20, edgeLabel: 18, text: 16 }` (exported)
- `FONT_SIZE_FLOOR`: `12` (exported)
- `getNodeSize(size, nodeType, label, options?)` with
  `options = { fontSize?, contentAware? }`
- `validateLabelFit(spec)` (exported validator)

## Contracts

### Font family

- `meta.font` is the canonical configuration surface for forced font settings;
  its presence enables force mode and overrides lower-priority
  `style.fontFamily` values on node text, formula nodes, module titles, and
  edge labels.
- Values may be comma-separated fallback stacks (`safeStyleText` allows
  commas). The default policy for every profile is
  `primary: Times New Roman`, `cjk: Times New Roman,SimSun`,
  `formula: Times New Roman` — Latin glyphs resolve from Times New Roman and
  CJK glyphs fall through to SimSun inside one label (thesis convention).
- Mixed-script routing is per text surface, not per substring; the fallback
  stack is what makes per-glyph resolution work.
- Academic themes (`academic`, `academic-color`) carry the same stack in
  `typography.fontFamily.cjk`, which wins over the built-in policy.

### Font size

- Fill order per surface: explicit `style.fontSize` > theme value
  (`node.<type>.fontSize` / `node.default.fontSize` / `module.labelFontSize`)
  > `FONT_LADDER`.
- `planFontSizes(spec, theme)` materializes sizes into an internal
  `structuredClone` before layout; the author spec object is never mutated.
- `getNodeSize` treats presets as minimums in content-aware mode: boxes grow
  (snapped up to the 8px grid) so plain-text labels fit. Exempt: text nodes
  (content-fitted separately), icon-labeled nodes, `operator` / `tensor3d` /
  `formula` types, and math-bearing labels (`$$…$$`, `\(...\)`) whose LaTeX
  source length says nothing about rendered width.
- `shrinkFontsToBounds` lowers auto-assigned sizes per class (node / text)
  to the largest size every explicit-bounds box in the class can hold,
  clamped to `[FONT_SIZE_FLOOR, assigned]`. Author-set sizes are untouched;
  math-bearing labels take the class size but never constrain it.
- `validateLabelFit` warns when a plain-text label still exceeds its explicit
  bounds (width + 8px, height + 4px allowances at 0.6em Latin / 1.05em CJK /
  1.4 line-height estimates).

### Print gate

- `meta.print` replaces the removed "8-10pt" px-as-pt rule. Targets:
  `cn-thesis` 440pt width / 9pt floor, `ieee-single` 252pt / 8pt,
  `ieee-double` 516pt / 8pt; `widthPt` / `minPt` override the preset.
- With `meta.print` present the effective-pt warning always runs; without it,
  only academic canvases wider than 1500px are checked against the
  IEEE single-column floor.

## Validation & Error Matrix

- Missing `primary`, `cjk`, or `formula` in `meta.font` -> validation failure.
- Non-string or unsafe font values (`;<>"` or newlines) -> validation failure.
- `meta.font` absent -> fallback policy applies (theme cjk stack, then the
  built-in `Times New Roman,SimSun` policy).
- `meta.print` not an object, unknown `target`, non-positive `widthPt`/`minPt`,
  or neither `target` nor `widthPt` -> validation failure.
- Label larger than its explicit bounds after the floor -> `validateLabelFit`
  warning (blocks under `--strict-warnings`).

## Good/Base/Bad Cases

- Good: `meta.font.primary = Times New Roman`,
  `meta.font.cjk = Times New Roman,SimSun`,
  `meta.font.formula = Times New Roman`.
- Base: diagrams without `meta.font` get the same stacks from the theme or
  built-in policy, plus ladder sizes with box growth.
- Bad: forcing one single-script family (`Simsun` alone puts Latin glyphs in
  SimSun's typewriter Latin; `Times New Roman` alone drops CJK to an
  uncontrolled system fallback).

## Tests Required

- Validate complete `meta.font` objects and `meta.print` shapes.
- Verify force mode overrides node-level `style.fontFamily`.
- Verify CJK routing emits the fallback stack for both profiles.
- Verify edge labels emit `fontFamily` and the 18px ladder default.
- Verify ladder materialization keeps the author spec unmutated.
- Verify content growth, class shrink uniformity, floor clamping, and
  `validateLabelFit` warnings.
- Verify the `cn-thesis` print warning math (440pt / 9pt).

## Wrong vs Correct

Wrong:

```yaml
meta:
  font: Arial
```

Correct:

```yaml
meta:
  font:
    primary: Times New Roman
    cjk: Times New Roman,SimSun
    formula: Times New Roman
```
