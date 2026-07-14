# catalog-search 集成 review 修复（k8s导入回归/别名/基线测试/排序）

来源：`07-14-drawio-ai-kit-integration`（已归档）集成 review 的 4 条[建议修改]发现（2026-07-14，Claude 审查）。轻量任务，PRD-only，inline 实施。

## Goal

修复 drawio-ai-kit 集成实施中发现的 4 个质量缺口：k8s 导入路径回归、k8s 自然词别名缺失、示例零误杀基线无自动化护栏、search 排序精确匹配失效。

## Requirements

### R1 k8s 导入路径回归修复（review 发现 1）

- `dsl/drawio-to-spec.js` 的 `inferIconFromStyle`（:179 一带）只取 `shape` 值，`shape=mxgraph.kubernetes.icon2;prIcon=pod` 被反推成 `k8s.icon2`，重生成时被默认拒绝（`prIcon=icon2` 不在 39 个合法值内）。
- 修复：当 `shape === 'mxgraph.kubernetes.icon2'` 且存在 `prIcon` 时返回 `k8s.<prIcon>`。其他家族（aws4.productIcon 等）本任务不动（维持既有行为）。

### R2 k8s 自然词别名（review 发现 2，design §8 承诺未交付项）

- `dsl/icon-mappings.js` 的 `ICON_ALIASES` 补一组精选 k8s 别名，映射到真实 prIcon 缩写值：deployment→deploy、service→svc、ingress→ing、statefulset→sts、daemonset→ds、replicaset→rs、namespace→ns、configmap→cm、serviceaccount→sa、endpoint→ep、scheduler→sched、volume→vol。
- 别名遵循既有语义：`ICON_ALIASES` 自动纠错优先于报错（`k8s.deployment` 直接生成有效样式，不报错）。
- search 侧同步可发现：`dsl/catalog-search.js` 把 `ICON_ALIASES` 键作为同义词附着到对应目录条目（如 `search deployment --prefix kubernetes` 能返回 `k8s.deploy`）。

### R3 示例零误杀基线自动化（review 发现 3）

- 新增 `dsl/examples-baseline.test.js`：遍历 `references/examples/*.yaml` 与 `drawio-academic-skills` 的 templates/examples，默认模式（非 strict、silent）经 `parseSpecYaml` + `specToDrawioXml` 全部零抛错、产出非空 XML；断言覆盖数下限（≥20）防目录移动后空转。
- 经根 `npm test`（run-tests.js 自动发现 skills/ 下 `*.test.js`）进入 CI。

### R4 search 排序与建议范围（review 发现 4 + 发现 2 的建议侧）

- `dsl/catalog-search.js` 打分器：新增"最后一段精确匹配"档（如 `search s3` 时 `mxgraph.aws4.s3` 的 `s3` 段精确命中，得分介于全名精确与子串之间）；同分 tie-break 优先有 spec 写法的条目（可用条目排前）。
- `spec-to-drawio.js` 的 `validateShapeReferences` 建议查询按未知名的 mxgraph 库前缀过滤（`k8s.podd` 只在 kubernetes 内查建议，消除跨库噪音）；参数化未知名以参数值为查询词；非 mxgraph 未知名维持现状（全局查询）。

## Acceptance Criteria

- [x] round-trip：`k8s.pod` YAML → `.drawio` → CLI 反向转换出的 spec 中 `icon: k8s.pod`（非 `k8s.icon2`），再生成成功零 error。（实测：`--input-format drawio --write-sidecars` 导入后 sidecar 为 `icon: k8s.pod`，regen exit 0 且含 `prIcon=pod;aspect=fixed`；另有单测 `imports kubernetes icon2 compound styles back` 钉住）
- [x] `icon: k8s.deployment` 默认模式直接生成 `prIcon=deploy` 样式，零 error；`search deployment --prefix kubernetes` 返回含 `k8s.deploy` 的结果。（实测均通过）
- [x] `search s3` 首位为 `mxgraph.aws4.s3`（spec: aws.s3）；`search pod --prefix kubernetes` 行为不回退。（实测 + catalog-search.test.js 断言）
- [x] `k8s.podd` 的报错建议仅含 kubernetes 库条目（含 `k8s.pod`），无 aws/mscae 跨库噪音。（实测：建议恰为 `k8s.pod` 一条）
- [x] 新基线测试纳入根测试并通过；29 个示例/模板零误杀维持。（examples-baseline.test.js 经 run-tests.js 自动发现，checked=29≥20）
- [x] 既有测试零回退：根 `npm test` / `just ci` 全绿（418 pass / 0 fail，较修复前 +5 条新测试；just ci exit 0）。

## Constraints

- `.js` 编辑经 Bash 写入（PostToolUse prettier hook 规避，memory `drawio-skills-format-hook-conflicts`）。
- 不改 SKILL.md（含 frontmatter）与 reference 文档措辞（本任务纯代码+测试）。
- 不引入新依赖；目录数据文件（shape-catalog.json.gz / shape-index.json.gz）不动。
- review 发现 5-10（PRD 口径偏差说明、家族条目提示、groupCenter 家族、归档记录回填、文档小口径、提交拆分）不在本任务范围。
