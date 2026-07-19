# 执行计划：上游整合能力文档同步

顺序分批实施，每批做完即验证。所有新页先建文件、再改 `config.ts`，避免死链。

## 批次 0 — 准备与基线

- [ ] 复读四份 skill 真源：`config-importers.md`、`code-importers.md`、`live-snapshots-drift.md`、`upstream-capability-compatibility.md`，以及 `docs/guide/cli.md` 现状。
- [ ] 记基线：`npm run docs:build` 现状是否通过（保证不是我引入的失败）。
- 验证：build 基线绿。

## 批次 1 — 新建英文专题页（docs/guide + docs/api）

- [ ] `docs/guide/config-importers.md`
- [ ] `docs/guide/code-importers.md`
- [ ] `docs/guide/live-drift.md`
- [ ] `docs/guide/multi-page.md`
- [ ] `docs/guide/postprocess.md`
- [ ] `docs/api/upstream-capability-map.md`
- 验证：`npx markdownlint docs/guide/config-importers.md docs/guide/code-importers.md docs/guide/live-drift.md docs/guide/multi-page.md docs/guide/postprocess.md docs/api/upstream-capability-map.md`（无新失败）。

## 批次 2 — 新建中文镜像页（docs/zh/guide + docs/zh/api）

- [ ] `docs/zh/guide/config-importers.md`
- [ ] `docs/zh/guide/code-importers.md`
- [ ] `docs/zh/guide/live-drift.md`
- [ ] `docs/zh/guide/multi-page.md`
- [ ] `docs/zh/guide/postprocess.md`
- [ ] `docs/zh/api/upstream-capability-map.md`
- 验证：逐页 markdownlint；grep 对照中英 H2 数量一致。

## 批次 3 — 更新导航与首页

- [ ] `docs/.vitepress/config.ts`：EN/ZH sidebar 新增 "Import & Integrate/导入与集成" 组 + Reference 组加 Upstream Capability Map；nav 加 Import/导入；footer `v2.6.0`→`v2.7.0`（保持既有单引号/无分号风格）。
- [ ] `docs/index.md` + `docs/zh/index.md`：加一张 feature 卡片 + 正文点到新能力。
- 验证：`npm run docs:build` 通过、无死链告警。

## 批次 4 — 更新现有 guide 页（中英成对）

- [ ] `docs/guide/cli.md` + `docs/zh/guide/cli.md`：把 "Upstream Capability Promotion" 占位扩为正式内容，补 input-format/多页 flag/postprocess 子命令，链接新页。
- [ ] `docs/guide/workflows.md` + zh：路线概览加新路由。
- [ ] `docs/guide/getting-started.md` + zh：简述 + 链接。
- [ ] `docs/guide/icons-stencils.md` + zh：AI 图标目录 + SysML/BPMN。
- [ ] `docs/guide/scientific-workflows.md` + zh：`--input-format raster-extraction`。
- 验证：逐页 markdownlint；grep 对照中英改动对称。

## 批次 5 — 中英 README

- [ ] `README.md`：Features 补齐 + 新能力段 + Documentation 链接。
- [ ] `README_CN.md`：镜像同上。
- 验证：markdownlint 两个 README；grep 对照小节对称。

## 批次 6 — CHANGELOG（仅根）

- [ ] 仅根 `CHANGELOG.md`：补 2.3.0→2.7.0 里程碑段 + `[Unreleased]` 上游整合段，格式对齐 Keep a Changelog，注明 per-skill 明细以 skill 侧 CHANGELOG 为权威。
- [ ] **不动** `skills/drawio/CHANGELOG.md`、`skills/drawio-academic-skills/CHANGELOG.md`（被 `tests/palette-skill-policy.test.js` pin）。
- 验证：markdownlint 根 CHANGELOG。

## 批次 7 — 全量校验（review gate 前）

- [ ] `npm run docs:build` 全站构建通过。
- [ ] `npx markdownlint` 覆盖全部改动文件（对照 `.markdownlint.json`）。
- [ ] `npm test`（或 `just ci`）兜底：确认未意外触发 `tests/palette-skill-policy.test.js` 等契约断言（本任务不动 skill 侧 CHANGELOG/SKILL，应全绿）。
- [ ] 断链自查：`config.ts` 每个新 link 都对应存在的 `.md`；新页内部相对链接可达。
- [ ] 中英对称自查：`docs/guide` 与 `docs/zh/guide` 新页一一对应；README 中英小节对应。
- [ ] 真源一致自查：postprocess 仅六操作；evidence boundary 表述保留；无 deferred 被写成"已支持"。

## 验证命令速查

```bash
# 站点构建（VitePress）
npm run docs:build

# markdown lint（按仓库 .markdownlint.json）
npx markdownlint README.md README_CN.md CHANGELOG.md "docs/**/*.md"

# 跨契约完整校验（收尾）
just ci
```

## 回滚点

- 每批为独立提交边界；任一批 build/lint 失败即在该批内修复，不进入下一批。
- 未提交前可 `git checkout -- <file>` 丢弃单文件；新页误建可直接删除并回退 `config.ts` 对应条目。
