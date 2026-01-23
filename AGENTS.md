# Repository Guidelines

## 项目结构与模块组织
本仓库是 drawio 技能与文档集合，核心内容集中在文档与 skill 说明。主要目录：
- `skills/drawio/`：技能本体（`SKILL.md`、`.mcp.json`、`references/`、`scripts/`）。
- `docs/`：VitePress 文档站（中英文指南与 API 说明）。
- `examples/`、`imgs/`：示例与配图资源。
- `.github/workflows/`：文档构建与部署流水线。

## 构建、测试与开发命令
优先使用 npm 脚本或 justfile：
- `npm run docs:dev`：启动 VitePress 开发服务器。
- `npm run docs:build`：构建静态文档。
- `npm run docs:preview`：预览构建产物。
- `just docs` / `just docs-build` / `just docs-preview`：上述命令的快捷入口。
- `just install`：安装依赖。
- `just clean`：清理 `docs/.vitepress` 与 `node_modules`。

## 编码风格与命名规范
当前以文档为主，遵循简洁、结构清晰的 Markdown 风格：
- 文档路径建议采用 `docs/guide/...`、`docs/api/...` 的分层方式。
- 文件命名偏向短横线或小写英文（如 `getting-started.md`）。
- 可选工具：`just lint`（markdownlint）与 `just format`（prettier）。

## 测试指南
本仓库暂无自动化测试框架。变更文档后建议本地预览：
- `npm run docs:dev` 或 `just docs`，手动检查链接与图像。

## 提交与 PR 规范
Git 历史以 Conventional Commits 为主，常见格式：
- `type: message`，如 `docs: 更新 README`、`feat(examples): 添加示例`。
- 可包含 emoji 前缀（如 `✨ feat(...)`、`📝 docs:`、`🔧 chore:`）。
PR 建议包含：变更说明、关联 issue（若有）、影响范围，以及文档截图或链接（若涉及展示）。

## 额外说明
若涉及方案、计划或规格变更，请先参考 `openspec/AGENTS.md` 的流程与模板要求，确保变更记录可追踪喵～
