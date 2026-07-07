# Changelog — drawio academic skills overlay

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
