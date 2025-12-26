# 导出与保存

学习如何保存图表以备将来使用。

## 导出格式

### Drawio 格式 (.drawio)

保留所有编辑功能的原生格式：

> "将图表导出为 user-login-flow.drawio"

这将保存完整的 XML 格式图表，允许你：
- 在 Draw.io 桌面应用中重新打开
- 稍后用 Claude Code 编辑
- 与他人共享

## 使用 Claude 导出

### 基本导出

> "将此图表保存为 my-diagram.drawio"

### 指定位置

> "将图表导出到 ~/Documents/diagrams/architecture.drawio"

### 导出多个图表

> "保存所有打开的图表，使用前缀'project-'"

## 管理导出的文件

### 组织图表

为图表创建结构化目录：

\`\`\`bash
mkdir -p ~/Documents/diagrams/{flowcharts,architecture,ui}
\`\`\`

### 命名约定

使用带有日期的描述性名称：

- `user-auth-flow-2024-01-15.drawio`
- `microservices-architecture-v2.drawio`
- `order-processing-flow.drawio`

## 版本控制

### Git 集成

在 Git 中跟踪图表：

\`\`\`bash
# 将图表添加到仓库
git add diagrams/*.drawio
git commit -m "添加系统架构图"
\`\`\`

### 比较更改

Drawio 文件基于 XML，可进行比较：

\`\`\`bash
git diff diagrams/architecture.drawio
\`\`\`

## 共享图表

### 导出为 PNG

虽然技能主要导出为 .drawio 格式，但你可以使用 Draw.io 桌面应用转换：

1. 在 Draw.io 桌面应用中打开 .drawio 文件
2. 文件 → 导出为 → PNG
3. 根据需要调整质量和大小

### 导出为 PDF

用于文档和演示：

1. 在 Draw.io 桌面应用中打开
2. 文件 → 导出为 → PDF
3. 选择页面大小和方向

## 备份策略

### 本地备份

\`\`\`bash
# 创建定期备份
cp -r ~/Documents/diagrams ~/Backups/diagrams-$(date +%Y%m%d)
\`\`\`

### 云存储

将图表目录同步到：
- Google Drive
- Dropbox
- OneDrive

## 下一步

- 浏览[示例](../examples/)获取灵感
- 了解 [XML 格式](../api/xml-format)
