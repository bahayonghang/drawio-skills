---
layout: home

hero:
  name: "Draw.io Skill"
  text: "Base + Academic Overlay"
  tagline: YAML-first、离线优先的 draw.io 图表工作流，使用共享 base skill、sibling academic overlay、Desktop 增强导出，以及仅 Base 可选的 live refinement。
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/getting-started
    - theme: alt
      text: 查看 GitHub
      link: https://github.com/bahayonghang/drawio-skills

features:
  - icon: 🧭
    title: 共享 Base Skill
    details: "`skills/drawio` 拥有 CLI、schemas、references、themes、examples、style presets、Desktop 辅助、diagrams.net URL fallback 和可选 live refinement。"

  - icon: 🎓
    title: Academic Overlay
    details: "`skills/drawio-academic-skills` 是面向 paper、thesis、IEEE、manuscript、A4/Word/LaTeX 图和出版 bundle 的轻量 sibling overlay。"

  - icon: 📝
    title: YAML 作为规范源
    details: "自然语言、Mermaid、CSV 和导入的 `.drawio` 都会先归一化为统一 YAML 规格，再进入渲染与校验。"

  - icon: 🖥️
    title: Desktop 增强导出
    details: "draw.io Desktop 可用于 PNG、PDF、JPG 和 embedded `.drawio.svg`；独立 SVG 仍可完全离线生成。"

  - icon: 🚀
    title: 3 条核心路线
    details: "新建图表、编辑现有 bundle、复刻上传图像三条主链路分别对应不同的 reference 与校验规则。"

  - icon: 🎨
    title: 共享主题和预设
    details: "6 个内置主题和 bundled style presets 都归 Base 维护，避免 overlay 漂移。"

  - icon: 🧮
    title: 学术与公式护栏
    details: "Overlay 增加 venue preflight、figure taxonomy、caption/legend 校验、公式保真和 paper/A4 可读性规则。"

  - icon: ☁️
    title: 网络与模板工作流
    details: "通过 Base references 建模 campus LAN、AWS VPC、DMZ、UML、ER、sequence、state 和 provider icon 工作流。"

  - icon: 🔁
    title: 复刻时保留色彩与文字位置
    details: "复刻默认保留源图配色，并记录标题、说明、公式和边标签的文本框边界与偏移。"

  - icon: ✅
    title: 先校验再交付
    details: "结构、布局、质量、公式和文字位置校验会在导出前发现问题。"

  - icon: 🔌
    title: 仅 Base 可选 Live Refinement
    details: "next-ai MCP 仍可用于 Base 的浏览器会话，但不是默认运行时，Academic Overlay 不使用它。"
---

## Skill 变体

- `skills/drawio`：Draw.io Base Skill，用于通用图、转换、导入/导出、共享资源、Desktop 导出、diagrams.net fallback 和可选 live refinement。
- `skills/drawio-academic-skills`：Academic Overlay，用于出版场景。它依赖 sibling `../drawio`，不复制 base scripts、themes、schemas 或 official references。

## 运行模型

除非明确需要浏览器会话，否则按这个顺序使用：

1. **Offline Authoring Path**：本地生成最终 `.drawio`，并把 sidecars 维护在项目工作目录。
2. **Desktop-Enhanced Export**：需要 PNG、PDF、JPG 或 embedded SVG 时接入 draw.io Desktop。
3. **Live Refinement Backend**：仅 Base 浏览器精修；离线 bundle 仍是规范源。
4. **Direct XML Exception**：很小的 XML-only 或精确 mxGraph handoff。

Academic Overlay 只使用离线和 Desktop 增强路径。

## 快速开始

安装 skills：

```bash
npx skills add bahayonghang/drawio-skills
```

创建第一张 Base 图：

```text
/drawio create 生成一个横向 tech-blue 登录流程图，共 6 个节点
```

创建 Academic Overlay 图：

```text
/drawio-academic-skills create 生成一个 IEEE 风格 manuscript workflow figure，交付最终 .drawio + .svg，sidecars 放在工作目录
```

在仓库中做本地校验与导出：

```bash
node skills/drawio/scripts/cli.js input.yaml output.drawio --validate --write-sidecars --sidecar-dir .drawio-tmp/output
node skills/drawio/scripts/cli.js input.yaml output.svg --validate --write-sidecars --sidecar-dir .drawio-tmp/output
```

生成 diagrams.net URL fallback：

```bash
node skills/drawio/scripts/runtime/diagrams-net-url.js output.drawio
```

## 站点内容

- **Guide**：安装、路线、设计系统、YAML 规格、CLI 与导出流程
- **API**：仅 Base 可选 MCP 工具、XML 说明、独立 SVG 转换器
- **Examples**：prompt 示例与 `skills/drawio/references/examples/` 下的 YAML 规格样例

## 事实源

本网站以以下文件为准：

- `skills/drawio/SKILL.md`
- `skills/drawio-academic-skills/SKILL.md`
- `skills/drawio/references/workflows/*.md`
- `skills/drawio/references/docs/**`

若页面内容与这些文件冲突，以 skill 与 references 为准。
