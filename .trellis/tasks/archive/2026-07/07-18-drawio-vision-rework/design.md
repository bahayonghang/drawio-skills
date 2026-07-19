# Design - 视觉识别导出与返工闭环

## 1. Data Flow

```text
canonical spec
  -> validate
  -> render .drawio
  -> Desktop vision-preview export
  -> wait for stable file
  -> inspect PNG
  -> re-export by height when needed
  -> deterministic diagnostics + visual review record
  -> targeted canonical patch
  -> validate and repeat
  -> existing final export after approval
```

Preview 是 work artifact；final 是交付 artifact。两者不能共享隐式参数或互相覆盖。

## 2. Module Boundaries

### `scripts/runtime/desktop.js`

- 扩展 `buildDrawioExportArgs` 的 option object，增加 `profile`。
- `profile: 'final'` 保持现有默认行为。
- `profile: 'vision-preview'`：PNG only、`embedDiagram=false`、无 scale、width 或 height 二选一。
- `exportWithDrawioDesktop` 接受稳定等待 helper 注入，并返回 export metadata。

### `scripts/runtime/export-stability.js`（新）

- `waitForStableFile(path, options)`。
- 观测文件存在、size > 0、连续稳定样本；超时抛出包含目标路径和等待时长的错误。
- 注入 `stat`、`now`、`wait`，避免真实 sleep 单元测试。

### `scripts/runtime/png-inspection.js`（新）

- `inspectPng(buffer)`：返回 width、height、chunks、hasIend、knownTruncation。
- `repairKnownIendTruncation(buffer)`：只处理精确已知形态，返回状态和 buffer。
- 解析按 PNG chunk length/type/data/crc 边界推进；不需要新增运行时依赖。
- 本任务不验证所有 chunk CRC，但必须验证边界并拒绝无法完整遍历的未知损坏。

### `scripts/cli.js`

- 解析 `--visual-preview`。
- 只允许 Desktop PNG 输出；与不兼容 flag 组合时显式失败。
- 首次 width=2000 导出后 inspect；height > 2000 时删除/覆盖 preview，以 height=2000 重导。
- 二次 inspect 必须满足最长边限制，否则失败。
- final CLI 路径不改变。

### Skill/reference surface

- 新增 base `references/workflows/visual-review.md`。
- base `SKILL.md` 与 create/edit/replicate 只写触发条件和 context pointer。
- academic `SKILL.md`/现有 publication docs 追加对 base 流程的引用和 academic-only rubric。
- 在改动前建立当前 literal/proximity assertion map，避免破坏 test-pinned wording。

## 3. Export Profiles

| Profile          | Embed            | Scale                 | Dimension            | Purpose            |
| ---------------- | ---------------- | --------------------- | -------------------- | ------------------ |
| `final`          | existing default | existing DPI behavior | existing behavior    | user deliverable   |
| `vision-preview` | false            | none                  | longest edge <= 2000 | model/human review |

Preview algorithm:

1. Export with `--width 2000`.
2. Wait until file exists and size is stable.
3. Inspect PNG.
4. If height > 2000, export again with `--height 2000`.
5. Wait and inspect again.
6. Require valid PNG, IEND and `max(width,height) <= 2000`.

The 2000px bound is a compatibility default learned from upstream and validated locally as readable. It is not presented as a universal provider limit.

## 4. PNG State Machine

```text
complete PNG + IEND
  -> unchanged

valid PNG + exact known terminal IEND truncation
  -> repaired -> re-inspect -> complete

non-PNG / malformed IHDR / unknown truncated chunk / trailing garbage
  -> rejected
```

Known repair must be idempotent. Repair writes atomically through a temporary sibling file plus rename when applied to disk; the pure buffer function remains separately testable.

## 5. Structured Review Contract

```json
{
  "artifact": "figure.preview.png",
  "round": 1,
  "issues": [
    {
      "pageId": "main",
      "objectId": "edge:api->db",
      "problem": "edge-label-overlap",
      "severity": "blocker",
      "evidence": "The label overlaps the database outline near the upper edge.",
      "suggestedAction": "Move labelOffset 16px into adjacent whitespace.",
      "source": "visual"
    }
  ]
}
```

Rules:

- `objectId` may be null only when the model cannot resolve one; evidence must then name a page/region.
- Deterministic and visual issues dedupe by page/object/problem, preserving both evidence sources.
- No review record directly mutates files. The agent maps an accepted issue to a canonical patch, validates, then rerenders.

## 6. Rework Mapping

| Feedback           | Canonical action                                              |
| ------------------ | ------------------------------------------------------------- |
| color/style        | update semantic type/theme override before raw style          |
| add/remove node    | update node and affected edges by stable ID                   |
| move/resize        | update `bounds` for explicitly positioned diagrams            |
| add/change edge    | update edge by stable source/target/id                        |
| label              | update node/edge label; preserve ID                           |
| layout direction   | update `meta.layout`, rerun layout                            |
| clipped label      | shorten label first, then bounds/font ladder rules            |
| edge-label overlap | update `labelOffset`; do not create a floating text duplicate |

Imported XML without a sidecar uses shared XML utilities and keeps validation mandatory. Layout-wide feedback regenerates; local feedback patches the smallest canonical object.

## 7. Loop Completion Criteria

An autonomous round is complete only when:

- spec/XML validation completed;
- preview is structurally valid and within dimension bound;
- every previous blocker is absent, downgraded with new evidence, or explicitly retained for user decision;
- the new review record is persisted in the work directory when evidence is being collected.

After 2 autonomous repair rounds, unresolved blockers return to the user. After 5 user feedback rounds, report remaining issues and recommend Desktop fine-tuning.

## 8. Evidence Design

Five file-backed visual cases:

1. small English flowchart;
2. wide architecture;
3. tall workflow;
4. CJK diagram;
5. dense academic figure.

PNG parser fixtures:

- complete embedded PNG;
- complete non-embedded preview;
- exact known IEND truncation;
- wrong signature;
- truncated non-IEND chunk;
- trailing garbage.

Scorecard separates deterministic assertion results, command execution, visual-model execution and reviewer adjudication. Missing provider-backed runs remain `missing evidence`.

## 9. Compatibility and Rollback

- Existing callers that omit `profile` receive `final` behavior.
- Existing PNG/PDF/JPG/SVG commands remain valid.
- `--visual-preview` is additive and can be removed without changing final exports.
- New helpers are focused modules and do not add dependencies.
- Academic overlay remains runtime-free.

## 10. Risks

- Desktop versions differ in output timing and IEND behavior: protect with structure inspection and injected tests, not version strings alone.
- Width/height flags may have platform/version quirks: integration test current Desktop when available; otherwise mark missing evidence.
- Visual models can hallucinate object IDs: require evidence and allow null IDs.
- Rewording SKILL files can break literal/proximity tests: map assertions before edits and keep one-line contract pointers.
