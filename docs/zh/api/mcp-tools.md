# 可选 MCP 工具

这些 MCP 工具用于浏览器内实时编辑。它们**不是** Draw.io Skill 2.2.0 的默认运行时。

只有在以下条件成立时才使用：

- 已配置 next-ai MCP
- 用户明确需要浏览器实时精调

默认工作流仍然是离线优先的 `.drawio` + sidecar 模型。

## `start_session`

打开新的浏览器编辑会话。

### 作用

- 启动内嵌 HTTP 服务
- 在浏览器中打开 draw.io
- 为后续工具调用建立 live session 通道

### 参数

无。

### 说明

- 其他 MCP 图表调用前必须先执行
- 只用于实时精调场景

## `create_new_diagram`

从完整 `mxGraphModel` XML 创建一张新图。

### 参数

| 名称 | 必需 | 说明 |
|------|------|------|
| `xml` | 是 | 完整 `mxGraphModel` XML 字符串 |

### 说明

- 适用于新建或整图替换
- `0` 和 `1` 仍然是保留根节点 ID

## `get_diagram`

从浏览器获取最新图表 XML。

### 为什么重要

在 `edit_diagram` 前必须先执行 `get_diagram`，否则可能覆盖用户在浏览器里手动做过的修改。

## `edit_diagram`

基于 ID 更新、添加或删除 cell。

### 参数

| 名称 | 必需 | 说明 |
|------|------|------|
| `operations` | 是 | `update`、`add`、`delete` 操作数组 |

### 操作结构

| 字段 | 必需 | 说明 |
|------|------|------|
| `operation` | 是 | `update`、`add` 或 `delete` |
| `cell_id` | 是 | update/delete 用现有 ID，add 用新 ID |
| `new_xml` | add/update 时必需 | 完整 `<mxCell>`，包含 `<mxGeometry>` |

## `export_diagram`

把当前 live diagram 导出到磁盘。

### 参数

| 名称 | 必需 | 说明 |
|------|------|------|
| `path` | 是 | 输出路径 |
| `format` | 否 | `drawio`、`png` 或 `svg`；不写时根据扩展名推断 |

## Live 工作流

1. `start_session`
2. `create_new_diagram`
3. `get_diagram`
4. `edit_diagram`
5. `export_diagram`

## 什么时候不要用 MCP

以下情况优先走本地 CLI 与 sidecar bundle：

- 从零创建图表且不需要浏览器
- 需要版本化维护编辑过程
- 需要可重复执行的导出命令
- 运行在 CI 或脚本环境中

## 相关

- [快速开始](../guide/getting-started.md)
- [编辑图表](../guide/editing-diagrams.md)
- [导出与保存](../guide/export.md)
