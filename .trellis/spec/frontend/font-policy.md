# Font Policy

Draw.io diagrams in this repo use a diagram-level font contract under `meta.font`.

## Scope / Trigger

- Trigger: changes to `skills/drawio/scripts/dsl/spec-to-drawio.js`,
  `skills/drawio/assets/schemas/spec.schema.json`, or tests/docs that affect
  font-family resolution.
- This is a code-spec because the contract changes renderer precedence and
  validation behavior.

## Signatures

- `meta.font.primary`: string
- `meta.font.cjk`: string
- `meta.font.formula`: string

## Contracts

- `meta.font` is the canonical configuration surface for forced font settings.
- Presence of `meta.font` enables force mode automatically.
- In force mode, `meta.font` overrides lower-priority `style.fontFamily`
  values on node text, formula nodes, module titles, and edge labels.
- Mixed-script routing is per text surface, not per substring.

## Validation & Error Matrix

- Missing `primary`, `cjk`, or `formula` -> schema/validation failure.
- Non-string or unsafe font values -> validation failure.
- `meta.font` absent -> fallback policy applies.

## Good/Base/Bad Cases

- Good: `meta.font.primary = Times New Roman`, `meta.font.cjk = Simsun`,
  `meta.font.formula = Times New Roman`.
- Base: generic diagrams without `meta.font` use Times New Roman.
- Bad: forcing only one family string for every surface.

## Tests Required

- Validate complete `meta.font` objects.
- Verify force mode overrides node-level `style.fontFamily`.
- Verify formula and CJK routing use the right bucket.
- Verify edge labels emit `fontFamily`.

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
    cjk: Simsun
    formula: Times New Roman
```
