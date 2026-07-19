# Design - Upstream integration and promotion

## 1. Ownership boundary

This child is a promotion layer over archived implementations. It may edit entry-point wording, interface metadata, manual eval registries, documentation, compatibility/evidence reports, and focused integration tests. It does not own any parser, schema, renderer, catalog, asset, layout, or postprocess implementation.

The packaged base reference `skills/drawio/references/docs/upstream-capability-compatibility.md` becomes the one authoritative 37-item map. Parent research keeps source-baseline history but links to this final map.

## 2. Capability routing

The base `SKILL.md` gains compact routes for:

- `multi-page` and structured page links;
- `raster-replicate` through `raster-extraction` into canonical spec;
- `postprocess` for the six shipped operations;
- exact AI/SysML/BPMN catalog discovery through the existing stencil route.

Existing code/config/live routes remain the canonical pointers. The academic `SKILL.md` adds one sibling-base route for these capabilities and applies publication policy afterward. Neither description changes.

## 3. Evidence model

`skills/drawio/evals/upstream-integration-cases.json` is a deterministic registry, not a model-run claim. Each case includes an id, capability, input files, focused command, evidence kind, execution kind, status, and any external evidence gap. A root integration test validates paths and classifications and binds the registry to the compatibility matrix and routing surfaces.

The global scorecard aggregates archived evidence without rewriting classifications:

- recorded fixture proves committed inputs exist;
- command-executed proves the named local deterministic path ran;
- Desktop/provider/model execution requires explicit metadata from that executor;
- unavailable external paths remain `missing evidence`.

## 4. Documentation and interfaces

The compatibility matrix is detailed base reference material. Public English and Chinese CLI pages receive a concise matched section for discovery, commands, and boundaries rather than duplicating all 37 rows. Interface YAML files list promoted capability families and retain actual prerequisites.

## 5. Package gate

`just zip` consumes `git ls-files`, including staged new files. The package check therefore occurs only after an explicit staged allowlist. Both zip manifests must contain their own SKILL and interface/eval/report/reference surfaces as applicable and reject `.drawio-tmp`, previews, logs, caches, and unrelated archive content. Generated zip files are removed with `just clean-zip`; `archive/.gitignore` is preserved byte-for-byte and never staged.

Package hashes are recorded in this task's implementation evidence after the final staged bytes are packaged. They are not embedded into a packaged file, avoiding a self-referential hash.

## 6. Compatibility and rollback

- Legacy flat YAML, bundle v1, current CLI options, export defaults, frontmatter descriptions, and version `2.7.0` stay unchanged.
- The production commit can be reverted as one promotion unit without reverting archived feature implementations.
- Task evidence and lifecycle commits remain separate from the production promotion commit.
- If an assertion exposes a behavior mismatch, update promotion text/evidence to the shipped behavior; do not expand runtime scope in this child.

## 7. File allowlist

Production/promotion files:

- `skills/drawio/SKILL.md`
- `skills/drawio-academic-skills/SKILL.md`
- both skills' `agents/interface.yaml` and `agents/openai.yaml`
- both skills' `evals/evals.json`
- `skills/drawio/evals/upstream-integration-cases.json`
- `skills/drawio/references/docs/upstream-capability-compatibility.md`
- `skills/drawio/reports/output_quality_scorecard.md`
- `skills/drawio/reports/upstream-port-release-evidence.md`
- `docs/guide/cli.md`, `docs/zh/guide/cli.md`
- `tests/upstream-integration-contract.test.js`

Task evidence files:

- this child task directory;
- parent `task.json`, parent research audit, and later parent acceptance artifacts only as required by Trellis lifecycle.

No other production path is authorized without returning to planning and documenting why it is necessary.
