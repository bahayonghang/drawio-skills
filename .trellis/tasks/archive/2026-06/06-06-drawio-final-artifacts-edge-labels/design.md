# Design: drawio final artifact and edge-label cleanup

## Boundaries

This task changes the drawio skill package and its tests/docs inside this repository. It does not directly edit the user's thesis checkout unless a later implementation run intentionally uses it as a manual verification fixture.

Primary source paths:

- `skills/drawio/SKILL.md`
- `skills/drawio-academic-skills/SKILL.md`
- `skills/drawio/scripts/cli.js`
- `skills/drawio/scripts/runtime/artifacts.js`
- `skills/drawio/scripts/dsl/spec-to-drawio.js`
- `skills/drawio/scripts/svg/drawio-to-svg.js`
- `skills/drawio/scripts/dsl/spec-to-drawio.test.js`
- `skills/drawio/scripts/svg/drawio-to-svg.test.js`
- repo-level tests that assert skill policy and academic bundle behavior
- docs and eval files that currently name `.spec.yaml` and `.arch.json` as default deliverables

## Artifact Contract

Default user-facing final outputs:

- `<name>.drawio`
- `<name>.svg`

Default intermediate outputs:

- raw or normalized input YAML
- `<name>.spec.yaml`
- `<name>.arch.json`
- diagnostic scripts or temporary render inputs

Intermediate outputs should be written under a current-project temporary directory. The implementation should prefer a deterministic hidden folder such as `.drawio-tmp/<stem>/` or `.drawio-work/<stem>/` so users can inspect it but final directories stay clean.

Sidecars remain valid when explicitly requested. The existing `--write-sidecars` behavior can be preserved as an explicit opt-in for writing sidecars beside the final output, but default skill guidance should not instruct agents to use it for final delivery.

## CLI Shape

Recommended CLI behavior:

- Keep `--write-sidecars` for backward compatibility: write `.spec.yaml` and `.arch.json` beside the final output.
- Add a new option such as `--sidecar-dir <dir>` or `--work-dir <dir>` to write sidecars away from final output.
- Add a documented default skill workflow that generates sidecars in a temp/work dir, then generates or copies only `.drawio` and `.svg` into the requested final directory.

Avoid changing the meaning of existing flags in a breaking way unless tests and docs make the migration explicit.

## Edge Label Contract

A labeled connector should have exactly one rendered label representation:

- If an `edgeLabel` child cell is emitted for offset or positioned labels, the parent edge cell should have an empty `value`.
- If no child label cell is emitted, the parent edge cell may carry the label directly.

Given the current generator always emits an `edgeLabel` child when `rawEdgeLabel` exists, the simplest fix is to make the parent edge `value=""` in that branch.

The SVG renderer should continue skipping parent-edge text when an `edgeLabel` child exists. That behavior is already present and should be guarded with regression tests.

## User-Project `.agents` Policy

The skill should not treat user-project `.agents/skills/drawio` as a normal patch target for diagram generation. If the renderer needs a fix, the fix belongs in this repository's source:

- port any durable logic from the thesis-local `.agents/skills/drawio/scripts/svg/drawio-to-svg.js`;
- add dependencies to this repo's package metadata instead of installing ad-hoc `node_modules` under user project `.agents`;
- keep user project `.agents` out of thesis deliverables.

## Compatibility

Backward compatibility risks:

- Existing tests and docs assume `.drawio + .spec.yaml + .arch.json + .svg` as an academic default bundle.
- Existing users may rely on `--write-sidecars` beside output.

Compatibility stance:

- Preserve explicit sidecar generation.
- Change default skill guidance and any new helper behavior to separate final outputs from intermediate work.
- Update tests to distinguish "final delivery" from "reproducible bundle requested".

## Verification Strategy

- Unit test `spec-to-drawio` for no duplicate edge label storage when `labelOffset` is present.
- Unit test `drawio-to-svg` for one visible label per connector with an edgeLabel child.
- CLI test for sidecars redirected to temp/work dir once the option exists.
- Skill policy test for final deliverables wording in both base and academic overlay.
- Run narrow Node tests first, then `npm test` if time allows.
