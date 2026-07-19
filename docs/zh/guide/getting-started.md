# 快速开始

Draw.io Skill 会把自然语言、YAML、Mermaid、CSV 或导入的 `.drawio` 文件归一化为 canonical YAML model，再生成原生可编辑 Draw.io 产物。

## 1. 选择 Skill

- 通用、工程、架构、网络、Agent、UML/ER、流程图、导入和转换任务使用 `drawio`。
- 任何论文、学位论文、期刊、IEEE/ACM、manuscript、camera-ready、Word 或 LaTeX 图使用 `drawio-academic-skills`。

Academic Overlay 依赖 sibling `../drawio` 并使用其 CLI。它不复制 runtime，也不使用 MCP。

## 2. 安装

```bash
npx skills add bahayonghang/drawio-skills
```

安装后重启客户端。手工安装时，`drawio` 与 `drawio-academic-skills` 必须位于同一个 skills 目录。

运行要求：

- YAML/CLI 工作流需要 Node.js 20 或更高版本
- 默认 300 DPI PNG 以及 PDF/JPG/embedded SVG 需要可选 draw.io Desktop
- 只有明确要求 Base Skill 浏览器精修时，才需要可选 live MCP provider

## 3. 创建第一张图

```text
/drawio 创建一张横向登录流程图，包含用户、gateway、认证服务和数据库
```

也可以保存 YAML spec：

```yaml
meta:
  theme: tech-blue
  layout: horizontal

nodes:
  - id: user
    label: User
    type: user
  - id: auth
    label: Auth Service
    type: service
  - id: db
    label: PostgreSQL
    type: database

edges:
  - from: user
    to: auth
    type: primary
  - from: auth
    to: db
    type: data
```

```bash
node skills/drawio/scripts/cli.js input.yaml final/login.drawio --validate --write-sidecars --sidecar-dir .drawio-tmp/login
```

## 4. 搜索精确 Stencil

写入 cloud、Kubernetes、Cisco 或 raw `mxgraph.*` 名称前先搜索：

```bash
node skills/drawio/scripts/cli.js search lambda --prefix aws4
node skills/drawio/scripts/cli.js search pod --prefix kubernetes
```

Covered library 中的未知名称会失败并给出建议。应修正 YAML，不能猜测替代名称。

## 5. 交付最终产物

默认最终产物是可编辑 `.drawio` 和 draw.io Desktop 生成的 300 DPI PNG。Sidecars 放在工作目录。

```bash
node skills/drawio/scripts/cli.js input.yaml final/login.png --validate --use-desktop
```

Desktop 不可用时，图像导出会回退到独立 SVG 并报告回退。只有用户或 venue 明确要求时，才显式生成 SVG、PDF、JPG 或 embedded `.drawio.svg`。

## 6. 创建出版图

```text
/drawio-academic-skills 创建一张灰度安全的 IEEE 架构图，先确认图表方案，再导出投稿 PDF
```

Overlay 会在调用 sibling Base CLI 前预检 venue、图类型、颜色、打印目标、caption/legend、公式保真、节点预算和导出要求。

## 7. 编辑或导入

存在 canonical `.spec.yaml` 时先编辑它，再重新渲染。如果只有 `.drawio`，先导入：

```bash
node skills/drawio/scripts/cli.js existing.drawio --input-format drawio --export-spec --write-sidecars --sidecar-dir .drawio-tmp/existing
```

你也可以直接把声明态配置（Terraform、Kubernetes、Compose、SQL、OpenAPI、CI）或源码（Python、JS/TS、Go、Rust）导入为 canonical 图，对比已保存的 live 快照以查看漂移，或用 postprocess 离线投影/变换一张图。参见[配置](./config-importers.md) / [代码](./code-importers.md)导入器、[运行态漂移](./live-drift.md)与 [Postprocess](./postprocess.md)。

## 下一步

- [工作流](./workflows.md)
- [配置与 IaC 导入器](./config-importers.md)与[代码关系导入器](./code-importers.md)
- [图标与 Stencil 搜索](./icons-stencils.md)
- [设计系统](./design-system.md)
- [学术出版 Overlay](./academic-overlay.md)
- [CLI 参考](./cli.md)
- [导出与产物](./export.md)
