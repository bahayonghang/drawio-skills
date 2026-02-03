# 编辑图表 (`/drawio edit`)

学习如何修改现有图表，同时保持设计系统一致性。

## 快速开始

```
/drawio edit
将 "User Service" 改为 "Auth Service"
```

切换主题：

```
/drawio edit with dark theme
转换为演示模式
```

## 概述

`/drawio edit` 工作流允许你：

1. **自然语言**：用文字描述修改
2. **主题切换**：更改整个图表的主题
3. **语义类型变更**：更新节点类型以获得不同形状
4. **基于 ID 的操作**：直接修改特定元素

## 设计系统保持

### 主题一致性

编辑时，设计系统会被保持：

| 编辑类型 | 主题行为 |
|----------|----------|
| 添加节点 | 使用当前主题的节点样式 |
| 添加边 | 使用当前主题的连接器样式 |
| 修改样式 | 建议主题兼容的颜色 |
| 切换主题 | 重新应用新主题的所有样式 |
| 移动节点 | 对齐到 8px 网格 |

### 主题切换

更改整个图表的主题：

```
/drawio edit with academic theme
转换为 IEEE 风格以便投稿
```

```
/drawio edit with dark theme
转换为演示模式
```

### 语义类型变更

更改节点的语义类型以更新其形状：

```
/drawio edit
将 "API" 节点从 service 类型改为 database 类型
→ 形状从圆角矩形变为圆柱体
→ 颜色更新以匹配类型
```

### 连接器类型变更

```
/drawio edit
将 API 到 DB 的连接改为数据流
→ 线条变为虚线
→ 箭头样式更新
```

## 常见编辑方式

### 自然语言编辑

```
/drawio edit
将 "处理" 节点的标签改为 "验证输入"
```

### 基于 ID 的操作

```
/drawio edit
更新 cell 2：标签改为 "新标签"，颜色改为蓝色
```

## 批量操作

```
/drawio edit
1. 将 "Service A" 改为 "User Service"
2. 将其类型改为 database
3. 添加新的 "Cache" 节点（service 类型）
4. 用数据流连接 Cache 到 Database
5. 应用 academic 主题
```

Claude 会将这些合并为高效的 `edit_diagram` 调用。

## 结构重组

对于重大变更，使用 restructure 配合规格格式：

```
/drawio edit with restructure and academic theme

meta:
  theme: academic
  layout: vertical

modules:
  - id: input
    label: 输入层
  - id: process
    label: 处理层
  - id: output
    label: 输出层
```

## 最佳实践

1. **保持主题** - 不要混合不同主题的样式
2. **使用语义类型** - 让设计系统选择形状
3. **清晰引用** - 使用准确的标签或位置
4. **批量相关变更** - 比多次调用更高效
5. **使用网格对齐** - 保持专业的 8px 网格布局
6. **有意切换主题** - 主题切换会重新样式化所有内容

## 故障排除

### "找不到 Cell"
- 标签可能已更改
- 调用 `get_diagram` 查看当前状态
- 使用准确的标签文本

### 编辑后样式看起来不对
- 验证主题是否一致
- 检查类型是否意外更改
- 如果样式混乱，重新应用主题

### 新元素与现有元素不匹配
- 为新节点指定语义类型
- 为新边指定连接器类型
- 如果不一致，考虑切换主题

### 网格对齐偏移
- 使用布局操作重新对齐
- 将位置对齐到 8px 网格
- 如果拥挤，增加间距

## 下一步

- [创建图表](./creating-diagrams.md) - `/drawio create` 工作流
- [复刻图表](./scientific-workflows.md) - `/drawio replicate` 工作流
- [设计系统](./design-system.md) - 主题、形状、连接器参考
- [规格格式](./specification.md) - YAML 规格参考
- [导出与保存](./export.md) - 保存图表
- [MCP 工具](/zh/api/mcp-tools.md) - 了解 edit_diagram 工具
