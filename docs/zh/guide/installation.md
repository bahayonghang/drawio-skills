# 安装

先安装 Draw.io Base Skill。只有需要出版级默认策略时，才把 Academic Overlay 放在旁边。只有需要 Base Skill 浏览器会话时，才额外配置 live-edit MCP。

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

这会把仓库 skill set 安装到当前客户端集成对应的技能目录。

## Skill 变体

- `skills/drawio`：Draw.io Base Skill，用于通用图、网络拓扑、结构化重绘、导入/导出、共享 styles 和可选 live refinement。
- `skills/drawio-academic-skills`：Academic Overlay，用于论文图优先场景。它依赖 sibling `../drawio`；不包含复制的 base runtime，也不需要 MCP。

## 手动安装

### 1. 克隆仓库

```bash
git clone https://github.com/bahayonghang/drawio-skills.git
cd drawio-skills
```

### 2. 把 skill 目录复制到客户端 skill 目录

默认复制 `skills/drawio`。

如果需要学术论文默认策略，请把两个目录并排复制：

```text
skills/
├── drawio/
└── drawio-academic-skills/
```

Overlay 运行时会解析 `../drawio/scripts/cli.js`、`../drawio/references/`、`../drawio/assets/themes/` 和 `../drawio/styles/built-in/`。

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

日常 create/edit/export **不需要** MCP。只有在你想使用 Base Skill live browser refinement 时，才需要配置 `@next-ai-drawio/mcp-server`。

Academic Overlay 不需要 MCP，也不应路由到 live backend。

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

### 验证 Base Skill 能被调用

在客户端里试一个简单请求：

```text
/drawio create 生成一个 high-contrast 4 节点流程图
```

### 验证 Academic Overlay 能被调用

```text
/drawio-academic-skills create 生成一个灰度安全的 IEEE 4 阶段 workflow figure
```

如果 overlay 报告缺少 `../drawio`，请把 base skill 复制到它旁边。

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

这是默认行为。浏览器会话只会在配置了可选 MCP 并明确使用 Base Skill live refinement 时发生。

### Academic Overlay 找不到 `../drawio`

把 `skills/drawio` 安装到 `skills/drawio-academic-skills` 旁边。源码树里的 overlay 不是独立复制包。

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
