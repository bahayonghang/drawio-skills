# Academic Publication Overlay

This file contains overlay-only policy for `drawio-academic-skills`. Shared schemas, CLI commands, design-system references, official XML/style mirrors, examples, themes, and workflow guides live in the sibling base skill at `../drawio`.

## Overlay Responsibility

Use this overlay when the request is publication-facing:

- paper, thesis, journal, IEEE, manuscript, camera-ready, or publication-ready figure
- A4 or Word/LaTeX export expectations
- academic formula figure or paper diagram replication
- research workflow, system architecture paper figure, or scholarly roadmap

## Required Academic Decisions

Before rendering, decide:

1. Venue or audience.
2. `meta.figureType`: `architecture`, `roadmap`, or `workflow`.
3. Color policy: monochrome, grayscale-safe accent, or color PDF.
4. Caption and legend requirements.
5. Formula/text placement fidelity.
6. Requested exports and whether draw.io Desktop is required.

## Bundle Contract

Default academic delivery is:

- `.drawio`
- `.spec.yaml`
- `.arch.json`
- `.svg`

PNG/PDF/JPG are optional Desktop-enhanced exports. If Desktop is unavailable, report the missing export and provide the editable bundle plus SVG.

## Visual Verification

Use exported artifacts for paper-readability checks before any browser path:

1. Inspect the generated SVG when the current environment can view it.
2. If a raster or final-fidelity check is needed and draw.io Desktop is available, inspect the Desktop-exported PNG/PDF/JPG or embedded `.drawio.svg`.
3. Do not substitute browser or Playwright screenshots when an exported artifact exists.
4. Use live/browser screenshots only as a last-resort review aid when the user explicitly requested live review and no exported artifact can be inspected.

## Base References

Load the sibling base references for detailed rules:

- `../drawio/references/docs/academic-figure-playbook.md`
- `../drawio/references/docs/academic-export-checklist.md`
- `../drawio/references/docs/math-typesetting.md`
- `../drawio/references/docs/design-system/specification.md`
- `../drawio/references/workflows/create.md`
- `../drawio/references/workflows/edit.md`
- `../drawio/references/workflows/replicate.md`
