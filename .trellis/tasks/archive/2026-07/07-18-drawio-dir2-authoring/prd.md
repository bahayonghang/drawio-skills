# 方向②专业作图

## Goal

作为方向②的规划 bucket，把上游 raster2drawio、aiicons、shapesearch 与新增图表预设按本仓 canonical spec、YAML-first、offline-first 边界拆成独立、可验证、可回滚的 child。该 bucket 只拥有范围、依赖和能力映射，不直接修改生产代码，也不得直接运行 `task.py start`。

## Confirmed Facts

- 本仓已有 replicate、shape catalog search、network topology 和 swimlane；这些能力优先 `bridge`，不复制实现或 10,446 项 shape index。
- raster2drawio 的真实缺口是“视觉抽取到 canonical spec”，不是另一套 JSON-to-XML renderer。
- 用户已选择完整离线 AI 图标目录；固定 `@lobehub/icons-static-svg@1.91.0` 的 309 个真实 base brand，运行时零网络访问；上游 311 口径中的 2 个 suffix 误分项不进入 canonical catalog。
- SysML/BPMN 差距审计确认真实缺口是 vendored shape catalog 覆盖，而不是新增 semantic type；nested ports/pools/lanes 与专用 flow 仍需未来 canonical contract。
- C4 下钻所需的 canonical multi-page foundation 已交付；本 bucket 不扩张为 C4 自动语义生成器。

## Requirements

1. 每个新增能力必须作为独立 child 拥有 `prd.md`、`design.md`、`implement.md`、前置依赖和 focused validation。
2. 现有能力必须标记 `bridge` 并以路由、文档或回归证据验收，不制造重复 runtime。
3. 新增解析或视觉输入必须进入 canonical spec/page bundle，再复用现有 validate、ELK、renderer、sidecar 和 C0 visual-review 管线。
4. base 拥有 runtime、assets、schemas 和共享 references；academic overlay 只追加论文策略。
5. 方向②的 skill 路由、interfaces、跨能力 eval 和 release evidence 统一由最终 integration/promotion child 收口，feature child 不重复改 description。

## Child Map

- **C2.1 P1 completed** `07-18-drawio-ai-icon-catalog`：`replace` 上游 CDN aiicons，生成并加载 309 品牌离线目录；已归档，后继 child 只做兼容回归。
- **C2.2 P1 completed** `07-19-drawio-multi-page-foundation`：`replace` 上游 C4/Python XML 基础为 bundle v1、稳定 page/object identity、structured page links、逐页 validation、YAML/arch sidecar 和多页 `.drawio` round-trip；已归档，C4/compress 仅作后继消费者。
- **C2.3 P1 completed** `07-19-drawio-raster-replicate-adapter`：`adapt` 严格 raster-extraction JSON 为 canonical spec，复用 validate、JS ELK、renderer 与 sidecars；已归档，真实 raster/OCR/model fidelity 保持 `missing evidence`。
- **C2.4 P1 completed** `07-19-drawio-sysml-bpmn-delta`：`adapt` vendored SysML/BPMN stencil 到现有 catalog/search/validation/renderer；已归档，flat schema 无法忠实表达的 nested ports/pools/lanes 与专用 flow 语义保持 `defer`。

## Authoritative Capability Mapping

- `raster2drawio` / replicate structured extraction：`adapt` -> C2.3。
- `aiicons`：`replace` -> C2.1 的 309-entry offline catalog；runtime zero network。
- `shapesearch`：`bridge` -> 既有 catalog/search；SysML/BPMN namespace delta 由 C2.4 `adapt`，不复制 index 或 ranker。
- C4 multi-page/down-link foundation：`replace` -> C2.2；自动 C4 语义生成不在本 bucket 声称。
- network topology 与 swimlane：`bridge` -> 既有 canonical semantic types/docs/tests。
- SysML/BPMN base stencils：`adapt` -> C2.4；nested ports/pools/lanes、style variants 与专用 flow semantics：`defer`。

## Acceptance Criteria

- [x] 每项方向②能力都有唯一的 `bridge`、`adapt`、`replace` 或 `defer` 归属。
- [x] 所有真正新增能力已拆成独立 child，依赖关系写入 child 工件而不是只靠树位置。
- [x] 没有重复的 shape index、XML renderer、视觉返工表或 academic runtime。
- [x] feature child 的证据可由 integration/promotion child 汇总为至少五个 file-backed output cases。
- [x] 本 bucket 始终保持 planning，不作为生产代码实施目标。

## Cross-Child Acceptance Evidence

- 四个 required child 的 archived `task.json` 均为 `completed`，且各自保留 `prd.md`、`design.md`、`implement.md`、dependency/evidence/rollback 边界。
- AI icon suite 有五个独立 file-backed cases；command 与 Desktop 30.3.14 structural/pixel checks 已执行，`model-executed` 保持 `missing evidence`。
- Multi-page handoff 记录 legacy regression、structured links、per-page validation 及 uncompressed/compressed/mixed semantic round-trip 通过；外部 Desktop/provider 证据仍明确缺失或不需要。
- Raster child 记录 focused parser 6/6、CLI 2/2、related 220/220，并以 checked-in JSON 证明 canonical/ELK/renderer path；视觉抽取正确性保持 `missing evidence`。
- SysML/BPMN child 记录 focused 215/215、source/unique counts、deterministic gzip 与 canonical icon render smoke；nested semantics 保持 `defer`。
- 本轮聚合 focused suite 30/30 通过；最新 child 的 `just ci` 为 630 total、628 passed、2 optional skips、0 failed，docs build 通过。
- repository scan：1 个 vendored `shape-index.json.gz`、1 个 `ai-icons.json.gz`、1 个 `specToDrawioXml` owner、0 个 academic JS/TS/Python runtime。

## Out of Scope

- 兼容上游 Python CLI 的命令或中间格式。
- 在本 bucket 中直接实现或启动任何 feature。
- 把详细脚本说明或完整视觉检查表复制进两个 `SKILL.md`。
