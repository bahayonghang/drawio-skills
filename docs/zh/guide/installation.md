# 安装指南

本指南将详细介绍如何安装和配置 Draw.io Skill。

## 系统要求

### 必需软件

- **Node.js**: v18 或更高版本
- **Claude Code**: 最新版本
- **Draw.io 桌面应用**: 用于实时预览
- **Git**: 用于克隆仓库

### 检查环境

\`\`\`bash
# 检查 Node.js 版本
node -v

# 检查 Git 版本
git -v

# 检查 Claude Code
claude -v
\`\`\`

## 安装步骤

### 方法 1：从 GitHub 安装（推荐）

\`\`\`bash
# 克隆仓库到 Claude Code 技能目录
git clone https://github.com/bahayonghang/drawio-skills.git ~/.claude/skills/drawio
\`\`\`

### 方法 2：手动下载

1. 访问 [GitHub Releases](https://github.com/bahayonghang/drawio-skills/releases)
2. 下载最新版本的压缩包
3. 解压到 `~/.claude/skills/drawio`

## 配置

### MCP 服务器配置

技能包已包含预配置的 `.mcp.json` 文件，通常无��额外配置。

如果你的 Draw.io 桌面应用安装在非标准位置，可以修改配置：

\`\`\`json
{
  "mcpServers": {
    "drawio": {
      "command": "npx",
      "args": ["-y", "@next-ai-drawio/mcp-server"],
      "env": {
        "DRAWIO_DESKTOP_PATH": "/path/to/your/drawio"
      }
    }
  }
}
\`\`\`

### 验证配置

启动 Claude Code 并测试：

> "测试 drawio 技能"

如果配置正确，Claude 将会确认技能已加载。

## 升级

\`\`\`bash
cd ~/.claude/skills/drawio
git pull origin main
\`\`\`

## 卸载

\`\`\`bash
# 删除技能目录
rm -rf ~/.claude/skills/drawio
\`\`\`

## 故障排除

### 问题 1：技能未加载

**症状**: Claude Code 无法识别 drawio 技能

**解决方案**:
1. 确认目录路径正确：`~/.claude/skills/drawio`
2. 检查 `drawio/SKILL.md` 文件是否存在
3. 重启 Claude Code

### 问题 2：MCP 服务器启动失败

**症状**: 无法连接到 Draw.io MCP 服务器

**解决方案**:
1. 确认网络连接正常
2. 手动安装 MCP 服务器：`npm install -g @next-ai-drawio/mcp-server`
3. 检查防火墙设置

### 问题 3：Draw.io 桌面应用无法启动

**症状**: 浏览器预览打开，但 Draw.io 应用未启动

**解决方案**:
1. 确认 Draw.io 桌面应用已正确安装
2. 检查应用路径配置
3. 尝试手动启动 Draw.io 桌面应用

## 下一步

安装完成后，查看[快速开始](./getting-started)创建你的第一个图表！
