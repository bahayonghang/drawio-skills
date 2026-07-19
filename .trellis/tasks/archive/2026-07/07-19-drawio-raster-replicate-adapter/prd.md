# Raster 与 replicate canonical adapter

## Goal

把视觉模型或人工已经提取出的结构化图形 JSON 作为现有 replicate 工作流的机器可读输入，直接规范化为本仓 canonical single-page spec，再复用 `validateSpec`、vendored JavaScript ELK、唯一 renderer、sidecar 和 C0 visual-review/refinement 管线。该能力不读取图片、不调用视觉模型，也不建立 JSON-to-XML 平行实现。

## Confirmed Facts

- 上游 `raster2drawio.py` 不读取 raster；它只把外部视觉抽取的 `{nodes, edges}` JSON 直接写为 XML，缺少坐标时另行调用 Python/Graphviz autolayout。
- 本仓 replicate 已定义 source canvas、semantic node type、explicit `bounds`、palette、waypoint、label offset 和稳定 ID 的 canonical YAML 契约。
- 本仓 renderer 已支持 `meta.source: replicated`、`meta.canvas`、`meta.replication`、node `bounds/style`、edge `waypoints/style`，且无坐标节点会进入 vendored JavaScript ELK。
- canonical spec 与 schema 仍是唯一可编辑事实源；CLI 已有统一的 input adapter 路由、验证、render、`--export-spec` 和 sidecar 输出。
- shape catalog、AI icon catalog、multi-page foundation 与视觉返工基础已经存在，本 child 只消费，不复制。

## Mapping and Dependencies

- Upstream mapping: `raster2drawio.py` -> `adapt`。
- 前置 feature：已完成 C0 vision rework；现有 replicate、canonical DSL 和 JS ELK；不依赖 AI icon 或 multi-page runtime。
- 后继：最终 integration/promotion child 才更新两个 `SKILL.md`、interfaces、evals、compatibility、global scorecard、用户文档和 release evidence。
- 新 production/runtime dependency：无；不得增加。

## Requirements

### R1 Versioned Extraction Contract

- 新输入格式名为 `raster-extraction`，接受 UTF-8 JSON object，要求 `schemaVersion: 1`、非空 `nodes`、数组 `edges`，可选 `canvas`。
- `canvas` 只接受有限正整数 `width`/`height` 和可选安全颜色 `background`；存在时映射为 `meta.canvas: WIDTHxHEIGHT` 与 `meta.replication.background`。
- node 要求安全、唯一、调用方提供的 `id` 与非空 `label`。可选 `type` 必须是 canonical type；否则有限 `shape` 词表映射为已有 semantic type，不新增 shape/type/runtime。
- node 几何使用 `x/y/w/h`。只有所有节点都提供完整、有限、正尺寸几何时才映射为 canonical `bounds`；任一节点完全缺失几何时整图不写 bounds，交给 JS ELK。单节点只提供部分几何是 `ADAPTER_PARSE`，不得猜值或形成混合坐标。
- node 只透传 canonical 已支持的高置信字段：`fill`/`stroke` -> `style.fillColor/strokeColor`，以及有限 `fontSize/fontColor`。不接受 raw draw.io style、HTML、image data URI 或任意未知字段。
- edge 要求安全、唯一、调用方提供的 `id`，以及存在的 `source`/`target` node。可选 label、dashed、arrow、stroke、waypoints 和 labelOffset 映射到 canonical edge；不得生成浮动 connector 或 arrow-look-alike vertex。
- 输入 object、node、edge、canvas 采用精确 allowlist；未知字段 hard-fail，避免悄悄丢失视觉抽取信息。

### R2 Canonical Output and Pipeline

- adapter 直接返回 legacy-flat canonical spec：`meta.source: replicated`、`meta.layout: hierarchical`、`meta.replication.colorMode: preserve-original`、`nodes/edges/modules`；不得写 `schemaVersion/pages` 或建立第二份 canonical shape。
- 输出必须通过现有 `validateSpec`；CLI 继续通过现有 `applyAutoLayout`、`specToDrawioXml`、`validateXml`、artifact/sidecar 分支。
- `--export-spec` 输出可重新作为普通 YAML 输入；file-backed fixture 的 normalize -> render -> validate 结果必须确定性。
- 显式 bounds 保持 source canvas 坐标；无 bounds 时实际执行 vendored JS ELK。不得调用 Python、Graphviz、Desktop、network、browser、MCP 或 model。

### R3 Errors, Safety, and Evidence

- JSON 语法、shape、字段、ID、颜色、几何、引用错误统一为 `ADAPTER_PARSE`；已知但当前不支持的 schema version 为 `ADAPTER_UNSUPPORTED`。错误包含 adapter 名与稳定 field path，不回显整段输入。
- 拒绝 `__proto__`/`constructor`/`prototype`、控制字符、非有限数字、过大 canvas/object counts、unsafe color、raw style/HTML/image/link payload。
- focused evidence 覆盖 good/base/bad、显式 bounds、整图 ELK fallback、确定性 canonical YAML、CLI render/sidecars 和拒绝矩阵。
- Desktop export、实际 raster 视觉读取、视觉模型抽取准确率和人工 original-vs-export comparison 在本 child 中不执行，状态保持 `missing evidence`；不得把 fixture/command evidence 写成 model-executed。

## Acceptance Criteria

- [x] `parseRasterExtraction` 对版本化 extraction JSON 产出唯一 legacy-flat canonical spec，并保留稳定 node/edge ID、labels、完整 bounds、颜色、waypoints 和 label offset。
- [x] 部分几何、重复/unsafe ID、dangling edge、unknown field/type/shape、invalid color、oversize/non-finite 数据和污染键以稳定 `ADAPTER_PARSE` 拒绝；unsupported version 为 `ADAPTER_UNSUPPORTED`。
- [x] 任一节点完全无几何时输出无 node bounds，并由现有 JS ELK 实际布局；全量几何时不改写 source top-left bounds。
- [x] `--input-format raster-extraction` 支持 file/stdin、`.drawio`、`--export-spec`、`--write-sidecars`，且所有路径复用现有 validator、renderer 和 artifacts。
- [x] file-backed fixture 的 adapter -> canonical YAML -> render -> XML validate 通过，重复运行字节一致；未出现第二套 XML renderer、shape index、visual-review 表或 academic runtime。
- [x] focused tests、相关 integration tests、`npm test`、`just ci` 与 `git diff --check` 全部通过。
- [x] 没有新增 dependency，没有 Python/Graphviz/network/Desktop/browser/MCP/model 调用；外部视觉 evidence 保持 `missing evidence`。
- [x] 不修改两个 `SKILL.md`、interfaces、global eval/scorecard、compatibility、用户文档或 release evidence；这些只由 integration/promotion child 收口。

## Out of Scope

- 读取 PNG/JPEG、OCR、目标检测、颜色采样或调用视觉模型。
- 上游 Python CLI/JSON/XML 字节兼容、Graphviz autolayout或 direct XML generation。
- multi-page raster extraction、C4、SysML/BPMN、shape search、AI icon catalog 修改。
- Desktop/视觉模型现场验收、两个 skill 入口和发布面更新。
