# Implementation Plan

## Checklist

1. Update edge-label generation.
   - In `skills/drawio/scripts/dsl/spec-to-drawio.js`, avoid writing the same label on both the parent edge cell and the `edgeLabel` child.
   - Prefer parent `value=""` whenever an `edgeLabel` child cell is generated.
   - Verify with a focused test around `labelOffset`.

2. Harden SVG rendering expectations.
   - Keep the current behavior that suppresses parent edge label rendering when an `edgeLabel` child exists.
   - Add or update a test proving the SVG output contains the label once for a representative connector with child label.
   - Check whether any thesis-local fixes for grouped coordinates or multiline Chinese should be ported into `skills/drawio/scripts/svg/drawio-to-svg.js`.

3. Add or design temp sidecar output support.
   - Add a CLI option such as `--sidecar-dir <dir>` or `--work-dir <dir>`.
   - Ensure `.spec.yaml` and `.arch.json` can be written to that directory while final `.drawio` and `.svg` remain in the requested final directory.
   - Keep `--write-sidecars` compatible for explicit beside-output sidecars.

4. Update skill behavior instructions.
   - In `skills/drawio/SKILL.md`, define `.drawio` and `.svg` as default final deliverables.
   - In `skills/drawio-academic-skills/SKILL.md`, replace "default delivery bundle" language with final-deliverables plus intermediate-workdir language.
   - Explicitly instruct agents not to create scratch JS scripts under user project `.agents/skills/drawio` during normal diagram generation.

5. Update docs and eval expectations.
   - Update docs that currently say academic defaults are `.drawio + .spec.yaml + .arch.json + .svg`.
   - Keep sidecar guidance for explicit reproducible bundle/editing workflows.
   - Update eval assertions that treat sidecars as default final deliverables.

6. Update policy tests.
   - Adjust tests that assert academic sidecar delivery by default.
   - Add tests that assert clean final delivery language and intermediate sidecar support.

7. Verify.
   - Run focused tests:
     - `node --test skills/drawio/scripts/dsl/spec-to-drawio.test.js`
     - `node --test skills/drawio/scripts/svg/drawio-to-svg.test.js`
     - relevant repo-level policy tests
   - Run `npm test` if focused tests pass.

## Risky Files

- `skills/drawio/scripts/dsl/spec-to-drawio.js`: changing XML generation can affect many diagrams.
- `skills/drawio/scripts/cli.js`: flag behavior must remain backward compatible.
- `skills/drawio-academic-skills/SKILL.md`: description length is guarded by tests, so keep frontmatter concise.
- docs/evals: many references name the old default bundle; update only those tied to final delivery semantics.

## Rollback Points

- If edge-label XML changes break import/export, revert only the parent-edge value change and reconsider renderer-side suppression.
- If CLI temp-sidecar support becomes too broad, leave CLI behavior unchanged and first land skill/docs instructions that use an explicit temp output directory workflow.
- If full `npm test` reveals unrelated failures, record focused passing tests and separate unrelated failures clearly.

## Planning Review Gate

Implementation should not start until the user approves this plan or explicitly says to continue with implementation.
