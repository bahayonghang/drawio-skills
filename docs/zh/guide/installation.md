# 安装

## 前置要求

- 已安装 Node.js（用于 `npx`）

## 安装方法

```bash
git clone https://github.com/bahayonghang/drawio-skills.git ~/.claude/skills/drawio
```

## 验证安装

```bash
ls ~/.claude/skills/drawio
```

## MCP Server 配置

默认配置如下（避免 npx 首次安装交互，并固定版本以保证可复现）：

```json
{
  "mcpServers": {
    "drawio": {
      "command": "npx",
      "args": ["--yes", "@next-ai-drawio/mcp-server@latest"]
    }
  }
}
```

如遇到 “MCP server not found” 之类错误，可先检查包是否可解析：

```bash
npm view @next-ai-drawio/mcp-server version
```

## 下一步

- [快速开始](./getting-started.md)
- [创建图表](./creating-diagrams.md)
