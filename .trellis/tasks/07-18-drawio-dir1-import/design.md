# Design - 方向①导入与漂移 bucket

## 1. Ownership

bucket 只固定跨 child 合同。schema/identity/projector 由 foundation child 拥有；具体 parser 由 code/config child 拥有；snapshot normalization、diff 和 C0 visual evidence 由 live/drift child 拥有。base `skills/drawio` 拥有全部 runtime，academic overlay 不包含 adapter 或 diff 实现。

## 2. Cross-Child Data Flow

```text
untrusted source file/stdin
  -> child-owned parser
  -> CanonicalGraphProjection v1
  -> shared projection validation + identity finalization
  -> canonical YAML spec
  -> validateSpec
  -> vendored JavaScript ELK
  -> specToDrawioXml + validateXml
  -> work-dir sidecars / editable artifacts
```

Live drift 在 projection 层完成：

```text
declared projection --\
                      -> identity-keyed diff -> drift projection/report -> canonical spec -> JS ELK
live projection -----/                                                       |
                                                                              v
                                                C0 vision-preview + review + YAML-first rework
```

不得从带样式的 XML 反推重要属性。XML 只作为最终可编辑图和可视证据，不是 drift 的数据源。

## 3. Contract Boundaries

- Projection schema、identity tuple、stable render ID 和 errors 以 foundation `design.md` 为准。
- Parser 只可产生 nodes/edges/modules/source metadata/diagnostics；样式只表达语义 hint，不可写 raw Draw.io style string。
- Projector 将 semantic type/icon/module hint 映射到现有 canonical spec；布局字段只写 `meta.layout: hierarchical`，不写 bounds/waypoints。
- Snapshot sidecar 是 work artifact；canonical YAML 仍是图的编辑源，preview 仍只是证据。

## 4. Upstream Capability Mapping

15 个 C1 脚本的权威逐项表写入父任务 `research/upstream-capability-audit.md`。bucket 采用以下 ownership：

- foundation：`autolayout.py`（`replace`）。
- code：`pyimports.py`、`pyclasses.py`、`jsimports.py`、`goimports.py`、`rustimports.py`（`adapt`）。
- config：`tfimports.py`、`k8simports.py`、`composeimports.py`、`sqlerd.py`、`openapiimports.py`、`ciimports.py`（`adapt`）。
- live/drift：`tfstate.py`、`dockerimports.py`（`adapt`），`drawiodiff.py`（`replace`）；Kubernetes live JSON 复用 config child 的 `k8simports` adapter contract，不复制 parser。

`bridge` 只用于现有 canonical validation/JS ELK/C0 visual-review 能力，不为 upstream 脚本制造重复入口。Graphviz `dot/tred` 路径保持 `defer`，直到有 ELK 不满足需求的对比证据。

## 5. Error And Optional Dependency Policy

错误按 parser、unsupported、projection validation、identity collision、dependency missing、drift compatibility 分层。每层拥有一个 owner，CLI 只格式化错误并非零退出。

默认 base 只依赖现有 Node 20、`js-yaml` 和 vendored ELK。Python parser、HCL/SQL parser package、provider CLI 和 Graphviz 必须由所属 child 单独说明、测试和获得必要批准；不可因一个 importer 让所有路由加载依赖。

## 6. Rollback

- 每个 child 增加独立 adapter route 和测试，可单独移除。
- foundation schema 使用显式 version；未识别 version 硬失败，不猜测迁移。
- 现有 Mermaid、CSV、drawio import 与 canonical single-page flow 保持不变。
- live capture/diff、optional parsers 和任何未来 Graphviz path 可整体禁用，不影响 offline authoring。

## 7. Evidence Policy

每个 child 先记录 deterministic fixture/command evidence。Desktop preview 和 model review 是独立层；确定性 structure/layout gates 不能升级为 `model-executed`。缺少 provider/model 元数据时写 `missing evidence`，不以 C0 的已有 contract 或 upstream 129 tests 代替。
