---
layout: home

hero:
  name: "Draw.io Skill"
  text: "适用于 Claude、Gemini 和 Codex"
  tagline: 桌面优先、离线优先的 draw.io 图表工作流，基于 YAML 规格、本地 sidecar、可选浏览器精调，以及论文级校验护栏。
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/getting-started
    - theme: alt
      text: 查看 GitHub
      link: https://github.com/bahayonghang/drawio-skills

features:
  - icon: 🧭
    title: 默认离线优先
    details: "默认本地生成 `.drawio`，并维护 `.spec.yaml` 与 `.arch.json`；只有在确实需要实时浏览器精调时才进入 MCP 路径。"

  - icon: 🖥️
    title: 桌面增强导出
    details: "draw.io Desktop 可用于 PNG、PDF、JPG 和 embedded `.drawio.svg`；独立 SVG 仍可完全离线生成。"

  - icon: 📝
    title: YAML 作为规范源
    details: "自然语言、Mermaid、CSV 和导入的 `.drawio` 都会先归一化为统一 YAML 规格，再进入渲染与校验。"

  - icon: 🚀
    title: 3 条核心路线
    details: "新建图表、编辑现有 bundle、复刻上传图像三条主链路分别对应不同的 reference 与校验规则。"

  - icon: 🎨
    title: 6 个内置主题
    details: "Tech Blue、Academic、Academic Color、Nature、Dark、High Contrast 覆盖工程评审、论文插图、演示和无障碍输出。"

  - icon: 🧮
    title: 学术与公式护栏
    details: "内置 IEEE 风格、MathJax 兼容分隔符、caption/legend 要求与灰度安全约束。"

  - icon: ☁️
    title: 云图标与模板支持
    details: "优先语义形状，需要时再接入 AWS、GCP、Azure、Kubernetes 或网络模板图标。"

  - icon: 🔁
    title: 复刻时保留色彩意图
    details: "`/drawio replicate` 默认保留源图配色，并把提取到的调色板记录进 `meta.replication`，便于后续编辑。"

  - icon: ✅
    title: 先校验再交付
    details: "结构、布局和质量三层校验会在导出前发现规格错误、重叠风险、连线路由问题和 academic profile 缺项。"

  - icon: 🔌
    title: 可选 Live MCP
    details: "next-ai MCP 仍被支持，但它只是浏览器精调增强层，不再是默认主运行时。"
---

## 运行模型

除非你明确需要浏览器会话，否则按这个顺序使用：

1. **离线优先**：本地生成 `.drawio` 并维护 sidecar。
2. **桌面增强**：需要 PNG、PDF、JPG 或 embedded SVG 时再接入 draw.io Desktop。
3. **可选 Live MCP**：只有在需要会话内可视化精修时才启动浏览器。

## 快速开始

安装 skill：

```bash
npx skills add bahayonghang/drawio-skills
```

创建第一张图：

```text
/drawio create 生成一个横向 tech-blue 登录流程图，共 6 个节点
```

在仓库中做本地校验与导出：

```bash
node skills/drawio/scripts/cli.js input.yaml output.drawio --validate --write-sidecars
node skills/drawio/scripts/cli.js input.yaml output.svg --validate --write-sidecars
```

把现有 `.drawio` 导入为离线 bundle：

```bash
node skills/drawio/scripts/cli.js existing.drawio --input-format drawio --export-spec --write-sidecars
```

## 站点内容

- **Guide**：安装、路线、设计系统、YAML 规格、CLI 与导出流程
- **API**：可选 MCP 工具、XML 说明、独立 SVG 转换器
- **Examples**：prompt 示例与 `skills/drawio/references/examples/` 下的 YAML 规格样例

## 事实源

本网站以以下文件为准：

- `skills/drawio/SKILL.md`
- `skills/drawio/references/workflows/*.md`
- `skills/drawio/references/docs/**`

若页面内容与这些文件冲突，以 skill 与 references 为准。
