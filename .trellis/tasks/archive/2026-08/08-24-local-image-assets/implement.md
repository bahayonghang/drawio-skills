# 实施计划：本地图片资产能力

## 前置门

- [x] 用户已授权创建任务并进入规划（2026-08-24）。
- [x] 规划已经过一轮独立复核并按 12 条 findings 修订（2026-08-24）。
- [x] 规划复核通过后再 `task.py start`；本文件的执行清单在 `in_progress` 之前不动工。
- [x] 记录 `git status --short --branch`。工作区已有 19 个任务外 dirty 路径（`.trellis/` 模板更新与 `.gitattributes`），不得回退也不得纳入本任务提交。工作分支 `dev`。

## 0. 先例核验与基线（design.md §12）

- [x] 核实 draw.io 原生嵌入图片的样式键与 data URI 形态。
- [x] 核实 `UserObject` 自定义属性在 draw.io 编辑保存后的保留行为——这是 §7.1 载体选择的前提，推翻则走样式串自定义键回退方案。
- [x] 核实 draw.io 对 data URI SVG 的处理模式与外部资源行为，验证或推翻 SVG 推迟决定。
- [x] 结论写 `research/drawio-native-image-format.md`，未能核实项标注 `missing evidence`。
- [x] 运行根 `npm test` 记录绿基线；确认 `just ci` 可用并注意其首步 `version-sync` 是写操作。
- [x] 建立 `research/policy-assertion-map.md`：列出四个策略测试对两个 `SKILL.md` 与 CHANGELOG 的全部字面量、结构正则、邻近窗口断言，以及 overlay `references/` 白名单当前文件清单。

## 1. 所有权链打通（design.md §2 · 最高风险）

- [x] `document-spec.js:193` `normalizeDocumentSpec` legacy 分支携带 `assets`。
- [x] `document-spec.js:169` `validateDocumentSpec` legacy 分支携带 `assets` 传入 `validateSpec`。
- [x] `document-spec.js:37` `pageSpec` 携带 `assets`。
- [x] `postprocess/input.js:13` 同名 `pageSpec` 与重封装路径携带 `assets`。
- [x] **首环锁：** 新增单元测试直接断言 `parseDocumentYaml(text).spec.assets` 非空（AC1）。
- [x] 确认 `serializeSpecYaml`（`runtime/artifacts.js:121`）为 `yaml.dump` 直通，导出侧无需改动。

## 2. Schema 与校验

- [x] `assets/schemas/spec.schema.json`：顶层 `assets`（key 受 ID 正则约束）与 `node.image`；`node.icon` 与 `node.image` 互斥用 `not`/`required` 组合表达。
- [x] `validateSpec`：asset id 规则、`path` 必填、`sha256` 形态、四个审计字段类型校验、`node.image` 引用存在性、`icon`/`image` 互斥硬错误。
- [x] 确认 `VALID_ICON`（`:3367`）与 `KNOWN_NODE_STYLE_KEYS`（`:2322`）未被修改。

## 3. 路径解析与安全（design.md §4–§5）

- [x] 新建 `scripts/dsl/asset-resolver.js`，实现八步解析顺序，只用 `node:fs` / `node:path` / `node:crypto`。
- [x] 路径一律相对 asset root；asset root 默认 `process.cwd()`。
- [x] 类型判定只接受 PNG（`89 50 4E 47 0D 0A 1A 0A`）与 JPEG（`FF D8 FF`）；SVG 显式拒绝并提示 v1 不支持。
- [x] `asset-resolver.test.js` 覆盖 AC5 全部矩阵条目，临时目录构造，不落盘到 `skills/`。Windows 符号链接用例在权限不足时标注 `missing evidence`，不改断言使其虚假通过。

## 4. 渲染接入

- [x] `spec-to-drawio.js:1090` 附近：`node.image` 分支优先，命中后复用现有 image-icon 样式拼装代码。
- [x] `validateShapeReferences`（`:2208`）对 `node.image` 节点跳过。
- [x] `cli.js`：新增 `--asset-root <dir>`、`--extract-assets <dir>`（均加入 `flagsWithValues`）、help 文本；stdin 输入含 `assets` 时报错。
- [x] 按 `semantic-types.md` 的 grep 配方实测确认不需要改动任何 `assets/themes/*.json`。

