# Design - 方向③后处理导出

## 1. Source Of Truth And Data Flow

```text
legacy YAML / multi-page bundle v1 / imported .drawio
  -> existing classifier + drawio-to-spec/document-spec boundary
  -> normalized page/document view (order + stable identity preserved)
  -> pure transform or projection
  -> existing validateSpec / document validation
  -> existing renderer + XML/SVG validation when canonical output is needed
  -> artifact writer (drawio/spec/arch or projection output)
  -> deterministic postprocess metadata + focused review record
```

- YAML/spec 或 multi-page bundle v1 是可编辑事实源；生成的 Mermaid、Markdown、HTML、SVG 只是投影。
- 无 sidecar 的 `.drawio` 只在输入边界解码一次；canonical-producing operation 不直接在 XML 上做长期编辑。XML-only fallback 仅用于明确的第三方/legacy 输入失败诊断。
- multi-page foundation 的 `schemaVersion: 1`、页面数组顺序、`(pageId, objectId)`、structured links、逐页 XML validation、`--page`/`--all-pages` 语义均为外部不变量，本 child 不扩展其 schema。

## 2. Module Boundaries

规划中的实现边界（名称可在实施时按现有目录风格微调）如下：

| Module | Responsibility | Must reuse |
| --- | --- | --- |
| `scripts/postprocess/input.js` | 选择 legacy page 或 bundle page、导入 `.drawio`、统一 diagnostics | `drawio-to-spec.js`, `document-spec.js`, `multi-page.js` |
| `scripts/postprocess/projection.js` | Mermaid/Markdown explain 的纯 projection 与稳定排序 | canonical node/edge/module arrays, `xml-utils.js` only at import edge |
| `scripts/postprocess/mutate.js` | relabel/restyle/heatmap 的 immutable spec transforms | theme/style helpers, identity/link fields, `validateSpec` |
| `scripts/postprocess/html.js` | self-contained HTML viewer assembly、context-aware escaping、CSP-safe inline assets | existing SVG renderer, page metadata, HTML allowlist |
| `scripts/postprocess/artifacts.js` | operation metadata、atomic output、sidecar placement、input/options digest | `runtime/artifacts.js`, existing output path policy |
| optional isolated bridge (future) | Python/desktop/git shells only after separate approval | parameter-array subprocess contract; never ordinary runtime prerequisite |

The CLI route may expose an additive postprocess entry point and selectors, but skill routing, interfaces, mirrored docs and scorecard remain the future integration/promotion child.

## 3. Capability Contracts

### 3.1 MVP JS transforms

| Operation | Canonical contract | Multi-page rule | Failure behavior |
| --- | --- | --- | --- |
| `mermaid` | `renderMermaid(specOrDocument, { page, direction, fenced }) -> string` | all pages emit deterministic named sections; binary/text page selection follows foundation | unsupported semantic type becomes a warning/neutral node; dangling edges and unsafe labels fail |
| `html` | `renderHtml(documentOrPage, { title, search }) -> string` | bundle preserves page tabs and safe page links; selected page is allowed | unsafe label/link/SVG payload rejects; no remote asset is silently substituted |
| `heatmap` | `applyHeatmap(specOrDocument, metrics, options) -> canonical spec` | metrics key by `(pageId, objectId)`; preserve page order/links | malformed metric, NaN/infinite value, unknown palette or unsafe fallback rejects; unmatched entries report diagnostics |
| `restyle` | `applyRestyle(specOrDocument, preset) -> canonical spec` | transform every selected page without changing IDs/links | unknown preset/style key or invalid color rejects; icon/stencil values remain untouched |
| `relabel` | `applyRelabel(specOrDocument, map) -> canonical spec` | map keys resolve by stable address; labels may repeat across pages | missing/duplicate map key policy is explicit; map never changes endpoint or identity |
| `explain` | `explainDocument(documentOrPage, options) -> Markdown` | page sections retain author order and IDs | output is descriptive only; no inferred ownership, intent, risk or executive narrative |

### 3.2 Deferred or independent contracts

