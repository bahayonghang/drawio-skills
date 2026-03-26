# 安装

先安装 Draw.io Skill 本体。只有在你明确需要浏览器实时编辑时，才额外配置 live-edit MCP。

## 前置要求

- 已安装带 `npx` 的 [Node.js](https://nodejs.org/)
- 任一受支持客户端：
  - Claude
  - Gemini
  - Codex

先确认 Node 环境：

```bash
node --version
npx --version
```

## 推荐安装方式

```bash
npx skills add bahayonghang/drawio-skills
```

这会把 skill 安装到当前客户端集成对应的技能目录。

## 手动安装

### 1. 克隆仓库

```bash
git clone https://github.com/bahayonghang/drawio-skills.git
cd drawio-skills
```

### 2. 把 `skills/drawio` 复制到客户端 skill 目录

#### Claude

- macOS：`~/Library/Application Support/Claude/skills/`
- Linux：`~/.config/Claude/skills/`
- Windows：`%APPDATA%\Claude\skills\`

#### Gemini

- macOS：`~/Library/Application Support/gemini/skills/`
- Linux：`~/.gemini/skills/`
- Windows：`%APPDATA%\gemini\skills\`

#### Codex

- macOS / Linux：`~/.codex/skills/`
- Windows：`%USERPROFILE%\.codex\skills\`

复制完成后重启客户端。

## 可选：配置 Live Editing MCP

日常 create/edit/export **不需要** MCP。只有在你想用浏览器进行实时精调时，才需要配置 `@next-ai-drawio/mcp-server`。

### Claude / Gemini 的 JSON 配置

macOS / Linux：

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

Windows：

```json
{
  "mcpServers": {
    "drawio": {
      "type": "stdio",
      "command": "cmd",
      "args": ["/c", "npx", "--yes", "@next-ai-drawio/mcp-server@latest"]
    }
  }
}
```

### Codex 的 `config.toml`

macOS / Linux：

```toml
[mcp_servers.drawio]
command = "npx"
args = ["--yes", "@next-ai-drawio/mcp-server@latest"]
```

Windows：

```toml
[mcp_servers.drawio]
type = "stdio"
command = "cmd"
args = ["/c", "npx", "--yes", "@next-ai-drawio/mcp-server@latest"]
```

## 可选：配置 Desktop 导出能力

如果你需要以下能力，再安装 draw.io Desktop：

- `.png`、`.pdf`、`.jpg` 导出
- embedded `.drawio.svg`
- 本地桌面预览

独立 SVG 不依赖 draw.io Desktop。

## 验证安装

### 验证 skill 能被调用

在客户端里试一个简单请求：

```text
/drawio create 生成一个 high-contrast 4 节点流程图
```

### 验证本地 CLI

```bash
node skills/drawio/scripts/cli.js skills/drawio/references/examples/login-flow.yaml --validate
```

### 验证可选 MCP 是否可解析

```bash
npm view @next-ai-drawio/mcp-server version
```

## 故障排除

### skill 能用，但没有自动打开浏览器

这是默认行为。默认运行时就是离线优先；只有配置了可选 MCP 并明确走 live editing 才会打开浏览器。

### 出现 `No active session`

说明你在没有 live session 的情况下调用了 MCP 工具。先执行 `start_session`，或改回离线 bundle 工作流。

### Desktop 导出失败

先改用独立 SVG，或者先安装 draw.io Desktop 再使用 `--use-desktop`。

### Windows 上 MCP 启动失败

按上面的例子使用 `cmd /c` 包装 `npx`。Windows 的 MCP 传输层通常不能稳定直接启动 `npx`。

## 下一步

- [快速开始](./getting-started.md)
- [工作流概览](./workflows.md)
- [CLI 工具](./cli.md)
- [可选 MCP 工具](/zh/api/mcp-tools.md)
