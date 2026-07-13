# Changelog — drawio academic skills overlay

## Unreleased

- Sync with base: flow connectors default to open heads (`endArrow=open;endSize=12`,
  unfilled "V") instead of filled block; `publication-overlay.md` § Text and Callout
  Styling updated. UML/ER semantic markers and explicit `block` requests are unchanged.
- Default final deliverable is now a 300dpi PNG (via draw.io Desktop; falls back to SVG when
  Desktop is absent) instead of SVG. Journal / IEEE vector submission still requires an explicit
  PDF (or SVG) export — `SKILL.md` Export Policy and `academic-export-checklist.md` flag this.

## 2.5.0 (2026-07-07)

Sync with base 2.5.0 (straight routing / transparent text / native connectors):

- `publication-overlay.md` § Text and Callout Styling now states the enforced
  transparency contract (converter forces `fillColor=none` on plain text and
  warns), the one-char-per-line vertical CJK label pattern, and a new
  "Native straight connectors" point (bound edges only, collinear orthogonal
  edges, `endSize=12` block heads, `--validate --strict` before export).
- `yolo-model-architecture-paper.yaml`: stale fixed label offsets removed in
  favor of the base content-aware defaults (previous `y: -16` sat on the line).
- `multi-module-system-compact.yaml`: legend bounds enlarged to fit content
  (350x100 → 376x112) per the new text-bounds lint.

## 2.4.0 (2026-07-07)

Consistency round driven by the 2026-07-06 audit: the playbook, templates, and
base validators no longer contradict each other.

- Density rules unified: the playbook's 41/61/100 node tiers are the single
  source of truth (enforced by the base `checkComplexity`); the conflicting
  18/12 academic warning was removed from the base validator.
- Compact templates cleaned of schema drift (`meta.canvasSize`/`gridSize`,
  `node.style.shape`/`rounded`, module `bounds`) and re-coordinated:
  `neural-network-architecture-compact` now uses uniform 32px flow gaps and a
  `type: text` legend; both templates validate with zero warnings and are
  guarded by `tests/academic-templates-strict.test.js` together with all
  academic examples.
- Playbook examples use supported keys only; new "Canvas and Print Sizing"
  section with the px→pt table (IEEE single column 252pt / double 516pt, 8pt
  floor). Export checklist and publication overlay note that IEEE vector
  submissions accept PS/EPS/PDF only (attach a Desktop-exported PDF; the
  default `.drawio` + `.svg` bundle contract is unchanged).
- Evals housekeeping: `evals.json` version now tracks `SKILL.md`, `_runner`
  note documents the manual/agent verification model, and `evals/README.md`
  marks the historical prompt/result snapshots.
