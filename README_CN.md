# Draw.io Skill for Claude、Gemini 与 Codex

[![Deploy Docs](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs.yml)
[![Deploy Docs (Push)](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs-push.yml/badge.svg)](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs-push.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://spdx.org/licenses/MIT.html)

> **重要说明**：Draw.io Skill 2.2.0 是 **YAML-first、离线优先的 Base 工作流**。默认路径是 `YAML/CLI -> .drawio + sidecars` 本地生成；需要 PNG、PDF、JPG 或 embedded SVG 时再由 draw.io Desktop 增强导出。[next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) MCP 服务（`@next-ai-drawio/mcp-server`）只作为 Base Skill 的可选浏览器精修层，不是硬依赖。

[English](./README.md) | [中文文档](./README_CN.md) | [在线文档](https://bahayonghang.github.io/drawio-skills/zh/)

Draw.io Skill 是一个 YAML-first 的 draw.io 图表系统，覆盖工程图、网络拓扑、结构化重绘、Mermaid/CSV 转换和已有 `.drawio` 导入。论文或出版场景由 Academic Overlay 处理；它依赖 sibling Base，而不是复制一份底层 runtime。

## Skill 变体

- `skills/drawio`：**Draw.io Base Skill**。拥有共享 CLI、schemas、references、themes、examples、style presets、Desktop 导出辅助、diagrams.net URL fallback 和可选 live refinement backend。
- `skills/drawio-academic-skills`：**Academic Overlay**。只保留学术策略、README、evals 和出版专属 references；执行时依赖 sibling `../drawio`，并且不需要 MCP/live backend。

源码结构刻意只维护一份底层能力。后续如果需要独立 academic 安装包，可以由 packaging workflow 生成；本仓库源码模型是 base + overlay。

## 功能特性

- **YAML-first 产物包**：统一维护 `.drawio`、`.spec.yaml`、`.arch.json`，便于本地重复编辑。
- **桌面感知导出**：有 draw.io Desktop 时，可额外导出 PNG、PDF、JPG 和 embedded `.drawio.svg`。
- **可选浏览器精修**：只在 Base Skill 需要浏览器精修时配置 next-ai MCP；Academic Overlay 保持离线。
- **3 条核心路线**：`create`、`edit`、`replicate`。
- **7 个内置主题**：`tech-blue`、`academic`、`academic-color`、`nature`、`dark`、`arch-dark`、`high-contrast`。其中 `arch-dark` 为架构图设计语言主题，改编自 architecture-diagram-generator（MIT，Cocoon AI）。
- **15 组内置配色**：学术、工程与通用配色可独立叠加到主题，并携带色盲安全、灰度安全、类别容量与来源元数据。
- **Academic Overlay 策略**：venue/audience preflight、caption/legend 校验、公式保真、A4/Word/LaTeX 预期和 figure typing。
- **学术图类型分流**：出版请求先归类成 `architecture`、`roadmap` 或 `workflow`，再决定布局与导出。
- **云图标与模板支持**：AWS、GCP、Azure、Kubernetes 以及网络 / provider icon 工作流由 Base references 提供。
- **内嵌 AI、品牌与 Lucide 图标**：309 个授权离线 `lobe.*` / `ai.*` AI/LLM logo，非 AI 品牌可用 `brand.redis`，常用语义节点用精选 `lucide.*`；运行时不需要网络。SysML（`mxgraph.sysml.*`）与 BPMN（`mxgraph.bpmn.*`）基名也可搜索。
- **网络拓扑支持**：支持 `router`、`switch`、`firewall`、`server`、`load_balancer`、`subnet`、`internet`、`ap` 等语义节点，以及基于接口/IP/VLAN/带宽元数据自动生成链路标签。
- **离线配置与 IaC 导入**：把声明态 Terraform、Kubernetes、Compose、SQL DDL、OpenAPI、GitHub Actions 或 GitLab CI 转成 canonical 图——无需 provider CLI、Graphviz 或网络。
- **代码关系导入**：从本地项目目录渲染 Python、JavaScript/TypeScript、Go 或 Rust 的 module/class 关系。
- **运行态快照与漂移**：投影已保存的 Terraform state、Docker inspect 或 Kubernetes live JSON，并对比声明态与 live 投影以渲染架构漂移。
- **多页 bundle 与 postprocess**：以稳定 page/object 身份编写 canonical bundle v1，并用 `mermaid`、`explain`、`relabel`、`restyle`、`heatmap` 或无脚本 `html` 离线投影/变换图。
- **已有图表导入归一化**：通过 `--input-format drawio --export-spec` 把已有 `.drawio` 转成 YAML-first bundle（多页加 `--all-pages`）。
- **导出前校验**：结构、布局、质量、公式和复刻文字位置校验齐全。

## 运行模型

除非用户明确需要浏览器会话，否则按这个顺序使用：

1. **Offline Authoring Path**：本地生成 `.drawio` 并维护 sidecars。
2. **Desktop-Enhanced Export**：需要位图/PDF 或 embedded SVG 时使用 draw.io Desktop。
3. **Live Refinement Backend**：仅 Base Skill 可选浏览器精修；离线 bundle 仍是规范源。
4. **Direct XML Exception**：只在很小的 XML handoff 或精确 mxGraph 控制时使用。

Academic Overlay 只使用前两条路径。它不创建、不要求、不路由 `.mcp.json`、MCP 或 live backend。

## 安装

### 推荐方式

```bash
npx skills add bahayonghang/drawio-skills
```

安装后重启客户端，让 skill 被重新加载。

### 手动安装

1. 克隆仓库。
2. 默认把 `skills/drawio` 复制到客户端 skill 目录。
3. 如果需要论文/出版工作流，也把 `skills/drawio-academic-skills` 复制到 `drawio` 旁边，这样 overlay 可以解析 sibling `../drawio`。

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

日常 create/edit/export **不需要** MCP。只有在 Base Skill 需要浏览器精修时，才配置 `@next-ai-drawio/mcp-server`。

Academic Overlay 不需要这一步。

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

创建带结构化元数据的网络拓扑图：

```text
/drawio create 生成一个 tech-blue 网络拓扑图，包含防火墙、核心交换机、两台应用服务器和私有数据库子网，并在链路上标注接口与 VLAN
```

使用 Academic Overlay 创建出版图：

```text
/drawio-academic-skills create 生成一个 IEEE 风格 manuscript workflow figure，交付 .drawio + .spec.yaml + .arch.json + .svg
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

混合使用云厂商、Lobe、品牌和 Lucide 图标：

```yaml
nodes:
  - id: lambda
    label: AWS Lambda
    icon: aws.lambda
  - id: openai
    label: OpenAI document understanding
    icon: lobe.openai
  - id: claude
    label: Claude reasoning
    icon: ai.anthropic
  - id: redis
    label: Redis cache
    icon: brand.redis
  - id: cache
    label: Cache fallback
    icon: lucide.database-zap
  - id: ops
    label: Server operations
    icon: lucide.server-cog
```

常用 `lobe.*` / `ai.*` 图标（如 OpenAI、Claude、Gemini）会以内嵌标准化 SVG
渲染，保证离线稳定导出；不支持的 Lobe 名称会触发 shape 校验告警，不会生成
远程图片链接。`brand.*` 用于内置的非 AI 品牌 fallback；精选 `lucide.*` 集合
以内嵌 data URI SVG 渲染，不应当作官方品牌 logo 使用。支持的示例包括
`lucide.alarm-clock`、`lucide.server-cog`、`lucide.workflow`。
Lobe 与 Lucide 的归属和许可证文件随 `skills/drawio/assets/licenses/` 分发。

Academic Overlay 仍然调用 sibling Base CLI：

```bash
node skills/drawio/scripts/cli.js skills/drawio-academic-skills/references/examples/system-architecture-paper.yaml academic-system.svg --validate --write-sidecars --strict-warnings
```

当你需要位图或 PDF 时，改走 Desktop 路径：

```bash
node skills/drawio/scripts/cli.js input.yaml output.pdf --validate --use-desktop
node skills/drawio/scripts/cli.js input.yaml output.png --validate --use-desktop
```

从 `.drawio` 生成 diagrams.net URL fallback：

```bash
node skills/drawio/scripts/runtime/diagrams-net-url.js output.drawio
```

## 规范产物包

只要图表后续还会继续演化，就尽量把这些文件放在一起：

- `<name>.drawio`
- `<name>.spec.yaml`
- `<name>.arch.json`

Academic Overlay 默认还会交付独立 SVG：

- `<name>.svg`

PNG/PDF/JPG 是 Desktop-enhanced 可选产物；如果 draw.io Desktop 不可用，必须如实说明未生成。

## 网络拓扑编写

当前网络拓扑工作流支持：

- `router`、`switch`、`firewall`、`server`、`load_balancer`、`subnet`、`internet`、`ap` 等语义节点类型
- `srcInterface`、`dstInterface`、`ip`、`vlan`、`bandwidth`、`linkType` 等链路元数据字段
- `hierarchical`、`star`、`mesh` 三种拓扑布局意图
- 通过显式 `icon` 或 `network.vendor + network.device` 进行厂商图标映射

代表性 YAML 示例位于 `skills/drawio/references/examples/`。

直接渲染其中一个：

```bash
node skills/drawio/scripts/cli.js skills/drawio/references/examples/vendor-device-mapping.yaml output.drawio --validate --write-sidecars
```

## 离线导入器与适配器

在 `create` / `edit` / `replicate` 之外，离线 base 在同一 canonical 边界之后推广了一批上游能力。每个 route 都先把输入归一化为 canonical YAML 或多页 bundle v1，再进入校验、JavaScript ELK 布局与 renderer——不需要 provider CLI、Graphviz、网络、Desktop、browser、MCP 或 model。optional parser 与 export 会准确报告缺失依赖或 fallback。

| Route | 输入 | `--input-format` / 命令 |
| --- | --- | --- |
| `config-import` | Terraform、Kubernetes、Compose、SQL DDL、OpenAPI、GitHub Actions、GitLab CI | `terraform` / `kubernetes` / `compose` / `sql` / `openapi` / `github-actions` / `gitlab-ci` |
| `code-import` | 本地 Python、JS/TS、Go、Rust 项目目录 | `python-imports` / `python-classes` / `js-imports` / `go-imports` / `rust-imports` |
| `live-drift` | 已保存的 Terraform state、Docker inspect、Kubernetes live JSON | 快照适配器 + `compareGraphProjections` |
| `multi-page` | canonical bundle v1 | `--input-format drawio --all-pages --export-spec` |
| `raster-replicate` | 可信结构化视觉抽取 | `raster-extraction` |
| `postprocess` | canonical YAML / `.drawio` | `postprocess mermaid\|explain\|relabel\|restyle\|heatmap\|html` |

交付的 postprocess 操作恰好为 `mermaid`、`explain`、`relabel`、`restyle`、`heatmap` 与无脚本 `html`；runbook、动画 SVG、tube/sequence layout、compression、buildup、PPTX、timelapse 与 PR diff 均为 defer，并非隐藏命令。确定性路径是命令证据；Desktop、provider、browser/MCP 与视觉模型运行在未执行时仍报告为 missing evidence。完整的上游任务到能力映射见 `skills/drawio/references/docs/upstream-capability-compatibility.md`。

## 文档入口

- [快速开始](https://bahayonghang.github.io/drawio-skills/zh/guide/getting-started)
- [工作流概览](https://bahayonghang.github.io/drawio-skills/zh/guide/workflows)
- [配置与 IaC 导入器](https://bahayonghang.github.io/drawio-skills/zh/guide/config-importers)
- [代码关系导入器](https://bahayonghang.github.io/drawio-skills/zh/guide/code-importers)
- [运行态快照与漂移](https://bahayonghang.github.io/drawio-skills/zh/guide/live-drift)
- [多页 Bundle](https://bahayonghang.github.io/drawio-skills/zh/guide/multi-page)
- [Postprocess 套件](https://bahayonghang.github.io/drawio-skills/zh/guide/postprocess)
- [上游能力映射](https://bahayonghang.github.io/drawio-skills/zh/api/upstream-capability-map)
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

- `skills/drawio/`：base skill、CLI、references、themes、schemas、examples、style presets
- `skills/drawio-academic-skills/`：academic overlay、README、evals、publication references
- `docs/`：VitePress 文档站
- `tests/`：仓库级集成测试

## 与上游项目的关系

本仓库基于 draw.io 与可选的 **[next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io)** MCP 服务构建，但共享能力被封装为 YAML-first workflow、离线 sidecars、设计系统 references 和路线化指导。

本仓库刻意不把官方 `@drawio/mcp` 作为默认集成面，因为它的工具模型不适合这里的离线优先 edit/replicate 工作流。

## 许可证

本仓库使用 **MIT** 许可证（详见 `LICENSE`）。

可选上游 next-ai-draw-io MCP 服务使用的是 **Apache-2.0**：

- <https://github.com/DayuanJiang/next-ai-draw-io/blob/main/LICENSE>
