# 实施计划

## Ordered Checklist

1. 建立覆盖基线
   - 列出两个 `SKILL.md` 的公共章节、被路由的 workflow/reference、CLI help 和现有 docs 页面。
   - 形成 Skills-to-Docs 映射，标记 reuse / rewrite / split / add。
   - 验证：所有 PRD Acceptance Criteria 都能落到具体页面或检查。

2. 重构 VitePress 信息架构
   - 更新 `docs/.vitepress/config.ts` 的 English/Chinese nav、sidebar、description 与 2.6.0 footer。
   - 保留 base、locale 与部署相关配置。
   - 验证：所有配置链接都有目标文件，中英文导航集合除 `/zh/` 前缀外同构。

3. 重写入口与核心工作流
   - 同步 English/Chinese 首页、Getting Started、Workflows、Create、Edit/Import、Replicate。
   - 明确 Base/Academic routing、offline-first 与 optional live refinement 边界。
   - 验证：页面覆盖 Base Skill 的 Scope、Runtime、Routing、Rules 和三条工作流。

4. 补齐当前 Base Skill 能力页
   - 重构 CLI、Export、Specification、Design System。
   - 新增必要的 architecture、agent/memory、icon/stencil search、theme/style preset、connector/edge quality 页面及中文镜像。
   - 复用真实 examples/schemas/themes/styles，避免无效命令和 shape 名。
   - 验证：search-first、300 DPI PNG、SVG fallback、sidecar split、strict/validation 在交叉页面中一致。

5. 建立 Academic Overlay 专区
   - 从 overlay `SKILL.md`、publication overlay、figure playbook 和 export checklist 提炼独立双语页面。
   - 覆盖 sibling boundary、preflight、plan gate、privacy-gated preview、academic defaults、vector submission 与 quality gate。
   - 验证：Academic 页面不复制 Base runtime，不把 MCP/image preview 写成强制依赖。

6. 校准 Reference 与 Examples
   - 保留并更新仍有效的 optional MCP、XML、SVG 与 examples 交叉链接。
   - 检查旧页面职责重复、过期版本和旧产物描述。
   - 验证：内部链接和示例命令可解析；旧稳定 URL 尽可能保留。

7. 质量验证与差异审计
   - 使用 `scripts/version-sync.js --version 2.6.0` 同步规范版本面，更新 changelog、footer 与 README 当前版本。
   - 先运行 Markdown lint 和 `npm run docs:build`，修复本任务引入的问题。
   - 运行相关策略测试，再运行 `just ci` 与 `git diff --check`。
   - 对比任务前 dirty paths，确认 `.github/WORKFLOWS.md`、`.github/workflows/build-docs-pr.yml`、`README.md`、`docs/DEPLOYMENT.md` 未被本任务改写。
   - 最后按 PRD 验收矩阵逐项检查 English/Chinese coverage。

## Validation Commands

```powershell
rtk just lint
rtk just version-check
rtk npm run docs:build
rtk node --test tests/visual-verification-policy.test.js tests/drawio-academic-skill.test.js
rtk just ci
rtk git diff --check
rtk git status --short
```

## Risky Files And Rollback Points

- `docs/.vitepress/config.ts`: 导航错误会让整站入口失效；先校验文件存在，再构建。
- `docs/guide/` 与 `docs/zh/guide/`: 批量重写容易产生 parity 漂移；每个页面组同步提交式检查。
- `README.md`: 已有用户改动，只定向更新当前版本文本并保留 badge 删除。
- `docs/DEPLOYMENT.md`: 已有用户改动，明确禁止触碰。
- 不运行 `just format`，避免对用户已改的 `README.md`/`docs/DEPLOYMENT.md` 产生全局格式化改动；仅对本任务文件做定向格式检查。

## Review Gate

实施前由用户确认 `prd.md`、`design.md`、`implement.md`。确认后运行 `task.py start`，再加载 `trellis-before-dev` 并进入 Phase 2。
