# Upstream integration and promotion

## Goal

Promote the already shipped upstream-equivalence work as one coherent, honest offline capability surface. This child owns only routing, interfaces, compatibility/eval/docs synchronization, the global scorecard, and package/release evidence. It must not add feature runtime or reopen archived feature children.

## Confirmed Facts

- `07-18-drawio-vision-rework`, the four C1 children and dir1 bucket, the four C2 children and dir2 bucket, and `07-18-drawio-dir3-postprocess` are archived with completed task artifacts and validation evidence.
- The shipped C3 surface is exactly `mermaid`, `explain`, `relabel`, `restyle`, `heatmap`, and self-contained `html`.
- `runbook`, `svgflow`, `tubemap`, `seqlayout`, `compress`, `buildup`, `pptx`, `timelapse`, and `prdiff` remain authoritative `defer`; this child may document but must not implement or create children for them.
- The base already owns the canonical spec/page bundle, stable identity, adapters, vendored shape and AI icon catalogs, JavaScript ELK, renderer, postprocess runtime, and evidence files. The academic package has no JS/TS/Python runtime.
- The two skill descriptions are currently adequate and test-pinned. They will remain unchanged, so the 26-probe trigger regression is not required.
- `just zip` packages only tracked or staged files returned by `git ls-files`; generated archives are local evidence artifacts and must not be committed.

## Requirements

### R1 Authoritative capability mapping

- Publish exactly one 37-row upstream script matrix under the base skill references.
- Every row has one `bridge`, `adapt`, `replace`, or `defer` mapping, one owner/entry point, a concise reason, and an honest evidence state.
- Preserve unavailable Graphviz, provider, Desktop, browser/MCP, model, and PR integration paths as `missing evidence`; deterministic fixtures cannot promote those states.
- The parent research audit must point to the packaged matrix as the final authority rather than retain a competing partial authority claim.

### R2 Routing and interface synchronization

- Add only concise route/context pointers needed to discover shipped code/config/live, raster, multi-page, SysML/BPMN/AI icon, and six-operation postprocess behavior.
- Keep `skills/drawio/SKILL.md` and `skills/drawio-academic-skills/SKILL.md` compact; the academic overlay points to sibling base contracts and adds no copied runtime or detailed matrix.
- Synchronize both `agents/interface.yaml` and `agents/openai.yaml` files with actual shipped behavior and prerequisites.
- Do not change either frontmatter `description`, package version, skill version, runtime dependency set, or default export semantics.

### R3 Evals, docs, and scorecard

- Add a checked-in cross-capability eval manifest with at least five file-backed cases and explicit evidence kinds.
- Add focused contract tests that enforce 37 unique rows, allowed dispositions, file-backed eval paths, route/interface promotion, and the deferred C3 boundary.
- Add base and academic manual eval prompts only where they test newly promoted cross-capability routing.
- Update English and Chinese CLI/workflow documentation with matched descriptions of the promoted offline surface and its deferred/external boundaries.
- Generalize `reports/output_quality_scorecard.md` into the release-level scorecard while preserving C0 and C1 evidence history and keeping external evidence gaps visible.

### R4 Package and release evidence

- Add a packaged release-evidence report describing ownership, runtime/dependency boundaries, tracked-content checks, and residual `missing evidence` without claiming remote publication.
- Stage through an explicit allowlist before the package check, run `just zip`, inspect both zip manifests for required files and forbidden artifacts, record local hashes in task evidence, and remove only the generated zip files afterward.
- Do not commit `archive/.gitignore`, generated zips, preview files, `.drawio-tmp/`, docs build output, or unrelated user files.

## Acceptance Criteria

- [x] The packaged compatibility matrix contains exactly 37 unique upstream Python scripts and each has one authoritative disposition, owner/entry point, reason, and real evidence status.
- [x] All adapters and postprocess routes converge on canonical spec/page bundle and stable identity; no duplicate renderer, layout engine, shape index, identity implementation, visual-review contract, or academic runtime is introduced.
- [x] Both SKILL routing surfaces and all four interface files match shipped behavior; descriptions and versions remain unchanged.
- [x] Cross-capability evals include at least five valid file-backed cases; scorecard classifications distinguish recorded, command-executed, Desktop/provider/model, and `missing evidence`.
- [x] English/Chinese docs mirror the promoted offline capabilities and explicitly preserve deferred/external boundaries.
- [x] Focused tests, `npm test`, `just ci`, explicit docs build, and `git diff --check` pass.
- [x] Both staged skill packages contain the new reference/eval/report surfaces, contain no forbidden temporary artifacts, and package hashes are recorded only as local task evidence.
- [x] The integration work is committed with a staged allowlist without touching protected or unrelated files. Archive and journal are the next lifecycle actions.

## Out of Scope

- Any new feature runtime, schema, renderer, layout engine, catalog, asset generator, dependency, external command integration, or version bump.
- Trigger/description optimization, because descriptions remain unchanged.
- Implementing or creating children for the nine deferred C3 operations.
- Network, Desktop, browser, MCP, model, provider CLI, Graphviz, PR automation, remote release, push, or external publication.

## Missing Evidence

- Real provider state/daemon/cluster capture, large-corpus parser coverage, Graphviz parity, raster OCR/model fidelity, Desktop multi-page/postprocess export, visual-model execution metadata, browser/MCP behavior, PR automation, and remote package installation remain `missing evidence` unless an already archived child contains explicit executed evidence.