## 5. 体积护栏（design.md §9）

- [x] 用 `info` / `warning` / `error` 三级诊断词汇实现；单位 MiB；口径为引用次数加权的源字节总和，base64 前统计。
- [x] 单 asset > 2 MiB → `warning`；单 asset > 8 MiB → `error`；加权总量 > 24 MiB → `error`。
- [x] 错误信息含 asset id、实际字节数，以及指向 §11 配方文档的路径。
- [x] 边界用例：三个阈值各取恰好值与 +1 B 两侧，断言诊断级别与 strict / 非 strict 下的退出码（AC7）。

## 6. 往返与外来图片（design.md §7）

- [x] `assetCell` 包装：`UserObject` 携带六个字段（`dataAssetId` / `dataAssetPath` / `dataAssetSha256` / `dataAssetRasterReason` / `dataAssetAtomic` / `dataAssetReconstructable` / `dataAssetDecomposition`），label 移到 `UserObject@label`、`mxCell@value` 置空。
- [x] `drawio-to-spec.js`：UserObject 解包；`shape=image` 分支在 `inferIconFromStyle`（`:182`）之前短路。
- [x] 多引用一致性校验：取首次出现，其余不一致为硬错误（AC4）。
- [x] 外来裸 `shape=image`：无 `--extract-assets` 时报错且消息含该 flag；提供时解码落盘、生成 `path`、sha256 前缀去重（AC8）。
- [x] 往返用例：六字段逐一相等；`path` 字符串与输入完全一致；`--sidecar-dir` 重定向输出后 `path` 不变；`academic-paper` profile 往返后再次 strict 渲染通过（AC3）。

## 7. postprocess 与多页（design.md §8）

- [x] `relabel` / `restyle` / `heatmap` 往返保留 `assets` 与 `node.image`，各一条用例（AC12）。
- [x] `mermaid` / `explain` / `html` 的图片降级行为实测，结果写入文档并各一条断言。不预先假设 `html` 能嵌入。
- [x] `document-spec.js`：bundle 中顶层或页内出现 `assets` 时抛 `MULTI_PAGE_INVALID`，字段路径与迁移提示齐全（AC11）。用例入 `multi-page.test.js`。

## 8. academic 审计门

- [x] `validateAcademicProfile`：`academic-paper` 下校验 `raster_reason` 非空、`atomic_raster_unit === true`、`contains_reconstructable_content === false`。
- [x] 用例覆盖门在 `academic-paper` 下生效、在 `default` 下不生效（AC10）。
- [x] overlay 侧只加文档与 eval，不复制运行时代码。

## 9. 回归与安装边界

- [x] `references/examples/*.yaml` 全部重跑 `--validate`。
- [x] 整页栅格化用例与 `raster-extraction` 未变用例确认仍通过（AC9）。
- [x] 安装边界用例（AC13）：复制 `skills/drawio` 到临时目录、清空各大小写形式 `NODE_PATH`、在仓库外渲染含图片的 YAML，沿用 `tests/skill-installation.test.js` 手法。
- [x] 根 `npm test` 全绿。

## 10. 文档、版本与 eval（design.md §13）

- [x] 新建 `.trellis/spec/drawio-skill/local-image-assets.md`，在 `index.md` 表格登记。
- [x] 新增素材预处理配方参考文档：长边推导式、两类质量约束表、Pillow 预检与配方、审计要求。写明 Windows 上 `convert` 不是 ImageMagick。确认文档路径与护栏错误信息中的路径一致。优先放 base `references/` 以避开 overlay 白名单断言；若必须放 overlay，同步更新 `tests/drawio-academic-skill.test.js`。
- [x] 两个 `SKILL.md` 按断言映射增补能力说明，contract 字面量逐字不变；每改一个文件立即跑根 `npm test`。
- [x] `docs/`、根 `README.md` / `README_CN.md` / `CHANGELOG.md` 同步；skill 侧 `CHANGELOG.md` 只增节不改 `## 2.7.0` 段落。
- [x] 版本 minor，按 design.md §13 的六项完整清单同步。决定 `skills/drawio-academic-skills/evals/evals.json` 是手工同步还是扩展 `version-sync.js`（二选一并在 CHANGELOG 说明）。
- [x] `markdownlint` 与 `npm run docs:build` 通过。
- [x] eval 证据（AC16）：在两个 `evals.json` 新增本能力具名 case（prompt + 逐条断言）；运行后逐断言明细存 `research/eval-local-image-assets.md`；`darwin-results.tsv` 追加分数行。环境无法验证的断言排除出分母并在 `note` 中列名。产物写仓库根 `.drawio-tmp/`。
- [x] `just ci` 全绿；注意首步 `version-sync` 是写操作，运行后 `git status --short` 不得出现规划外 diff（AC14）。

