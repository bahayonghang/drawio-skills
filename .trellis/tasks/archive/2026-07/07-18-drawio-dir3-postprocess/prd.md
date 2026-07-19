# 方向③后处理导出

## Goal

在不改变现有 YAML-first、canonical spec、offline-first 主干的前提下，为已经生成或导入的 draw.io 图提供一组可复跑的后处理投影与轻量导出。后处理必须消费现有单页 spec 或已完成的 multi-page bundle v1，保留稳定 `(pageId, objectId)`、页面顺序、链接和现有图形语义。

## Confirmed Facts

- 上游 R3 有十个 JS 变换候选：`mermaid`、`html`、`runbook`、`heatmap`、`tubemap`、`svgflow`、`restyle`、`relabel`、`explain`、`seqlayout`；以及五个 Python 外壳：`pptx`、`buildup`、`compress`、`timelapse`、`prdiff`。
- 本仓已有 `drawio-to-spec`、`spec-to-drawio`、shared XML utilities、standalone SVG renderer、artifact/sidecar helpers、CLI page selector，以及 multi-page bundle v1、结构化 links、逐页 XML validation 和 arch v2（work commits `8fb4889`、`8e82eec`、`14c78f3`）。
- 上游脚本大量直接解析/改写 XML；`drawio2pptx` 依赖 draw.io CLI 与 `python-pptx`，`buildup`/`timelapse`/`prdiff` 调用子进程，`svgflow`/`drawiohtml` 依赖外部 SVG 导出。它们不能直接成为普通 runtime 的隐式依赖。
- 既有 parent 已确定：不追求上游命令或中间格式兼容；base 持有 runtime，academic overlay 只追加出版策略；最终 routing/interfaces/evals/scorecard 由未创建的 integration/promotion child 收口。

## Requirements

### R3-1 Canonical input and output boundary

1. 所有 MVP 变换先把输入归一化为 legacy flat spec 或 bundle v1；不得建立长期并行的 XML-to-XML renderer。没有 sidecar 的 `.drawio` 只能在边界处导入，然后进入 canonical path。
2. multi-page 输入使用数组顺序和 `(pageId, objectId)` 寻址；支持的变换不得重排页面、重写稳定 ID、丢失结构化 links 或把跨页 link 降级为普通 URI。需要二进制单页输出时必须显式选择 `--page`，遵守 foundation contract。
3. canonical-producing 变换输出现有 `.drawio`，并可按既有 artifact 规则生成 `.spec.yaml`、`.arch.json`；projection-only 输出（Mermaid/Markdown/HTML/SVG）携带确定性的操作元数据，不伪装成新的 canonical spec。

### R3-2 MVP capability matrix

| 能力 | 本 child MVP | 输入/输出边界 | 关键限制 |
| --- | --- | --- | --- |
| `mermaid` | 是 | canonical single page 或 bundle page -> deterministic Mermaid/fenced Markdown | 只表达 Mermaid 可表达的节点、边、模块和标签；样式/精确坐标/专用 stencil 允许降级并记录 warning |
| `html` | 是 | bundle 或选定 page -> self-contained HTML viewer | 无网络脚本、无外部字体/CDN；页签、缩放、搜索和已验证 page links 只使用安全内嵌数据 |
| `runbook` | 否 | 选定 flow page -> self-contained click-through HTML + review metadata | 需要独立 child 定义起点、decision/branch 语义和歧义错误，不与通用 viewer 混交付 |
| `heatmap` | 是 | canonical page/bundle + local CSV/JSON metrics -> canonical spec/drawio | metric key 优先稳定 object identity，其次显式受控 label fallback；数值、palette、size 选项有界且确定性 |
| `restyle` | 是 | canonical spec/bundle + bundled/user preset -> canonical spec/drawio | 只改允许的 style tokens；保留 icon、stencil、adapter identity、layout、links 和 academic metadata |
| `relabel` | 是 | canonical spec/bundle + explicit label map -> canonical spec/drawio 或 labels projection | map 按 `(pageId, objectId)` 优先；不改变 id、edge endpoints、geometry 或 link target |
| `explain` | 是 | canonical spec/bundle -> deterministic Markdown | 只报告可观察结构/元数据；不生成未经证据支持的架构意图或董事会叙事 |
| `svgflow` | 否 | 现有 standalone SVG 或选定 page -> self-contained animated SVG | 需要独立 animation child 固定 SVG sanitizer、动画 vocabulary 和视觉证据；Desktop export 仍是 missing evidence |
| `tubemap` | 否 | JSON/semantic authoring input -> canonical spec | 属于新布局/作者工具，需独立 child 先定义 schema、route 和 editability |
| `seqlayout` | 否 | message-list authoring input -> canonical sequence spec | 属于 sequence layout engine，不是已有图的后处理；需独立 child 处理 UML semantics 和 validation |

