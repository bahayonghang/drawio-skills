# Implement - SysML/BPMN canonical stencil delta

## Preconditions

- [x] Confirm only this child is executable and parent/dir2 remain planning buckets.
- [x] Confirm worktree excludes `archive/.gitignore`, previews, `.drawio-tmp/`, and temporary artifacts.
- [x] Read child artifacts, drawio-skill spec index, semantic type guide, shared reuse/cross-layer guides, and archived stencil-catalog design.

## Execution

1. [x] Add failing build-catalog tests proving SysML/BPMN extraction, deduplication, metadata and deterministic sorting.
2. [x] Add failing catalog/search/validation-render tests for correct namespace results, explicit prefix filtering, unknown covered names, and canonical icon XML.
3. [x] Add only `mxgraph.sysml.` and `mxgraph.bpmn.` to `COVERED_PREFIXES`; do not add a second catalog or renderer.
4. [x] Rebuild `shape-catalog.json.gz` with the existing Node generator; verify source-row and unique-stencil counts plus deterministic second build.
5. [x] Keep `catalog-ranking.js` unchanged; merged source tags close the discoverability gap in the existing generic ranker.
6. [x] Add `.trellis/spec/drawio-skill/sysml-bpmn.md` and index entry with shipped/deferred/evidence contracts.

## Focused Validation

```powershell
node --test skills/drawio/scripts/tools/build-shape-catalog.test.js
node --test skills/drawio/scripts/dsl/shape-catalog.test.js skills/drawio/scripts/dsl/catalog-search.test.js skills/drawio/scripts/dsl/spec-to-drawio.test.js
node skills/drawio/scripts/tools/build-shape-catalog.js
npm test
just ci
git diff --check
```

Also run an inline Node count probe against both gzip files and verify a second generated gzip is byte-identical without committing a temporary artifact.

## Review Gates

- [x] Diff contains only catalog coverage, tests, regenerated catalog, task/spec evidence.
- [x] No `SKILL.md`, interface, global eval/docs/matrix/scorecard/release files changed.
- [x] No Python/Graphviz/network/Desktop/browser/MCP/model path or dependency added.
- [x] Staged allowlist excludes `archive/.gitignore`, preview files, `.drawio-tmp/`, and unrelated user changes.
- [x] Missing evidence and deferred nested constructs remain explicit.

## Commit and Finish

1. [x] Commit production/tests/spec as `669c415` (`feat(catalog): [AI] ✨ 扩展 SysML/BPMN 离线 stencil`).
2. [x] Record final command evidence in these artifacts and commit task evidence separately.
3. [ ] Archive the child with `task.py archive` and record session journal with `add_session.py`.

## Rollback

- Before commit: revert only this child's allowlisted modified files or regenerate catalog from the unchanged source after removing the two prefixes.
- After commit: revert the feature commit; do not touch source index, AI icon catalog, archived siblings, or protected artifacts.

## Results

- Red phase: 3 expected failures (generator coverage, generated catalog coverage, catalog search); 212 related tests remained green.
- Focused green phase: 215/215 passed.
- Source/catalog counts: SysML 27 rows -> 19 unique entries; BPMN 196 rows -> 6 unique entries.
- Deterministic gzip: two consecutive builds produced SHA-256 `16A5E25102ABDF219E813FB69DE3E15E347447942F05B3DE6314AED525570447`; final size 59,944 bytes.
- CLI probes: `sysml requirement --prefix sysml` top result `mxgraph.sysml.package`; `bpmn task --prefix bpmn` top result `mxgraph.bpmn.task2`.
- `npm test`: 630 total, 628 passed, 2 optional skips, 0 failed.
- `just ci`: version sync, Markdown lint, the same test set, and VitePress docs build passed.
- `git diff --check`: passed; only Windows line-ending notices were printed.
- Desktop/model/human semantic fidelity and nested ports/pools/lanes/specialized flows remain `missing evidence` / `defer`.