## 11. 驱动场景冒烟（design.md §11 · AC17 / AC18）

**本节对 thesis 仓库严格只读。** 不创建、修改、删除该仓库任何文件，不改其任务 artifacts，不提交。产物写本仓库 `.drawio-tmp/asset-smoke/`。

- [x] Pillow 可用性预检；不可用则如实记 `missing evidence` 并停止本节。
- [ ] 按配方压缩 thesis 全部 11 张素材到 `.drawio-tmp/asset-smoke/materials-render/`，源文件只读打开。
- [ ] 记录每张图 before/after 尺寸、字节、`src_sha256` / `dst_sha256` 与总量对比。
- [ ] 自动断言部分（RGBA、长边、字节下降、双端 sha256）写成脚本断言并保存输出。
- [ ] 人工判定部分（透明边缘无白边、无锯齿振铃）单列记录，注明查看器、查看倍率、判定人，不与自动断言混记。据此决定 §11.1「低于 1.5 会软边」是否写入文档。
- [ ] **完整规模冒烟（AC18）**：构造 11 条注册表、13 个图片对象（含 `烟囱` 二次引用）、全中文路径的 YAML，渲染 + 往返 + strict 校验通过；记录压缩前后的护栏诊断变化。
- [x] 与 §1 的最小集成冒烟分别命名，不相互替代。
- [x] 证据写 `research/thesis-smoke.md`：命令、退出码、压缩对照表、护栏诊断、往返 diff 结论。
- [x] 收尾核对 thesis 仓库 `git status --short` 无本任务引入的改动。

## 12. 收尾

- [x] `just zip` 前确认新增文件已被 `git ls-files` 收录；核对 zip namelist 与清单一致，随后 `just clean-zip`。
- [x] `task.py validate`、`git diff --check`、`git status --short`、任务范围 diff 审计。
- [ ] 由 `trellis-check` 独立复核规划、实现、测试、文档与 dirty-state。

## 验证命令

```bash
# 单元与集成
node --test skills/drawio/scripts/dsl/
npm test

# 能力冒烟（从仓库根运行，asset root 即 cwd）
node skills/drawio/scripts/cli.js .drawio-tmp/asset-smoke/in.yaml .drawio-tmp/asset-smoke/out.drawio \
  --validate --strict-warnings --write-sidecars --sidecar-dir .drawio-tmp/asset-smoke

# 往返（含输出目录重定向，验证 path 不变）
node skills/drawio/scripts/cli.js .drawio-tmp/asset-smoke/out.drawio .drawio-tmp/asset-smoke/rt.spec.yaml \
  --input-format drawio --export-spec

# 外来图片提取
node skills/drawio/scripts/cli.js foreign.drawio out.spec.yaml \
  --input-format drawio --export-spec --extract-assets .drawio-tmp/asset-smoke/extracted

# 全量（注意首步 version-sync 会写文件）
just ci
```

## 回滚点

- §1–§8 全部是新增分支与新增文件，任一步失败可单独 `git checkout --` 对应文件回退，无数据迁移。
- §1 的所有权链改动触及四个共享归一化函数，是回归面最广的一步。改完立即跑 `node --test skills/drawio/scripts/dsl/` 与 `multi-page.test.js`、postprocess 测试，失败即回退该步而非继续叠加。
- §10 的 `SKILL.md` 改动风险次高（四个测试的字面量/邻近窗口/白名单断言）。每改一个文件立即跑根 `npm test`，失败即回退该文件。
- 若 §0 核验推翻 `UserObject` 属性保留假设，改用样式串自定义键承载六个字段，并同步修订 design.md §7.1。
- 若 `just ci` 的 `version-sync` 产生规划外 diff，说明版本面未同步完整，回到 §10 补齐而非提交该 diff。
- 任务外的 19 个 dirty 路径全程不动。
