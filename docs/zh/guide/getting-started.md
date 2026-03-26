# 快速开始

Draw.io Skill 是一个桌面优先、离线优先的 draw.io 图表工作流，支持从自然语言、YAML、Mermaid、CSV 或导入的 `.drawio` 文件生成专业图表。

## 你需要准备什么

- 任一受支持客户端：Claude、Gemini 或 Codex
- [Node.js](https://nodejs.org/) 用于 `npx` 和本地 CLI
- 可选：draw.io Desktop，用于 PNG、PDF、JPG 或 embedded SVG 导出
- 可选：next-ai MCP，仅在你需要浏览器实时精调时才需要

## 安装 Skill

推荐方式：

```bash
npx skills add bahayonghang/drawio-skills
```

安装后重启客户端，让 skill 被重新加载。

具体客户端路径和可选 MCP 配置见 [安装](./installation.md)。

## 先理解运行路径

### 离线优先

这是默认路径，适合大多数 create、edit、validate、export 场景。

- 生成 `.drawio`
- 维护 `.spec.yaml` 和 `.arch.json`
- 每次编辑后重新运行 CLI

### 桌面增强

当安装了 draw.io Desktop 且你需要以下能力时使用：

- PNG、PDF、JPG 导出
- embedded `.drawio.svg`
- 本地桌面预览

### 可选 Live MCP

只有在你明确要浏览器内实时编辑时才使用。

- 配置 `@next-ai-drawio/mcp-server`
- 用 `start_session` 打开会话
- 修改前先 `get_diagram`

## 第一张图

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
node skills/drawio/scripts/cli.js input.yaml output.drawio --validate --write-sidecars
```

## 第一次编辑

如果图表是由 skill 创建的，优先编辑 sidecar bundle：

1. 修改 `output.spec.yaml`
2. 重新生成 `output.drawio`
3. 用 `--write-sidecars` 保持 `output.arch.json` 同步

如果你手上只有 `.drawio` 文件，先导入：

```bash
node skills/drawio/scripts/cli.js existing.drawio --input-format drawio --export-spec --write-sidecars
```

## 第一次导出

生成独立 SVG：

```bash
node skills/drawio/scripts/cli.js input.yaml output.svg --validate --write-sidecars
```

如果需要位图或 PDF，改走 Desktop 路径：

```bash
node skills/drawio/scripts/cli.js input.yaml output.pdf --validate --use-desktop
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
