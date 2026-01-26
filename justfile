# Draw.io 技能项目 Justfile
# 运行 `just` 或 `just help` 查看可用命令

# 默认命令（直接输入 `just` 时执行）
default:
    @just --list

# 显示帮助信息和命令说明
help:
    @echo "📚 Draw.io 技能项目 - 可用命令"
    @echo ""
    @echo "🚀 快速开始："
    @echo "  just start          - 安装依赖并启动开发服务器"
    @echo "  just docs           - 启动文档开发服务器"
    @echo ""
    @echo "📖 文档相关："
    @echo "  just docs           - 启动 VitePress 开发服务器（热重载）"
    @echo "  just docs-build     - 构建生产环境静态文档"
    @echo "  just docs-preview   - 本地预览生产构建"
    @echo ""
    @echo "🔧 开发工具："
    @echo "  just install        - 安装 npm 依赖"
    @echo "  just clean          - 清理构建产物和 node_modules"
    @echo "  just rebuild        - 完整重建（清理 + 安装 + 构建）"
    @echo ""
    @echo "✨ 代码质量："
    @echo "  just lint           - 检查 Markdown 文件（需要 markdownlint-cli）"
    @echo "  just format         - 格式化 Markdown 文件（需要 prettier）"
    @echo ""
    @echo "📁 实用工具："
    @echo "  just tree           - 显示项目目录结构"
    @echo "  just help           - 显示此帮助信息"
    @echo ""
    @echo "💡 提示：运行 'just --list' 查看简洁命令列表"

# 文档相关命令

# 启动文档开发服务器
docs:
    @echo "🚀 正在启动文档开发服务器..."
    npm run docs:dev

# 构建生产环境文档
docs-build:
    @echo "📦 正在构建文档..."
    npm run docs:build

# 预览生产环境文档构建
docs-preview:
    @echo "👀 正在预览生产环境文档构建..."
    npm run docs:preview

# 安装依赖
install:
    @echo "📥 正在安装依赖..."
    npm install

# 清理所有构建产物
clean:
    @echo "🧹 正在清理构建产物..."
    rm -rf docs/.vitepress/dist
    rm -rf docs/.vitepress/cache
    rm -rf node_modules

# 快速启动文档（安装 + 开发）
start: install docs

# 完整重建文档（清理 + 安装 + 构建）
rebuild: clean install docs-build

# 显示项目目录结构
tree:
    @echo "📁 项目目录结构："
    @tree -L 3 -I 'node_modules|.git|dist|cache' .

# 检查 Markdown 文件（需要 markdownlint-cli）
lint:
    @echo "🔍 正在检查 Markdown 文件..."
    markdownlint docs/**/*.md skills/**/*.md README*.md

# 格式化 Markdown 文件（需要 prettier）
format:
    @echo "✨ 正在格式化 Markdown 文件..."
    prettier --write "docs/**/*.md" "skills/**/*.md" "README*.md"
