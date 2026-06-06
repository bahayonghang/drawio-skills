# 快速开始

Draw.io Skill 是一个 YAML-first、离线优先的 draw.io 图表工作流，支持从自然语言、YAML、Mermaid、CSV 或导入的 `.drawio` 文件生成专业图表。

## 选择 Skill 变体

- 使用 `skills/drawio` 处理通用图、网络拓扑、UML/ER/sequence/state、Mermaid/CSV 转换、导入/导出、style presets 和可选 live refinement。
- 使用 `skills/drawio-academic-skills` 处理 paper、thesis、IEEE、journal、manuscript、A4/Word/LaTeX 和出版级图。

Academic Overlay 需要 sibling `../drawio`。它不复制 base CLI、schemas、themes、examples 或 workflow references。

## 你需要准备什么

- 任一受支持客户端：Claude、Gemini 或 Codex
- [Node.js](https://nodejs.org/) 用于 `npx` 和本地 CLI
- 可选：draw.io Desktop，用于 PNG、PDF、JPG 或 embedded SVG 导出
- 可选：next-ai MCP，仅在你需要 Base Skill 浏览器实时精调时才需要

## 安装 Skills

推荐方式：

```bash
npx skills add bahayonghang/drawio-skills
```

安装后重启客户端，让 skills 被重新加载。

手动安装 Academic Overlay 时，必须把 `drawio` 和 `drawio-academic-skills` 并排复制。

## 先理解运行路径

### Offline Authoring Path

这是默认路径，适合大多数 create、edit、validate、replicate、import、export 场景。

- 生成 `.drawio`
- 在 `.drawio-tmp/<name>/` 这类项目工作目录中维护 `.spec.yaml` 和 `.arch.json`
- 每次编辑后重新运行 CLI

### Desktop-Enhanced Export

当安装了 draw.io Desktop 且你需要以下能力时使用：

- PNG、PDF、JPG 导出
- embedded `.drawio.svg`
- 本地桌面预览

### Live Refinement Backend

只有在明确要求 Base Skill 浏览器精修时才使用。

Academic Overlay 不使用 MCP/live backend。

## 第一张 Base 图

### 从自然语言开始

```text
/drawio create 生成一个横向 tech-blue 登录流程图，共 6 个节点
```

### 从 YAML 开始

```yaml
meta:
  theme: tech-blue
  layout: horizontal

nodes:
  - id: start
    label: Start
    type: terminal
  - id: auth
    label: Auth Service
    type: service
  - id: db
    label: PostgreSQL
    type: database

edges:
  - from: start
    to: auth
    type: primary
  - from: auth
    to: db
    type: data
```

渲染命令：

```bash
node skills/drawio/scripts/cli.js input.yaml output.drawio --validate --write-sidecars --sidecar-dir .drawio-tmp/output
```

## 第一张 Academic Figure

```text
/drawio-academic-skills create 生成一个 IEEE paper 的 publication-ready system architecture figure。使用灰度安全样式，交付最终 .drawio + .svg，sidecars 放在工作目录。
```

Overlay 会先做 venue、figure type（`architecture`、`roadmap` 或 `workflow`）、颜色策略、caption/legend、公式保真和导出预期 preflight，然后通过 sibling `../drawio/scripts/cli.js` 执行。

## 第一次编辑

如果图表是由 skill 创建的，优先编辑工作目录中的 sidecar：

1. 修改 `.drawio-tmp/output/output.spec.yaml`
2. 重新生成 `output.drawio`
3. 用 `--write-sidecars --sidecar-dir .drawio-tmp/output` 保持 `.drawio-tmp/output/output.arch.json` 同步

如果你手上只有 `.drawio` 文件，先导入：

```bash
node skills/drawio/scripts/cli.js existing.drawio --input-format drawio --export-spec --write-sidecars --sidecar-dir .drawio-tmp/existing
```

## 第一次导出

生成独立 SVG：

```bash
node skills/drawio/scripts/cli.js input.yaml output.svg --validate --write-sidecars --sidecar-dir .drawio-tmp/output
```

如果需要位图或 PDF，改走 Desktop 路径：

```bash
node skills/drawio/scripts/cli.js input.yaml output.pdf --validate --use-desktop
```

如果 Desktop 不可用，交付 editable `.drawio` + SVG，并可生成 diagrams.net URL：

```bash
node skills/drawio/scripts/runtime/diagrams-net-url.js output.drawio
```

## 下一步

- [安装](./installation.md)
- [工作流概览](./workflows.md)
- [创建图表](./creating-diagrams.md)
- [复刻图表](./scientific-workflows.md)
- [编辑图表](./editing-diagrams.md)
- [设计系统](./design-system.md)
- [规格格式](./specification.md)
- [CLI 工具](./cli.md)
- [导出与保存](./export.md)
