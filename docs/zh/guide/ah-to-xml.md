# A–H 转 draw.io XML（确定性起步稿）

本页介绍一种“确定性”的工作流：把严格的 A–H 规格转换成一份基础 draw.io XML，用于降低纯 LLM 直接写 XML 带来的波动。

## 你会得到什么

- 一份基础 draw.io XML，包含：
  - 模块容器
  - 每个模块内的堆叠节点
  - 正交连线（当 A–H 的线型包含“虚线”时，会生成虚线连接）
- 更安全的标签处理：
  - 拒绝 HTML 标签
  - 拒绝不成对的数学分隔符
  - 对 XML 属性字符自动转义

## 实现位置（仓库内）

- `skills/drawio/src/dsl/ah-to-drawio.js`

## 推荐流程

1. 先用 [科研工作流](./scientific-workflows.md) 生成严格 A–H。
2. 用 `ahToDrawioXml` 将 A–H 转成 XML。
3. 通过 MCP 创建与微调：
   - `start_session`
   - `create_new_diagram`
   - `edit_diagram`（配合 [样式预设](./style-presets.md) 快速统一风格）
4. 用 `export_diagram` 导出 `.drawio`。

