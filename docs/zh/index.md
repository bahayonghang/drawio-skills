---
layout: home

hero:
  name: "Draw.io 技能"
  text: "Claude Code 专用"
  tagline: AI 驱动的图表创建与编辑，提供实时浏览器预览
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/getting-started
    - theme: alt
      text: 在 GitHub 查看
      link: https://github.com/bahayonghang/drawio-skills

features:
  - icon: 🎨
    title: 自然语言 → 图表
    details: 用自然语言描述需求，即刻获得专业图表。

  - icon: 🔄
    title: 实时预览
    details: 在浏览器中即时查看 Claude 创建的图表更新。

  - icon: 📊
    title: 多种图表类型
    details: 流程图、架构图、序列图、网络图等多种类型。

  - icon: ☁️
    title: 云架构支持
    details: 专门支持 AWS、GCP 和 Azure 官方图标。

  - icon: ✏️
    title: 编辑现有图表
    details: 使用自然语言指令通过 ID 操作修改图表。

  - icon: 💾
    title: 导出与保存
    details: 将图表保存为 .drawio 文件，可在 draw.io 中使用。

  - icon: 🎬
    title: 动画连接器
    details: 在图表元素之间创建动态和动画连接线。

  - icon: 📚
    title: 版本历史
    details: 通过可视化缩略图恢复之前的图表版本。

  - icon: 🚀
    title: 自包含
    details: 嵌入式服务器，无需外部依赖。

  - icon: ∑
    title: 数学公式排版
    details: 支持 LaTeX/AsciiMath 公式（MathJax 渲染），符合 IEEE 等学术期刊发表规范，支持灰度兼容导出。

  - icon: 🧩
    title: A–H 结构化工作流
    details: 抽取严格 A–H 规格，并可转换为基础 draw.io XML 以便稳定渲染。
---

## 快速示例

```
"创建一个用户登录流程图，包含用户名/密码输入、验证和成功/错误路径"
```

Claude 将会：
1. 打开一个带有 draw.io 编辑器的浏览器窗口
2. 根据你的描述生成图表 XML
3. 实时显示图表
4. 允许你用自然语言进行迭代修改

## 什么是 Draw.io 技能？

Draw.io 技能是一个 Claude Code 技能，支持 AI 驱动的图表创建和编辑。它封装了 [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) MCP 服务器，并提供：

- **完整文档**：详细的各类图表创建指南
- **XML 格式参考**：完整的 draw.io XML 格式和样式属性文档
- **图表示例**：流程图、架构图等即用示例
- **MCP 工具参考**：所有可用 MCP 工具的详细文档

## 工作原理

```
Claude Code <--stdio--> MCP Server <--http--> Browser (draw.io)
```

1. 向 Claude 请求创建图表
2. Claude 调用 `start_session` 打开浏览器窗口
3. Claude 生成图表 XML 并发送到浏览器
4. 你可以实时看到图表更新！

## 致谢

- **MCP Server**：[next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) by [@DayuanJiang](https://github.com/DayuanJiang)
- **技能转换**：[skill-seekers](https://github.com/modelcontextprotocol/skill-seekers)
- **Draw.io**：[diagrams.net](https://www.diagrams.net/)
