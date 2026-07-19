---
layout: home

hero:
  name: "Draw.io Skill"
  text: "YAML 优先的图表工作流与学术出版 Overlay"
  tagline: 通过离线优先的 Base Skill 和 sibling 学术策略层，创建、编辑、复刻、导入、校验和导出原生 draw.io 图表。
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/getting-started
    - theme: alt
      text: 学术图表
      link: /zh/guide/academic-overlay

features:
  - title: 离线 Base Skill
    details: "Base package 负责 YAML、CLI、schemas、themes、examples、搜索、渲染、校验和可选 Desktop 导出。"
  - title: 学术出版 Overlay
    details: "轻量 sibling 层增加 venue、图类型、印刷可读性、隐私、caption、legend、公式和导出质量门。"
  - title: 先搜索，再写 YAML
    details: "离线 catalog 会在图标进入 YAML 前解析真实 AWS、Azure、GCP、Kubernetes、Cisco 和 network stencil 名称。"
  - title: 原生可编辑产物
    details: "最终图使用原生 draw.io 节点、模块、文本和绑定连接线，而不是粘贴整页参考图。"
  - title: 按任务选择设计语言
    details: "架构、Agent 与记忆、网络、UML/ER、流程图、公式和复刻图共享一套 typed design system。"
  - title: 以导出产物为准验证
    details: "先校验模型，再检查导出的 PNG、SVG、PDF 或 Desktop 产物，然后才能报告完成。"
  - title: 离线导入器与适配器
    details: "把声明态 Terraform、Kubernetes、Compose、SQL、OpenAPI、CI 或源码转换为 canonical 图，另有已保存快照的漂移、多页 bundle 与离线 postprocess。无需 provider CLI、Graphviz 或网络。"
---

## 选择正确的 Skill

通用图表、架构、网络拓扑、Agent 与记忆系统、UML/ER、流程图、组织结构图、Mermaid/CSV 转换、现有 `.drawio`、主题和样式预设使用 `skills/drawio`。

论文、学位论文、期刊、IEEE/ACM 投稿、manuscript、camera-ready 包和其他出版图使用 `skills/drawio-academic-skills`。Overlay 依赖 sibling `../drawio`，不复制 Base runtime，也永远不要求 MCP。

## 运行模型

1. **离线编写**：把输入归一化为 YAML，校验后生成原生 `.drawio`。
2. **Desktop 增强交付**：生成默认 300 DPI PNG，或用户要求的 PDF/JPG/embedded SVG。
3. **离线回退**：Desktop 不可用时明确报告，并使用独立 SVG。
4. **可选 Live Refinement**：只有用户明确要求时，Base Skill 才使用浏览器编辑。

`.spec.yaml`、`.arch.json`、归一化 YAML 和诊断信息放在项目工作目录。默认最终交付包含可编辑 `.drawio` 和 300 DPI PNG；Desktop 不可用时以 SVG 回退。

## 快速开始

```bash
npx skills add bahayonghang/drawio-skills
```

```text
/drawio 创建一张横向服务架构图，包含 API、队列、worker 和数据库
```

使用厂商 stencil 前先搜索 bundled catalog：

```bash
node skills/drawio/scripts/cli.js search pod --prefix kubernetes
```

渲染并校验：

```bash
node skills/drawio/scripts/cli.js input.yaml final/diagram.drawio --validate --write-sidecars --sidecar-dir .drawio-tmp/diagram
node skills/drawio/scripts/cli.js input.yaml final/diagram.png --validate --use-desktop
```

出版图使用：

```text
/drawio-academic-skills 创建一张适合 IEEE 投稿的工作流图，保证灰度语义可读，并导出提交用 PDF
```

## 文档地图

- [工作流](./guide/workflows.md)：创建、编辑/导入、复刻和学术路由
- [设计系统](./guide/design-system.md)：规格、类型、主题、图标与连接线
- [架构图](./guide/architecture-diagrams.md)和 [Agent 图](./guide/agent-diagrams.md)
- [配置](./guide/config-importers.md) / [代码](./guide/code-importers.md)导入器、[运行态漂移](./guide/live-drift.md)、[多页](./guide/multi-page.md)与 [Postprocess](./guide/postprocess.md)
- [CLI 参考](./guide/cli.md)和 [导出与产物](./guide/export.md)
- [示例](./examples/index.md)：prompt 与可复用 YAML

## 事实源

公开契约从 `skills/drawio/SKILL.md` 与 `skills/drawio-academic-skills/SKILL.md` 开始，再由它们路由到 workflow 和 reference 文件。站点负责面向用户组织这些契约，但不替代 Skills 真源。
