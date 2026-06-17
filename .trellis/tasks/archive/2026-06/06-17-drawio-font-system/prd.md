# drawio skills font system

## Goal

Add a font-setting system for the `drawio` skill family so users can explicitly force diagram typography, and so academic/thesis diagrams have deterministic fallback defaults when no explicit font setting is provided.

## Confirmed Facts

- The current renderer already supports node-level `style.fontFamily`.
- The current theme system already provides `typography.fontFamily`.
- The current style-preset system already provides `font.fontFamily`.
- Font resolution in `skills/drawio/scripts/dsl/spec-to-drawio.js` currently prefers node-level font family, then theme typography entries.
- Edge labels are not yet using the same font-family resolution path; they currently emit `fontSize` and `fontColor` but not `fontFamily`.
- The user wants explicit font selection to be the highest-priority path: when the user force-specifies a font setting, it should override defaults rather than act as a soft suggestion.
- The canonical entry point should live under diagram-level `meta`, not in theme or style preset data.
- `meta.font` should be a structured object rather than a single string.
- `meta.font` should include formula typography control, not only body/CJK text.
- When `meta.font` is present as a forced-font setting, it should override even node-level explicit `style.fontFamily`.
- Mixed-script text should be resolved automatically by content rather than forcing one whole-diagram family onto every label.
- `meta.font` presence itself should imply force mode; the contract should not add a separate enable or mode switch in v1.
- When `meta.font` is absent, the `Simsun` fallback should apply only to academic-paper/thesis-style diagrams, not to all diagrams that happen to contain Chinese text.

## Requirements

- Support a diagram-level explicit font-setting path that can force typography across the rendered diagram.
- Use `meta.font` as the canonical configuration surface.
- Model `meta.font` as an object with at least `primary`, `cjk`, and `formula`.
- Keep a deterministic fallback when no explicit font setting is supplied.
- Default fallback for non-academic English diagrams should be `Times New Roman`.
- Default fallback for Chinese academic thesis diagrams should be `Times New Roman, Simsun`.
- Mixed-script allocation should be automatic by visible content: CJK-bearing text should route to the CJK family, formula-bearing text should route to the formula family, and other text should route to the primary family.
- The design must fit the existing `drawio` base skill plus `drawio-academic-skills` overlay split cleanly.
- The design should define precedence clearly across forced `meta.font`, node overrides, theme defaults, and style presets.
- The design should cover all four v1 text surfaces that matter for user-visible consistency: node text, formula nodes, module titles, and edge labels.
- The design should keep the v1 scope on font-family selection only; existing font size, color, and weight rules stay where they are unless they already depend on the chosen family path.

## Acceptance Criteria

- [ ] Planning defines the canonical configuration surface for forced font settings.
- [ ] Planning defines the minimum `meta.font` object shape and semantics.
- [ ] Planning defines precedence rules for explicit font settings versus existing theme/style/node mechanisms.
- [ ] Planning defines base-skill defaults versus academic-overlay defaults.
- [ ] Planning identifies the renderer gaps that must be closed for full-font consistency.
- [ ] Planning includes a concrete implementation shape that can be added without breaking the existing YAML-first workflow.

## Open Questions

- None at current planning depth.
