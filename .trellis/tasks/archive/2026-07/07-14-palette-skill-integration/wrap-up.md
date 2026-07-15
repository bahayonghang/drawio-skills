# Palette Skill Integration Freeze

## Delivered surfaces

- Base SKILL policy asks once only for explicit palette/colorblind/grayscale/
  print/multi-category intent, and preserves source colors on replication.
- Academic preflight asks once after venue selection, puts the recommendation
  first with `(Recommended)`, maps explicit choices directly, and reports
  palette safety flags.
- The venue recommendation table lives in
  `academic-figure-playbook.md`; `publication-overlay.md` owns print/CVD gate
  behavior without duplicating the table.
- Base color, theme, and specification references document `meta.palette`,
  custom palette loading, and `$paletteN` token variants.
- Both interface files, academic `openai.yaml`, and five new eval cases expose
  palette selection, replicate preservation, and print-safety behavior.
- Package, lockfile, both SKILL files, both eval sets, and README release
  surfaces are synchronized at 2.7.0. Both CHANGELOGs describe the feature
  under the released `## 2.7.0 (2026-07-14)` section.

## Acceptance evidence

| Criterion                                 | Evidence                                           | Result |
| ----------------------------------------- | -------------------------------------------------- | ------ |
| Base and academic interaction contracts   | `tests/palette-skill-policy.test.js`               | PASS   |
| Venue map matches parent R5               | `academic-figure-playbook.md` policy test          | PASS   |
| Interfaces, eval IDs, versions, CHANGELOG | release-surface policy test + `just version-check` | PASS   |
| Academic create and replicate rehearsal   | `rehearsal.md`                                     | PASS   |
| Root tests and CI                         | `npm test`: 445 passed; `just ci`: exit 0          | PASS   |

The SKILL frontmatter descriptions were unchanged, so the conditional 26
description probes were not required.