| Operation | Disposition | Dependency/evidence boundary |
| --- | --- | --- |
| `runbook` | independent semantic application child | define start-node, branch, terminal and ambiguity contracts; may reuse safe HTML viewer core |
| `svgflow` | independent animation child | define SVG sanitizer, animation vocabulary and file-backed/visual evidence before delivery |
| `tubemap` | independent authoring child | define canonical pipeline/tube semantics and editability first; not an existing-spec mutator |
| `seqlayout` | independent layout child | define sequence message schema, lifeline identity and edge semantics first |
| `compress` | successor consumer child | consumes bundle v1 and may emit summary/detail pages; clustering/narrative correctness requires human evidence |
| `buildup` | successor animation child | HTML core may reuse `html.js`; GIF/Pillow and render evidence are optional isolated paths |
| `pptx` | external export child | `python-pptx` and draw.io CLI/Desktop are optional; binary/visual output is missing evidence until executed |
| `timelapse` | governed history child | Git archive, importer subprocesses, temp checkouts and reproducibility policy are required |
| `prdiff` | governed CI/PR child | Git refs, rendering provider, download hashes, permissions and secrets must be independently approved |

## 4. Artifact And CLI Contracts

- Canonical-producing operations use the current `deriveArtifactPaths`, `serializeSpecYaml`, `buildArchMetadata` or `buildMultiPageArchMetadata`; no per-page sidecar fan-out and no timestamps/absolute paths。
- Projection output gets an adjacent deterministic `*.postprocess.json` only when provenance is needed. Minimum fields: `version`, `operation`, `inputKind`, selected page identity, normalized options, input content digest, output kind, `evidence: recorded-fixture|command-executed|missing-evidence`. It must not include secrets, user home paths or model claims.
- HTML/SVG output is self-contained and can be inspected from disk. It may use inline CSS/SVG only; no browser/server is required to generate it.
- CLI errors print stable operation/page paths and actionable diagnostics without echoing untrusted payloads. Output paths are resolved and checked before write; source and output must not alias.
- `preview.png`, temporary exports, `.drawio-tmp/`, external fixtures and `archive/.gitignore` are never implicit outputs or staging candidates.

## 5. Dependency And Evidence Decisions

- Runtime MVP: existing Node 20+, `js-yaml`, vendored ELK/utilities and current renderer only. No new package, network fetch, Desktop, browser, MCP or model call.
- Optional Python is a future bridge behind an explicit command and stdin/stdout/file contract; it cannot be imported by ordinary `create/edit/import/export`.
- Desktop export, Python-PPTX, GIF/Pillow, Git history and PR provider are deliberately `missing evidence` in this planning-only turn. A fixture or static code inspection is never called model-executed, Desktop-verified or PR-verified.
- Academic overlay receives a pointer to shared transforms and adds publication checks later; it does not own a second runtime or transform table.

## 6. Security Boundaries

1. Treat labels, links, SVG path data, Markdown, metrics, preset JSON and imported XML as untrusted data. Escape for HTML text/attribute, Markdown code/link contexts and XML/SVG attributes separately.
2. Allow only fixed local `data:` page-link shape generated by foundation; reject `javascript:`, `data:text/html`, remote script/style/font URLs and event-handler attributes.
3. Do not concatenate shell commands. Any future bridge uses argument arrays, bounded input/output, explicit executable allowlists and a task-local temporary directory with cleanup.
4. Preserve source bytes by default. Writes are explicit, atomic and inside the requested output/work directory; no recursive delete or broad workspace cleanup is part of this child.

## 7. Compatibility And Rollback

- Legacy flat YAML keeps the existing parser, renderer, XML shape and artifact naming. A failed postprocess must leave the input and existing final output untouched.
- Stable IDs, adapter identity/locator, Redis/Lucide/AI icons, ordinary stencils, modules and academic metadata are pass-through fields unless a transform explicitly owns a bounded style/label/value field.
- Each implementation commit can be reverted independently: pure projections/mutators, HTML emitter, then CLI/artifact wiring. Removing the postprocess route leaves legacy and multi-page foundation paths intact.
- Deferred Python/governed capabilities are disabled by absence of their child/feature flag; their absence must not block offline MVP output.
