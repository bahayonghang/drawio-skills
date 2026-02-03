# 快速开始

欢迎使用 Draw.io Skill for Claude Code！

## 什么是 Draw.io 技能？

Draw.io 技能是一个 Claude Code 技能，支持 AI 驱动的图表创建和编辑，提供实时浏览器预览。

## 前置要求

- [Claude Code CLI](https://github.com/anthropics/claude-code)
- [Node.js](https://nodejs.org/)

## 你的第一个图表

```
"创建一个用户登录流程图"
```

Claude 将会：
1. 调用 `start_session` 打开浏览器窗口
2. 生成图表 XML
3. 在浏览器中实时显示图表
4. 允许你用自然语言进行修改

## 示例 Prompt

### 流程图

```
"创建一个用户注册流程图，包含邮箱验证步骤"
```

### AWS 架构图

```
"生成一个 AWS 架构图，包含 Lambda、API Gateway、DynamoDB 和 S3，
用于无服务器 REST API。使用 AWS 官方图标。"
```

### 时序图

```
"创建一个 OAuth 2.0 授权码流程的时序图，
包含用户、客户端应用、授权服务器和资源服务器"
```

### IEEE 论文数学公式图

```
"创建一个 IEEE 风格的神经网络架构图：
1) 输入层：\(x \in \mathbb{R}^{H \times W \times C}\)
2) 卷积层：\(f = \sigma(W * x + b)\)
3) 全连接层：\(y = \text{softmax}(Wh + b)\)
使用灰度兼容样式。添加标题：Fig. 1. CNN 架构。"
```

## 下一步

- [安装指南](./installation.md) - 详细安装说明
- [工作流概览](./workflows.md) - 3 个工作流概述
- [创建图表](./creating-diagrams.md) - `/drawio create` 工作流
- [复刻图表](./scientific-workflows.md) - `/drawio replicate` 工作流
- [编辑图表](./editing-diagrams.md) - `/drawio edit` 工作流
- [设计系统](./design-system.md) - 主题、形状、连接器
- [规格格式](./specification.md) - YAML 规格参考
- [数学公式排版](./math-typesetting.md) - LaTeX/AsciiMath 公式
- [导出与保存](./export.md) - 保存图表

## 获取帮助

如果遇到问题：

1. 查看 [安装指南](./installation.md) 中的故障排除部分
2. 参考 [API 文档](/zh/api/mcp-tools.md)
3. 查看 [示例](/zh/examples/) 获取灵感
4. 在 [GitHub](https://github.com/bahayonghang/drawio-skills/issues) 提交 issue
