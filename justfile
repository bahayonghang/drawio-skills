# Draw.io 技能项目 Justfile
# 运行 `just` 或 `just help` 查看可用命令

# Windows does not always have a POSIX `sh`; keep Just recipes runnable there.
set windows-shell := ["powershell.exe", "-NoLogo", "-NoProfile", "-Command"]

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
    @echo "  just test           - 运行测试用例"
    @echo "  just version-check  - 检查版本号是否已同步（不修改文件）"
    @echo "  just version-sync   - 同步版本号（默认以 package.json 为准）"
    @echo "  just version-sync-to <v> - 同步版本号到指定版本号（例如 2.3.0）"
    @echo "  just ci             - 运行 CI 检查（version-sync + version-check + lint + test + docs-build）"
    @echo ""
    @echo "📁 实用工具："
    @echo "  just zip            - 将两个 skill 分别打包到项目根目录"
    @echo "  just clean-zip      - 清理项目根目录下的 skill 压缩包"
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

# 将两个 skill 分别打包到项目根目录（内容以 git 跟踪文件为准，防止本地临时文件泄漏进发布包）
[script('python')]
zip:
    import subprocess
    import zipfile
    from pathlib import Path, PurePosixPath

    # 这些路径不应出现在发布包中；若被 git 误跟踪，打包立即失败
    FORBIDDEN_PARTS = ('.drawio-tmp', '.playwright-mcp', 'logs', '.DS_Store', '.last_update')
    FORBIDDEN_PREFIXES = ('docs/superpowers',)

    for skill_name in ('drawio', 'drawio-academic-skills'):
        listing = subprocess.run(
            ['git', 'ls-files', '--', f'skills/{skill_name}'],
            capture_output=True,
            text=True,
            check=True,
        )
        # 假设：清单中没有含换行的文件名（当前仓库成立）
        tracked = [line for line in listing.stdout.splitlines() if line]
        arcnames = [p[len('skills/'):] for p in tracked]

        if f'{skill_name}/SKILL.md' not in arcnames:
            raise SystemExit(f'{skill_name}: git ls-files 清单为空或缺少 SKILL.md')

        leaked = [
            arc
            for arc in arcnames
            if any(part in PurePosixPath(arc).parts for part in FORBIDDEN_PARTS)
            or any(arc.startswith(f'{skill_name}/{prefix}') for prefix in FORBIDDEN_PREFIXES)
        ]
        if leaked:
            raise SystemExit(f'{skill_name}: 发布包禁止包含: {leaked}')

        archive_path = Path(f'{skill_name}.zip').resolve()
        with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED) as zf:
            for src, arc in zip(tracked, arcnames):
                zf.write(src, arc)

        with zipfile.ZipFile(archive_path) as zf:
            if sorted(zf.namelist()) != sorted(arcnames):
                raise SystemExit(f'{skill_name}: zip 内容与 git 跟踪清单不一致')

        print(f'Created {archive_path}')

# 清理项目根目录下的 skill 压缩包
[script('python')]
clean-zip:
    from pathlib import Path

    for archive_name in ('drawio.zip', 'drawio-academic-skills.zip'):
        archive_path = Path(archive_name)
        if archive_path.exists():
            archive_path.unlink()
            print(f'Removed {archive_path}')
        else:
            print(f'Not found: {archive_path}')

# 显示项目目录结构
tree:
    @echo "📁 项目目录结构："
    @tree -L 3 -I 'node_modules|.git|dist|cache' .

# 检查 Markdown 文件（需要 markdownlint-cli）
lint:
    @echo "🔍 正在检查 Markdown 文件..."
    npx markdownlint-cli "docs/**/*.md" "skills/**/*.md" "README*.md" --ignore "skills/drawio/references/official/**" --ignore "skills/drawio/references/upstream/**" --ignore "skills/drawio/scripts/vendor/**"

# 格式化 Markdown 文件（需要 prettier）
format:
    @echo "✨ 正在格式化 Markdown 文件..."
    npx prettier --write "docs/**/*.md" "skills/**/*.md" "README*.md"

# 运行测试用例
test:
    @echo "🧪 正在运行测试..."
    npm test

# 运行所有 CI 检查和测试
version-check:
    @echo "🔎 正在检查版本号同步状态..."
    node scripts/version-sync.js --check

version-sync:
    @echo "🔁 正在同步版本号（以 package.json 为准）..."
    node scripts/version-sync.js

version-sync-to VERSION:
    @echo "🔁 正在同步版本号到 {{VERSION}}..."
    node scripts/version-sync.js --version {{VERSION}}

ci: version-sync version-check lint test docs-build
