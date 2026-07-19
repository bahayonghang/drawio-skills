# Implement - 方向③后处理导出

## Preconditions And Review Gate

- [x] 用户已审阅并明确批准本 child 的 `prd.md`、`design.md`、`implement.md`。
- [x] 仅本 child 进入 `in_progress`；parent、dir1、dir2 和其他 child 未作为 implementation target。
- [x] inline Phase 2 运行 `trellis-before-dev` 并读取 task、multi-page contract 和 shared guides；未继承外部证据。
- [x] 按 red -> green -> refactor 实施；未新增 runtime dependency，未修改两个 `SKILL.md`、interfaces 或 global scorecard。
- [x] staging allowlist 排除 `archive/`、`preview.png`、`.drawio-tmp/`、临时导出和外部 fixture。

## Ordered TDD Execution Plan

### Step 1 - Freeze legacy and multi-page consumer baselines

1. 建立 file-backed fixtures：legacy flat 图、multi-page bundle v1（重复 page-local IDs、structured links、Redis/Lucide/AI icon、ordinary stencil、adapter metadata、academic profile）。
2. 先写失败的 input selector/normalizer tests，证明 legacy 路径输出无漂移，bundle page order/identity/link 不丢失。
3. 固定 deterministic serialization、operation metadata 和 source/output path safety 的 characterization tests。

Gate: 既有单页测试保持绿色；新 contract tests 在实现前按预期失败。

### Step 2 - Pure canonical projections and mutators

按以下顺序一次只交付一个可验证 seam：

1. `mermaid` and `explain`: preserve author order, bounded semantic downgrade, deterministic escaping and warnings.
2. `relabel`: address-first maps, duplicate/missing key diagnostics, no identity/geometry/link mutation.
3. `restyle`: allowlisted preset tokens, opaque icon/stencil preservation, theme/academic metadata preservation.
4. `heatmap`: strict numeric metrics parsing, stable identity lookup, bounded palettes/size transforms, unmatched-key report.

Focused tests must assert both returned canonical data and serialized `.drawio`/`.spec.yaml` round-trip through existing validators.

Gate: all pure transform tests pass; no HTML/SVG or external subprocess path is required.

### Step 3 - Safe HTML projection

1. Implement self-contained `html` viewer for all pages or an explicit selected page; test tabs, search payload, structured page links and deterministic output.
2. Run static output scans for `javascript:`, HTML event attributes, `<script>`, remote URL, unescaped labels and control characters.

Gate: HTML output is inspectable from disk without browser execution; browser/Desktop/model evidence remains explicitly missing.

### Step 4 - Artifact and additive CLI contracts

1. Reuse current artifact helpers and sidecar placement; add only the smallest operation selector/entry point needed by MVP tests.
2. Cover `--page <index|id|unique-name>`, `--all-pages` conflict, binary page selection, stdout ambiguity and source/output alias rejection.
3. Verify deterministic `*.postprocess.json` provenance (no timestamps/absolute paths/secrets) and atomic writes; do not alter legacy default CLI output.

Gate: focused CLI/artifact tests pass for legacy and bundle inputs; multi-page foundation tests remain unchanged and green.

### Step 5 - Explicitly defer Python shells and non-MVP authoring

Do not implement or create child directories for `runbook`, `svgflow`, `tubemap`, `seqlayout`, `compress`, `buildup`, `pptx`, `timelapse` or `prdiff`. Instead, record their input/output and evidence disposition in task-local research only if implementation discovers a new contract. Any future work must be separately approved and must consume this child’s canonical/HTML boundaries rather than copying XML parsing.

### Step 6 - Focused and broad validation

Run smallest to broadest after implementation approval:

```powershell
node --test skills/drawio/scripts/postprocess/*.test.js
node --test skills/drawio/scripts/dsl/document-spec.test.js skills/drawio/scripts/dsl/multi-page.test.js
node --test tests/arch-json.test.js tests/integration.test.js tests/security.test.js
npm test
just ci
git diff --check
```

Additional gates:

- every MVP transform runs twice from the same fixture and compares bytes/normalized canonical values;
- legacy examples, multi-page compressed/uncompressed/mixed pages, duplicate page names, cross-page links and page selectors are covered;
- labels, metrics, preset JSON, SVG and Markdown injection scans pass;
- no new package, network fetch, Desktop/browser/MCP/model/binary/subprocess path appears in ordinary runtime;
- `git status --short --untracked-files=all` confirms `archive/.gitignore`, any `preview.png`, `.drawio-tmp/` and external fixtures remain untouched/uncommitted.

External evidence remains `missing evidence` unless actually executed: Desktop export, browser interaction, visual model read, Python-PPTX/GIF, Git history replay, PR provider/comment chain.

## Commit Boundaries

1. **Pure projections/mutators**: input normalization, Mermaid/explain/relabel/restyle/heatmap, focused security and legacy/multi-page tests. Rollback leaves all existing render/export paths intact.
2. **HTML output**: self-contained viewer, sanitization and output inspection tests. Rollback leaves canonical transforms available.
3. **CLI/artifact wiring**: additive route, page selector/error matrix, deterministic postprocess sidecar and atomic writes. Rollback removes only the new route.

Use `git-commit` only after explicit user authorization; planning baseline commit is not automatic. Any commit must stage only the allowlisted task files/implementation files and exclude `archive/.gitignore` and `preview.png`.

## Validation And Archive/Handoff Conditions

- `prd.md`, `design.md`, `implement.md` are reviewed together and contain no unresolved implementation placeholders.
- Focused TDD gates, broad repo gates, deterministic repeatability, security scans and final diff review pass; failures or unrun providers are reported factually.
- `trellis-check` confirms requirements, cross-layer flow, reuse of multi-page foundation and compatibility boundaries.
- `trellis-update-spec` is run only if implementation discovers a new project-wide executable contract not already covered by the drawio-skill specs; planning alone does not change `.trellis/spec/`.
- `trellis-finish-work` archives only this child after approved work commits and records the real hashes；parent/other children remain planning.
- Handoff names the next required child only after this child is archived; this child does not create integration/promotion or extra C2/C3 tasks.

## Verification Evidence - 2026-07-19

- postprocess focused baseline：29/29 passed；HTML 可操作搜索/跨页链接回归补充后 3/3 passed。
- postprocess + multi-page + arch + integration + security focused gate：133/133 passed。
- JS syntax、dependency/import、debug/TODO、network/subprocess boundary scan：passed；`child_process` 仅存在于 CLI 黑盒测试。
- Desktop、browser、MCP、model、network、Python shell、Git/PR provider：未执行，保持 `missing evidence`。
- `just ci`：version sync、Markdown lint、root tests（618 total、616 passed、2 optional parser skips、0 failed）和 VitePress docs build passed。
- 最终 `git diff --check` 与 task validation：passed。
