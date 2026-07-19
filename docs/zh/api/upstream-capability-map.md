# 上游能力映射

本页概述上游 `drawio-skill` 的 37 个 Python 脚本如何映射到本仓库的离线 base skill。它映射的是**任务，而非命令名或中间格式**。权威的逐脚本矩阵位于 base skill 的 `skills/drawio/references/docs/upstream-capability-compatibility.md`。

## 映射语义

| 映射      | 含义                                                                  |
| --------- | --------------------------------------------------------------------- |
| `bridge`  | 已有 base 能力已经承担该任务                                          |
| `adapt`   | 在 canonical 边界之后保留了有用的输入或变换语义                       |
| `replace` | 该任务围绕 canonical YAML、离线执行、稳定身份或更严格的信任边界被重建 |
| `defer`   | 该任务未交付；原因与证据缺口保持显式                                  |

证据标签刻意收窄。`command-executed` 表示签入的确定性路径已运行。除非明确命名对应执行器，否则它不证明 Desktop、Graphviz、provider 环境、视觉模型、browser/MCP provider 或 PR 自动化。

## 已交付能力

| 能力族                    | 覆盖的上游任务                                                                         | 入口                                               |
| ------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------- |
| 声明态配置 / IaC 导入     | `tfimports`、`k8simports`、`composeimports`、`sqlerd`、`openapiimports`、`ciimports`   | [配置与 IaC 导入器](/zh/guide/config-importers.md) |
| 代码关系导入              | `pyimports`、`pyclasses`、`jsimports`、`goimports`、`rustimports`                      | [代码关系导入器](/zh/guide/code-importers.md)      |
| 运行态快照 + 漂移         | `tfstate`、`dockerimports`、`k8simports`（live）、`drawiodiff`、`prdiff`（声明态部分） | [运行态快照与漂移](/zh/guide/live-drift.md)        |
| 多页 bundle               | `c4`、`validate`（page bundle）                                                        | [多页 bundle](/zh/guide/multi-page.md)             |
| Postprocess               | `drawio2mermaid`、`explain`、`relabel`、`restyle`、`heatmap`、`drawiohtml`             | [Postprocess 套件](/zh/guide/postprocess.md)       |
| 结构化 raster 复刻        | `raster2drawio`                                                                        | [复刻工作流](/zh/guide/scientific-workflows.md)    |
| 图标与 stencil            | `aiicons`、`shapesearch`                                                               | [图标与 Stencil 搜索](/zh/guide/icons-stencils.md) |
| 布局、校验、URL、PNG 修复 | `autolayout`、`validate`、`encode_drawio_url`、`repair_png`                            | [CLI 参考](/zh/guide/cli.md)                       |

所有 adapter 都在 JavaScript ELK 与 renderer 之前收敛到 canonical spec 或 page bundle。base 拥有 runtime、catalog、schema、身份、布局、renderer 与详细参考；学术 overlay 只拥有出版策略。离线 authoring 不依赖 Python、Graphviz、网络、Desktop、browser、MCP 或 model——optional parser 与 export provider 会显式失败或回退。

## 已 Defer 的任务

以下上游任务是 **defer，而非隐藏命令**。每一个都需要单独的词汇、契约与证据才能诚实交付：

`buildup`（动画/GIF）、`compress`（executive narrative）、`drawio2pptx`、`prdiff`（Git provider 自动化）、`runbook`（点击式流程）、`seqlayout`（sequence authoring）、`svgflow`（动画 SVG）、`timelapse`（Git 历史回放）、`tubemap`（新语义布局）。

## 相关内容

- 权威矩阵：`skills/drawio/references/docs/upstream-capability-compatibility.md`
- [配置与 IaC 导入器](/zh/guide/config-importers.md)
- [代码关系导入器](/zh/guide/code-importers.md)
- [运行态快照与漂移](/zh/guide/live-drift.md)
- [Postprocess 套件](/zh/guide/postprocess.md)
