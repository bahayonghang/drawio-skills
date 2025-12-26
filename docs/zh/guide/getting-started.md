# 快速开始

欢迎使用 Draw.io Skill for Claude Code！本指南将帮助你快速上手。

## 前置要求

- [Claude Code](https://claude.ai/code) 已安装
- [Draw.io 桌面应用](https://www.diagrams.net/) 已安装（用于实时预览）
- Git 已安装

## 安装技能

### 从 GitHub 安装

\`\`\`bash
# 将本仓库克隆到 Claude Code 技能目录
git clone https://github.com/bahayonghang/drawio-skills.git ~/.claude/skills/drawio
\`\`\`

安装完成后，重启 Claude Code，技能将自动加载。

## 验证安装

在 Claude Code 中，尝试以下对话：

> 你：帮我画一个简单的流程图，包含开始、处理和结束三个步骤

如果技能安装成功，Claude 将会：
1. 打开 Draw.io 桌面应用并创建会话
2. 生成包含三个节点的流程图
3. 在浏览器中实时显示结果

## 你的第一个图表

让我们创建一个简单的用户登录流程图：

### 步骤 1：描述需求

在 Claude Code 中输入：

> "创建一个用户登录流程图，包含以下步骤：
> - 输入用户名和密码
> - 验证凭据
> - 登录成功或失败"

### 步骤 2：查看结果

Claude 将会：
1. 分析你的需求
2. 生成 Draw.io XML 格式的图表
3. 打开浏览器预览
4. 显示生成的流程图

### 步骤 3：迭代优化

你可以继续告诉 Claude：

> "给登录失败的节点添加红色背景"
> "在验证步骤前添加一个'检查账号是否存在'的判断"

## 下一步

- 阅读[创建图表](./creating-diagrams)了解更多图表类型
- 查看[API 参考](../api/mcp-tools)了解可用的 MCP 工具
- 浏览[示例](../examples/)获取更多灵感

## 常见问题

### Q: Draw.io 桌面应用没有自动打开？

A: 确保 Draw.io 桌面应用已正确安装，并且可以从命令行启动。

### Q: 图表没有在浏览器中显示？

A: 检查浏览器控制台是否有错误信息，确保 MCP 服务器正常运行。

### Q: 如何保存我的图表？

A: 阅读[导出与保存](./export)章节了解如何保存为 `.drawio` 文件。
