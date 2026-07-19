# Postprocess 套件（`/drawio postprocess`）

Postprocess 在离线状态下投影或变换 canonical 输入。它把 YAML 或导入的 `.drawio` 一次性归一化为现有的旧版扁平 spec 或 canonical 多页 bundle v1，再执行单个操作。它不是 XML-to-XML 编辑器，也不引入第二套 page schema。

交付的操作集恰好为 `mermaid`、`explain`、`relabel`、`restyle`、`heatmap` 和 `html`。

## 操作

| 操作      | 类别 | 输出                                                        |
| --------- | ---- | ----------------------------------------------------------- |
| `mermaid` | 投影 | 确定性 Mermaid                                              |
| `explain` | 投影 | 对可观察结构/元数据的确定性 Markdown                        |
| `relabel` | 变换 | 更新 label 后的 canonical YAML/`.drawio`                    |
| `restyle` | 变换 | 带 allowlist style token/preset 的 canonical YAML/`.drawio` |
| `heatmap` | 变换 | 带受限本地度量的 canonical YAML/`.drawio`                   |
| `html`    | 投影 | 自包含、无脚本的 HTML 查看器                                |

- **投影**（`mermaid`、`explain`、`html`）是确定性输出，不是 canonical authoring 源。
- **变换**（`relabel`、`restyle`、`heatmap`）返回现有 YAML 或 `.drawio`，并保留 page 顺序、`(pageId, objectId)`、link、adapter 身份、icon、stencil、几何与学术元数据，除非所选变换拥有某个受限字段。
- `relabel` 解析稳定的 page/object 地址；`restyle` 只接受 allowlist style token；`heatmap` 先按身份、再按地址、最后按显式启用的无歧义 label 回退来解析。
- `html` 输出自包含且无脚本：tab、缩放控件、生成的搜索结果与 page link 仅使用 HTML/CSS 控件——不需要远程资源、browser 运行时或内联 script。

## CLI

```bash
node skills/drawio/scripts/cli.js postprocess <operation> <input> <output> [options]

# 把单页投影为 Mermaid
node skills/drawio/scripts/cli.js postprocess mermaid bundle.yaml architecture.mmd --page context

# 为每一页生成无脚本 HTML 查看器
node skills/drawio/scripts/cli.js postprocess html bundle.yaml viewer.html --all-pages

# 把可观察结构解释为 Markdown
node skills/drawio/scripts/cli.js postprocess explain diagram.drawio diagram.md
```

`--page` 与 `--all-pages` 互斥。每次运行还会写出相邻的 `*.postprocess.json` 溯源 sidecar，记录版本、操作、输入 kind/digest、所选页、归一化选项、辅助 digest、输出 kind、诊断与诚实的证据 kind——不含路径、密钥、时间戳或原始辅助内容。源与辅助输入不得与输出或 sidecar 别名重叠。

## 错误

| 条件                                                       | 结果                       |
| ---------------------------------------------------------- | -------------------------- |
| 不支持的操作、输入格式、flag 或输出扩展名                  | 明确 CLI 错误，非零退出    |
| `--page` 与 `--all-pages` 同时出现                         | 明确冲突错误               |
| relabel 地址缺失/重复                                      | 报错，除非显式允许缺失 key |
| 不安全/未知的 restyle token 或 preset                      | 变换前硬失败               |
| 非有限度量、重复 key、未知 palette 或歧义 label            | 变换前硬失败               |
| 可执行 HTML/SVG 文本、远程资源、event 属性或不安全 page ID | 硬失败；不产生部分 HTML    |
| 输出或 sidecar 与源/辅助输入别名重叠                       | 硬失败；输入字节不变       |

## Defer，而非隐藏

Runbook、动画 SVG、tube/sequence layout、compression、buildup、PPTX、timelapse 与 PR diff 均为 **defer**，并非隐藏命令。从普通离线 route 调用 defer 操作会被拒绝。Desktop、browser、model、Python shell、Git provider 与网络运行仍是 `missing evidence`，绝不从 fixture 推断。

## 相关内容

- [多页 canonical bundle](./multi-page.md)
- [上游能力映射](/zh/api/upstream-capability-map.md)
- [CLI 参考](./cli.md)
