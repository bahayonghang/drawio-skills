# Design - SysML/BPMN canonical stencil delta

## 1. Boundary

本 child 只扩大现有 catalog 的可信 namespace。数据流保持：

```text
vendored shape-index.json.gz
  -> build-shape-catalog.js + COVERED_PREFIXES
  -> shape-catalog.json.gz
  -> loadShapeCatalog / catalog-search / resolveShapeNameKind
  -> validateSpec
  -> existing specToDrawioXml renderer
```

不新增 adapter payload、renderer、layout engine、shape index 或 academic runtime。

## 2. Catalog Contract

- `COVERED_PREFIXES` 是生成与 unknown-name validation 的唯一配置点，追加 `mxgraph.sysml.` 和 `mxgraph.bpmn.`。
- build 逻辑继续按完整 `shape=` name 去重，并保留现有 `{ n, k, t, g }` entry schema与 name/kind 排序。
- source rows 可能以相同 `shape=` 配合不同 style flags 表示 variant；canonical catalog 只承诺 stencil base name 可发现，不把 style variant 伪造成独立 semantic type。
- 提交 gzip 产物必须由现有生成器重建；源 index 与许可证不复制、不修改。

## 3. Search, Validation, Render

- Search 继续使用 `catalog-ranking.js`，依赖 source title/tags 命中 `sysml requirement`、`bpmn task`；不增加 domain-specific ranking engine。
- prefix 过滤只接受现有 `sysml`/`bpmn` 形式并归一化为 `mxgraph.<prefix>.`。
- `resolveShapeNameKind()` 对 catalog 内名称返回 `stencil`；新 namespace 内缺失名称返回 `unknown`，从而让 `validateSpec()` 给出明确错误/建议。
- canonical smoke 使用现有 node `icon: mxgraph.*` 路径，检查 XML 包含对应 `shape=mxgraph.sysml.*` / `shape=mxgraph.bpmn.*`；renderer 不知道 SysML/BPMN 特例。

## 4. Honest Support Boundary

当前交付支持“可搜索、可校验、可渲染的 SysML/BPMN stencil”。普通 node/edge/label 由 canonical schema bridge。

以下结构需要新的 containment/relative-geometry/connector contract，保持 `defer`：

- SysML IBD ports 与 parametric parameter ports；
- BPMN pool/lane parent hierarchy；
- BPMN sequence/message/conditional/default flow 的专用语义和跨 pool 约束。

最终 integration 文档只能陈述上述 shipped/deferred 边界，不得把上游 preset 表当作执行证据。

## 5. Files and Ownership

- 修改 `skills/drawio/scripts/dsl/shape-catalog.js`。
- 修改相邻 build/search/catalog/renderer tests；仅在真实排名缺口出现时修改 `catalog-ranking.js`。
- 重建 `skills/drawio/assets/catalog/shape-catalog.json.gz`。
- 新增 `.trellis/spec/drawio-skill/sysml-bpmn.md` 并登记 spec index。
- 不修改两个 `SKILL.md`、interfaces、global evals/docs/matrix/scorecard/release evidence。

## 6. Compatibility and Rollback

- 追加 namespace 不改变既有 catalog entry schema、builtin/family logic、CLI 参数或 spec syntax。
- 风险是 catalog 体积与模糊 search 结果变化；通过 count/size、domain query 与既有 search regression 控制。
- 回滚按单一 feature commit 撤销 prefix、tests、spec 与 regenerated gzip；source index 和其他 catalog 不受影响。

## 7. Evidence

command-executed evidence：build tests、catalog/search/validation/render tests、全量 Node tests、CI/docs build。

`missing evidence`：Desktop visual fidelity、model/human semantic review、deferred nested constructs。
