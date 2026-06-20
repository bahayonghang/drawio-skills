# Draw.io Academic Overlay

面向出版级 draw.io 图表的 Academic Overlay：论文、学位论文、IEEE 图、manuscript、journal figure、公式图、科研流程图、roadmap，以及 A4/Word/LaTeX 交付。

这个目录刻意保持轻量。它依赖 sibling Draw.io Base Skill：`../drawio`，不再复制 base runtime 文件。

> 版本说明：本 overlay 被有意重置为 `0.1.0`，是「瘦身重生」后的薄层，**不是**旧学术版的降级——共享的作图能力已全部归入 sibling Draw.io Base Skill（仓库版本 `2.2.0`），本 overlay 只保留出版策略。

## 必需的 sibling base

请把两个目录并排安装或复制：

```text
skills/
├── drawio/
└── drawio-academic-skills/
```

Overlay 使用这些 base 路径：

- `../drawio/scripts/cli.js`
- `../drawio/scripts/runtime/diagrams-net-url.js`
- `../drawio/references/docs/`
- `../drawio/references/workflows/`
- `../drawio/references/examples/`（共享通用示例）
- `../drawio/assets/themes/`
- `../drawio/styles/built-in/`

学术策略文档与 paper 示例为 overlay 本地资产：

- `references/docs/academic-figure-playbook.md`
- `references/docs/academic-export-checklist.md`
- `references/examples/`（paper/pipeline 示例）

如果 `../drawio` 缺失，请先把 base skill 安装到 overlay 旁边。不要把 base 文件重新复制进 overlay。

## 默认链路

```text
学术需求 -> preflight -> YAML spec -> sibling base CLI 校验 -> 最终 .drawio + .svg，sidecars 保存在 .drawio-tmp/<name>/
```

PNG、PDF、JPG 和 embedded `.drawio.svg` 在 draw.io Desktop 可用时，通过 sibling base CLI 导出。

## Academic preflight

渲染前先确定：

- venue / audience：paper、thesis、IEEE、journal、manuscript、Word/A4、LaTeX、slides 或 draft
- figure type：`architecture`、`roadmap` 或 `workflow`
- 黑白 / 灰度安全 / 彩色策略
- caption、legend、title 需求
- 公式和文字位置保真要求
- 请求的导出格式以及 Desktop 是否可用

## 快速导出

从 overlay 目录内运行：

```bash
node ../drawio/scripts/cli.js references/examples/system-architecture-paper.yaml figure.svg --validate --write-sidecars --sidecar-dir .drawio-tmp/figure --strict-warnings
node ../drawio/scripts/cli.js references/examples/system-architecture-paper.yaml figure.png --validate --use-desktop
```

从仓库根目录运行：

```bash
node skills/drawio/scripts/cli.js skills/drawio-academic-skills/references/examples/system-architecture-paper.yaml figure.svg --validate --write-sidecars --sidecar-dir .drawio-tmp/figure --strict-warnings
```

如果没有 draw.io Desktop，可以从 `.drawio` 产物生成 diagrams.net URL：

```bash
node ../drawio/scripts/runtime/diagrams-net-url.js figure.drawio
```

## MCP 定位

这个 overlay 不包含 `.mcp.json`。Academic create、edit、replicate、export 都保持本地、可重复。Live backend refinement 只属于 base skill，不是 academic 默认路径。

## 样式预设

用户预设目录：

```text
~/.drawio-academic-skills/styles/
```

内置预设在 sibling base：

```text
../drawio/styles/built-in/
```

不要修改 base 内置 presets。需要默认或编辑时，先复制到用户预设目录。

## Overlay 自有文件

- `SKILL.md`：学术策略与 sibling-base contract。
- `references/docs/publication-overlay.md`：overlay-only 出版说明。
- `evals/`：academic evaluation set 和 prompt fixtures。

共享 CLI、schemas、themes、examples、workflows、official references、style-extraction 指南和 vendored direct-XML 参考都在 `../drawio`。
