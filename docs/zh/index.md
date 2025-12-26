---
layout: home

hero:
  name: Draw.io 技能
  text: 为 Claude Code 打造的 AI 图表绘制工具
  tagline: 用自然语言创建专业图表，享受实时浏览器预览
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/getting-started
    - theme: alt
      text: 查看 GitHub
      link: https://github.com/bahayonghang/drawio-skills

features:
  - title: 自然语言转图表
    details: 用中文描述你的需求，即可获得专业图表。
  - title: 实时预览
    details: 在浏览器中即时查看图表的修改效果。
  - title: 多种图表类型
    details: 支持流程图、架构图、序列图等多种图表类型。
  - title: 编辑现有图表
    details: 基于单元格 ID 进行精确的图表编辑。
  - title: 导出与保存
    details: 将作品保存为 .drawio 文件，方便后续编辑。
  - title: MCP 集成
    details: 通过模型上下文协议与 Claude Code 无缝集成。
---

## 快速开始

\`\`\`bash
# 安装技能
git clone https://github.com/bahayonghang/drawio-skills.git ~/.claude/skills/drawio
\`\`\`

安装完成后，直���告诉 Claude：

> "创建一个用户认证流程图"

## 本技能的增强内容

本技能基于强大的 [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) MCP 服务器，提供：

- **工作流指导**：创建和编辑图表的完整流程说明
- **XML 格式参考**：样式属性、常用形状的详细文档
- **图表模式**：流程图和架构图的模板与最佳实践
- **自动 MCP 配置**：通过 `.mcp.json` 自动配置

## 示例图表

### 流程图

告诉 Claude：*"创建一个订单处理流程图"*

### 架构图

告诉 Claude：*"绘制一个三层 Web 应用架构"*

## 致谢

- **MCP 服务器**：[next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) by [@DayuanJiang](https://github.com/DayuanJiang)
- **Draw.io**：[diagrams.net](https://www.diagrams.net/)
