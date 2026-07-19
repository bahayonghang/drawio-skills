# Implement - Canonical 多页基础

## Preconditions and Start Gate

- [ ] 用户已审阅并明确批准本 child 的 `prd.md`、`design.md`、`implement.md`。
- [ ] 只执行 `python ./.trellis/scripts/task.py start 07-19-drawio-multi-page-foundation`；parent、C2 bucket、C3 bucket 与其他 child 保持 planning。
- [ ] inline Phase 2 先运行 `trellis-before-dev`，读取本 task、`.trellis/spec/drawio-skill/` 与 `.trellis/spec/frontend/` 的相关 checklist。
- [ ] 用 `tdd` 执行 red -> green -> refactor；每个行为先有失败测试，且先跑 focused gate。
- [ ] 不继承任何网络、Desktop、browser、MCP、视觉模型或 binary evidence 批准；不新增 runtime dependency。
- [ ] staging allowlist 明确排除 `archive/`、`preview.png`、`.drawio-tmp/`、临时导出和外部 fixture。

## TDD Seams

1. **Document classifier/normalizer**：legacy discriminator、bundle v1、semantic no-loss、unknown/mixed version rejection。
2. **Page/object identity validator**：page order/id/name、跨 kind object uniqueness、explicit edge id、cross-page duplicate object id allowance。
3. **Link resolver/security**：structured endpoints、missing/duplicate source/target、fixed link encoding、injection rejection。
4. **Per-page renderer/validator**：isolated layout/XML, wrapper metadata, repeated root `0/1`, page-local error paths。
5. **All-pages importer**：uncompressed/compressed/mixed pages、missing page id fallback、metadata recovery、collision rejection。
6. **Serialization/artifacts**：legacy YAML/arch v1 golden、bundle YAML ordering、arch v2 totals/pages/links、sidecar-dir placement。
7. **CLI matrix**：default first-page compatibility、`--all-pages`/`--page` conflicts、page selection, ambiguous binary/stdout failures。

## Step 1 - Freeze Legacy Baseline with Red/Characterization Tests

- add exact legacy fixtures covering minimal YAML, modules/edges, Redis/Lucide/AI icons, ordinary stencils, adapter identity and academic profile.
- snapshot current `parseSpecYaml -> serializeSpecYaml`, `specToDrawioXml -> createDrawioFileContent`, arch v1 and CLI output/sidecar behavior before production changes.
- add the first failing bundle-classification tests without changing legacy expectations.

Completion: legacy golden tests pass on the pre-change path; bundle tests fail because the new document contract does not exist.

## Step 2 - Bundle Schema, Normalization and Identity

- add the bundle v1 schema/contract and a focused document module; reuse current page spec definitions/validation rather than duplicating semantic rules.
- implement discriminator, legacy internal view, page selector, page/object registry and ordered diagnostics.
- require multi-page edge IDs and same-page cross-kind uniqueness; allow the same object id on different pages.
- implement structured link validation and fixed safe page-link encoding.
- add injection tests before implementing each rejection path.

Completion: schema/normalization/identity/link focused tests pass; no renderer or CLI branch exists yet; legacy golden remains green.

## Step 3 - Per-Page Renderer, XML Metadata and Validation

- add multi-page-only canonical object wrappers/metadata while leaving legacy bare `mxCell` bytes unchanged.
- render/layout each page independently and create ordered `<diagram id name>` entries in one `<mxfile>`.
- validate decoded `<mxGraphModel>` per page and aggregate page-scoped diagnostics; do not run cell uniqueness across the whole `<mxfile>`.
- test node/module link carriers, explicit edge identity, escaped page names and same cell IDs on different pages.

Completion: canonical bundle renders to valid multi-page `.drawio`; each page passes XML validation and link metadata resolves.

## Step 4 - All-Pages Import and Semantic Round-Trip

- extend draw.io extraction to retain diagram id/name/order and expose an all-pages import path.
- restore canonical wrapper metadata; keep current cell-id fallback only for third-party pages without metadata.
- cover uncompressed, compressed and mixed fixtures plus missing/unsafe/duplicate page IDs and normalized object collisions.
- assert normalize(bundle) -> render -> import -> normalize deep equality for all supported fields and links.

Completion: multi-page round-trip matrix passes without claiming arbitrary third-party XML byte preservation.

## Step 5 - YAML, Arch v2, Sidecars and CLI

