# Draw.io Skill for Claude、Gemini 与 Codex

[![Deploy Docs](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs.yml)
[![Deploy Docs (Push)](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs-push.yml/badge.svg)](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs-push.yml)
[![License: ISC](https://img.shields.io/badge/license-ISC-blue.svg)](https://spdx.org/licenses/ISC.html)

> **重要说明**：Draw.io Skill 2.2.0 采用 **桌面优先的混合工作流**。默认路径是通过 `YAML/CLI -> .drawio + sidecars` 在本地生成图表；当需要 PNG、PDF、JPG 或 embedded SVG 时，再由 draw.io Desktop 增强导出。[next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) MCP 服务（`@next-ai-drawio/mcp-server`）现在只是 **可选的浏览器实时编辑层**，不再是硬依赖。

[English](./README.md) | [中文文档](./README_CN.md) | [在线文档](https://bahayonghang.github.io/drawio-skills/zh/)

Draw.io Skill 是一个 YAML-first、离线优先的 draw.io 技能，适合工程架构图、学术插图、网络图和结构化重绘场景。它支持自然语言、YAML、Mermaid、CSV 以及已有 `.drawio` 文件输入，并把这些输入统一归一化成同一套设计系统驱动的工作流。

## 功能特性

- **离线优先产物包**：统一维护 `.drawio`、`.spec.yaml`、`.arch.json`，便于本地重复编辑。
- **桌面感知导出**：有 draw.io Desktop 时，可额外导出 PNG、PDF、JPG 和 embedded `.drawio.svg`。
- **可选浏览器精调**：只有在确实需要实时会话时，才配置 next-ai MCP。
- **3 条核心路线**：`create`、`edit`、`replicate`。
- **6 个内置主题**：`tech-blue`、`academic`、`academic-color`、`nature`、`dark`、`high-contrast`。
- **学术与公式护栏**：支持 IEEE 风格、MathJax 安全分隔符、caption/legend 校验。
- **云图标与模板支持**：AWS、GCP、Azure、Kubernetes 以及网络 / provider icon 工作流。
- **已有图表导入归一化**：通过 `--input-format drawio --export-spec` 把现有 `.drawio` 转成 YAML-first bundle。
- **导出前校验**：结构、布局和质量校验齐全，严格模式适合论文级输出。

## 运行模型

除非用户明确要求浏览器实时编辑，否则按这个顺序使用：

1. **离线优先**：本地生成 `.drawio` 并维护 sidecar。
2. **桌面增强**：draw.io Desktop 可用时，用它处理位图 / PDF 导出和 embedded SVG。
3. **可选 Live MCP**：仅在需要浏览器内精修时启用 next-ai MCP。

## 安装

### 推荐方式

```bash
npx skills add bahayonghang/drawio-skills
```

安装后重启客户端，让 skill 被重新加载。

### 手动安装

1. 克隆仓库。
2. 把 `skills/drawio` 复制到客户端的 skill 目录。

常见路径：

- **Claude**
  - macOS：`~/Library/Application Support/Claude/skills/`
  - Linux：`~/.config/Claude/skills/`
  - Windows：`%APPDATA%\Claude\skills\`
- **Gemini**
  - macOS：`~/Library/Application Support/gemini/skills/`
  - Linux：`~/.gemini/skills/`
  - Windows：`%APPDATA%\gemini\skills\`
- **Codex**
  - macOS / Linux：`~/.codex/skills/`
  - Windows：`%USERPROFILE%\.codex\skills\`

## 可选：配置 Live Editing MCP

日常 create/edit/export **不需要** MCP。只有在你明确要浏览器会话时，才配置 `@next-ai-drawio/mcp-server`。

### Claude / Gemini 的 JSON 配置

macOS / Linux：

```json
{
  "mcpServers": {
    "drawio": {
      "command": "npx",
      "args": ["--yes", "@next-ai-drawio/mcp-server@latest"]
    }
  }
}
```

Windows：

```json
{
  "mcpServers": {
    "drawio": {
      "type": "stdio",
      "command": "cmd",
      "args": ["/c", "npx", "--yes", "@next-ai-drawio/mcp-server@latest"]
    }
  }
}
```

### Codex 的 `config.toml`

macOS / Linux：

```toml
[mcp_servers.drawio]
command = "npx"
args = ["--yes", "@next-ai-drawio/mcp-server@latest"]
```

Windows：

```toml
[mcp_servers.drawio]
type = "stdio"
command = "cmd"
args = ["/c", "npx", "--yes", "@next-ai-drawio/mcp-server@latest"]
```

## 快速开始

创建新图：

```text
/drawio create 生成一个横向 tech-blue 登录流程图，共 6 个节点
```

复刻上传图片：

```text
/drawio replicate
颜色模式：preserve-original
[上传截图]
```

把已有 `.drawio` 导入成离线 bundle：

```bash
node skills/drawio/scripts/cli.js existing.drawio --input-format drawio --export-spec --write-sidecars
```

渲染并校验 bundle：

```bash
node skills/drawio/scripts/cli.js input.yaml output.drawio --validate --write-sidecars
node skills/drawio/scripts/cli.js input.yaml output.svg --validate --write-sidecars
```

论文或正式评审建议开启严格模式：

```bash
node skills/drawio/scripts/cli.js input.yaml output.svg --validate --write-sidecars --strict-warnings
```

当你需要位图或 PDF 时，改走 Desktop 路径：

```bash
node skills/drawio/scripts/cli.js input.yaml output.pdf --validate --use-desktop
node skills/drawio/scripts/cli.js input.yaml output.png --validate --use-desktop
```

## 规范产物三件套

只要图表后续还会继续演化，就尽量把这些文件放在一起：

- `<name>.drawio`
- `<name>.spec.yaml`
- `<name>.arch.json`

这是离线工作流的首选编辑面。

## 文档入口

- [快速开始](https://bahayonghang.github.io/drawio-skills/zh/guide/getting-started)
- [工作流概览](https://bahayonghang.github.io/drawio-skills/zh/guide/workflows)
- [CLI 工具](https://bahayonghang.github.io/drawio-skills/zh/guide/cli)
- [可选 MCP 工具](https://bahayonghang.github.io/drawio-skills/zh/api/mcp-tools)
- [示例](https://bahayonghang.github.io/drawio-skills/zh/examples/)

## 开发与验证

```bash
npm install
npm test
npm run docs:build
```

仓库结构：

- `skills/drawio/`：skill、CLI、references、themes、examples
- `docs/`：VitePress 文档站
- `tests/`：仓库级集成测试

## 与上游项目的关系

本 skill 基于 **[next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io)** 能力构建，但在其上增加了 YAML-first 工作流、离线 sidecar、设计系统 reference，以及分路线的操作指导。

本仓库刻意不把官方 `@drawio/mcp` 作为默认集成面，因为它的工具模型不适合这里的离线优先 edit/replicate 工作流。

## 许可证

当前仓库在 `package.json` 中声明的是 **ISC**。

可选上游 next-ai-draw-io MCP 服务使用的是 **Apache-2.0**：

- <https://github.com/DayuanJiang/next-ai-draw-io/blob/main/LICENSE>