### R3-3 Python shell disposition

- `compress`：本 child 只固定后继消费契约；它可消费 multi-page foundation，但聚类、命名、summary/detail 页面和“语义正确的董事会叙事”必须由独立 child 验收。
- `buildup`：静态图到 HTML 播放器可作为后继 animation child；GIF/Pillow、draw.io export 和视觉证据不进入 MVP。
- `pptx`：独立 export child；`python-pptx`、draw.io Desktop/CLI 和页图像尺寸均为可选外部依赖，未执行时保持 `missing evidence`。
- `timelapse`：独立 governed history child；需要 git archive、importer 重跑、临时 checkout 和大量 runtime 时间，不能进入普通 offline transform。
- `prdiff`：独立 governed/CI child；需要 Git refs、render provider、权限/依赖下载与 secrets 边界，默认禁用 PR bot。

### R3-4 Determinism, compatibility and safety

1. 相同 canonical input、options 和本地 sidecar bytes 必须得到字节稳定的 text/HTML/SVG/spec output；不得写时间戳、绝对路径、随机 ID 或环境相关排序。
2. legacy flat YAML 的现有输出和行为保持不变。Redis/Lucide/AI icons、普通 stencil、adapter identity/locator 和 academic profile 作为受保护字段透传；restyle 不替换图标资源，relabel 不改 identity，heatmap 不破坏 link metadata。
3. base runtime 复用现有 renderer、SVG、artifacts、CLI 和 sidecar；academic overlay 不复制变换实现，只在后继集成中追加出版可读性检查。
4. 标签、Markdown、SVG、HTML、文件名、metric keys 和 preset 文本都是不可信数据：按上下文 escaping/sanitization；禁止 `javascript:`、HTML event attributes、任意 `<script>` 和未经 allowlist 的 URI。
5. 文件写入只允许用户显式的 output path 或 task-local work directory；使用临时文件 + 原子替换，保留输入，拒绝覆盖 source，清理临时导出。`archive/.gitignore`、任何 `preview.png` 和外部 fixture 不得被任务改动或提交。
6. Python/Node 子进程必须参数数组调用；本 child 不新增 runtime dependency、不联网、不调用 Desktop/browser/MCP/model/external binary。所有此类路径在证据表中标为 `missing evidence`。

## Acceptance Criteria

- [x] 三份 task artifact 形成一致的 MVP/后继边界；没有未决占位符。
- [x] 六个 MVP 能力逐项拥有输入、输出、multi-page 行为、复用模块、错误边界和 focused tests；deferred operation 未进入实现。
- [x] canonical spec/YAML-first 与 projection-only 输出边界明确，legacy 与受保护字段有兼容回归。
- [x] 离线 deterministic、文件/临时 artifact、XSS/注入/路径边界有测试；外部证据保持 `missing evidence`。
- [x] 消费 multi-page foundation v1 而未修改其 schema、identity、link 或 per-page validation 契约。
- [x] feature 实施未修改两个 `SKILL.md`、interfaces、global scorecard，未创建额外 C2/C3 child。
- [x] focused、root CI 与 `git diff --check` 按 implement.md 的阶梯执行；未执行 external/provider evidence 未标记通过。

## Explicit Out Of Scope

- 六个 MVP 以外的生产能力、任何新增 runtime dependency，以及 Desktop/browser/MCP/model/network/binary 运行。
- 上游 Python CLI 的命令、参数、XML/JSON 中间格式兼容；复制上游 XML renderer、Graphviz 或新的页面/布局 schema。
- `runbook`、`svgflow`、`tubemap`、`seqlayout`、`compress`、`buildup`、`timelapse`、`pptx`、`prdiff` 的实现或新建对应 child。
- 修改 `.trellis/tasks/07-18-drawio-upstream-port` parent、dir1、dir2、multi-page archive，或任何新建 integration/promotion child。
- 修改两个 `SKILL.md`、agents/interfaces、global scorecard、academic runtime 或 root `archive/.gitignore`；不提交 `preview.png`。

## Completion Status

本 child 已获批准并进入 `in_progress`。六个 MVP 已实现；收口时仅提交、验证并归档本 child，deferred operations 继续不实施、不创建 child。