- keep legacy serializers/artifact helpers unchanged; add document-aware branch and arch v2 builder.
- implement `--all-pages`, mutual exclusion with `--page`, and page selection by index/id/unique name.
- enforce all-page `.drawio` output and explicit single-page selection for SVG/PNG/PDF/JPG; reject ambiguous multi-page stdout.
- extend CLI help and a base contract reference only. Do not edit either `SKILL.md`, interfaces or global scorecard.
- add task-local handoff/evidence notes only if implementation produces decisions not already executable from tests/spec.

Completion: CLI/artifact matrix and sidecar placement pass for legacy and bundle paths.

## Step 6 - Focused and Broad Validation

Run smallest to broadest; exact new filenames may follow existing colocated conventions but the gates remain:

```powershell
node --test skills/drawio/scripts/dsl/document-spec.test.js
node --test skills/drawio/scripts/dsl/spec-to-drawio.test.js skills/drawio/scripts/dsl/drawio-to-spec.test.js
node --test tests/arch-json.test.js tests/integration.test.js tests/security.test.js
npm test
just ci
git diff --check
```

Additional matrices:

- every maintained legacy YAML example used by current integration coverage renders/validates through the unchanged single-page path.
- multi-page uncompressed/compressed/mixed fixtures round-trip twice and remain semantically equal and deterministically serialized.
- injection scan covers source and emitted YAML/XML/arch for `javascript:`, HTML data URI, event attributes, closing tags, controls and raw unescaped page/object payloads.
- dependency/runtime scan proves no new package dependency, network fetch, Desktop, browser, MCP, visual-model or external-binary call.
- `git status --short --untracked-files=all` proves `archive/`, any externally recreated `preview.png`, temp exports and external fixtures are unstaged/uncommitted.

## Step 7 - Spec Update, Review and Finish

- run `trellis-check` against requirements, focused/broad gates, cross-layer flow and final diff.
- run `trellis-update-spec` to add the executable multi-page contract to `.trellis/spec/drawio-skill/` and its index only after implementation behavior is proven.
- use `git-commit` with Chinese Conventional Commits, emoji, `[AI]`, `Why` body and agent trailers; inspect the staged allowlist before each commit.
- run `trellis-finish-work`; archive only `07-19-drawio-multi-page-foundation` and journal only work commit hashes.
- do not push remote and do not create integration/promotion or other children.

## Atomic Commit and Rollback Boundaries

### Commit 1 - Schema / Normalization / Identity

Owns bundle v1 schema, document classifier/normalizer, identity/link validator, security tests and legacy characterization tests.

Rollback: revert this commit to remove the public bundle contract; legacy path remains identical.

### Commit 2 - Renderer / Import / Round-Trip

Owns multi-page wrappers, per-page XML validation, all-pages importer, compressed fixtures and semantic round-trip tests.

Rollback: revert after Commit 3; no legacy renderer/import behavior should change because all branches are discriminator/flag gated.

### Commit 3 - CLI / Artifact / Evidence / Handoff

Owns `--all-pages`, page-selection boundaries, arch v2, sidecar integration, base contract reference, validation evidence and task-local handoff.

Rollback: revert CLI/artifact exposure while retaining internal contract for diagnosis, or revert all three in reverse order for full removal.

Task archive/journal metadata are lifecycle commits after work commits and are not mixed into the three product rollback units.

## Severity-Ordered Planning Review Gate

### Blocker

- any legacy default output drift, implicit conversion to `pages`, whole-mxfile cell-ID validation, missing target acceptance, unsafe raw link handling or loss of canonical object identity blocks start/finish.

### High

- page order changes, non-local error messages, compressed-page loss, sidecar version ambiguity, ambiguous binary export or cross-page layout state leakage blocks completion.

### Medium

- duplicate display names are acceptable only when ID selection stays unambiguous; third-party XML attribute loss is acceptable only when clearly outside the round-trip claim.

### Low

- C4-friendly examples or compress-friendly naming may inform fixtures but must not add consumer semantics to the foundation.

## Final State Checklist

- [ ] child archived/completed; C2 bucket, C3 bucket and parent still planning.
- [ ] no other child started and no integration/promotion child created.
- [ ] working tree contains only preserved `archive/`.
- [ ] `preview.png` is absent, or externally recreated and uncommitted.
- [ ] no remote push occurred.
