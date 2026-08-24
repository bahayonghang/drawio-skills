# 为 draw.io skill 增加本地图片资产能力

## Goal

让 canonical YAML 能把项目本地图片文件作为原子图片节点嵌入，并保持 `.drawio` 往返无损。目标是打通「YAML 修正 → 重新生成 → 重新导出」的复核闭环：当图中含有无法用原生图形重建的复杂设备图时，图片必须随规范一起重生成，而不是每轮手工重插。

本任务只做 base skill 的中性能力与 academic overlay 的审计门，不做像素处理，不引入新运行时依赖。

## Problem Evidence

驱动场景是论文任务 `thesis/.trellis/tasks/08-24-recreate-chapter2-fig2-1`：11 张透明背景工业设备 PNG（共 15,045,957 B = 14.349 MiB）需要作为 13 个原子图片对象嵌入，其余全部内容（设备名称、X1–X33 测点、图例、连接线）保持原生可编辑。该任务在 `offline-image-capability-evidence.md` 中记录了 5 条官方路径探针，全部失败。逐条定位到本仓库代码：

1. **`style.shape` / `style.image` 被忽略** — `spec-to-drawio.js:2322` 的 `KNOWN_NODE_STYLE_KEYS` 不含这两个键。
2. **`icon` 填本地路径被拒** — `spec-to-drawio.js:3367` 与 `assets/schemas/spec.schema.json:287` 的 `^[a-zA-Z][a-zA-Z0-9._-]*$`。该正则是注入防线，`tests/security.test.js:49`/`:126` pin 住，不放宽。
3. **`icon` 填自定义名报空框** — `spec-to-drawio.js:2208` `validateShapeReferences`。
4. **`raster-extraction` 拒绝 `image` 字段** — `.trellis/spec/drawio-skill/raster-replicate-adapter.md` 明文合同，属既定边界。
5. **`.drawio` import 往返丢图** — `drawio-to-spec.js:182` `inferIconFromStyle` 无 `shape=image` 分支。

渲染管线本身不缺能力：`icon-resolver.js:9` 已定义 `IMAGE_ICON_STYLE_PREFIX`，内置图标均走「data URI → `shape=image`」；`spec-to-drawio.js:1090` 是唯一接入点。`spec-to-drawio.js:3507` `collectFullPageImageErrors` 已是整页栅格化硬错误。

### 规划复核期间新增的证据（2026-08-24）

6. **顶层字段会在到达 renderer 前被剥离。** `cli.js:333` 对所有 YAML 输入调用 `parseDocumentYaml`；`normalizeDocumentSpec` 的 legacy 分支重建 `{ meta, nodes, edges, modules }`（`document-spec.js:193`），`validateDocumentSpec`（`:169`）与 `pageSpec`（`:37`）同样只保留这四个键。`postprocess/input.js:13` 有第四份同形状的 `pageSpec`。因此新增顶层 `assets` 若不同时改这四处，会在解析阶段静默消失。
7. **`--strict` 把所有非 `info` 诊断当失败**（`spec-to-drawio.js:3049`）。护栏阈值必须用仓库既有的 `info` / `warning` / `error` 三级词汇表达，不能用「warning / strict-error」两栏描述。
8. **`--export-spec` 的输出目录可被 `--sidecar-dir` 重定向**（`cli.js:505`）。任何「相对规范文件」的路径约定都会随输出位置改变语义。
9. **版本同步面比预期宽。** `version-sync.js` 同时改 `package.json`、`package-lock.json`、两个 `SKILL.md`、`skills/drawio/evals/evals.json`；`justfile:176` 的 `ci: version-sync ...` 第一步就是写操作。academic 的 `evals/README.md:3` 要求其 `evals.json.version` 跟随 `SKILL.md`，但不在同步脚本覆盖范围内。
10. **体积量级复核。** 11 个唯一素材 15,045,957 B（14.349 MiB）；计入 `烟囱.png`（2,287,044 B）二次引用为 17,333,001 B（16.530 MiB）；base64 后约 22.040 MiB。**低于 24 MiB 总量阈值**——论文场景在 strict 下失败的原因是 `烟囱.png` 单图 2.181 MiB 超过 2 MiB 阈值，不是总量超限。

## Requirements

- R1. canonical 扁平 YAML 支持顶层 `assets` 注册表与节点字段 `node.image`，把本地 PNG/JPEG 作为原子图片节点内联为 data URI，产出 `shape=image` 单元；`.drawio` 自包含，不依赖外部文件路径。`assets` 必须贯通完整所有权链：`parseDocumentYaml` → `normalizeDocumentSpec` → `validateDocumentSpec` → `pageSpec` → renderer → `serializeSpecYaml`。任一环节丢弃即为缺陷。
- R2. postprocess 保持 `assets` 不丢失。canonical 变换（`relabel` / `restyle` / `heatmap`）原样透传 `assets`，符合 `postprocess.md` 的「未被 mutator 拥有的字段必须保留」；投影（`mermaid` / `explain` / `html`）的图片降级行为由实测决定并写入文档，不得静默丢失。
- R3. 往返无损的字段集显式定义为：`path`、`sha256`、`raster_reason`、`atomic_raster_unit`、`contains_reconstructable_content`、`decomposition_note`。渲染时全部写入 XML 载体；`--input-format drawio --export-spec` 全部还原。不通过字节哈希反查还原。同一 asset 被多次引用时，各载体内容必须一致，不一致为硬错误。
- R4. **`assets.<id>.path` 一律相对 asset root**，不相对规范文件。asset root 默认为 CLI 调用时的 `process.cwd()`，`--asset-root <dir>` 可显式指定。该约定使路径字符串在 YAML、XML 载体与导出规范中完全一致，`--sidecar-dir` 重定向输出不改变其语义。
- R5. 路径安全独立成规则，不修改 `VALID_ICON`。解析顺序：拒绝绝对路径 → 相对 asset root 解析 → `realpath` 跟随符号链接 → 包含性检查（realpath 必须在 asset root 的 realpath 之下，按路径分隔符边界判定）→ 扩展名白名单 → 必须是普通文件 → 魔数与扩展名一致 → `sha256` 若声明则比对。stdin 输入（`-`）出现 `assets` 时报错。校验失败为硬错误并附字段路径。
- R6. **v1 只支持 PNG 与 JPEG**。SVG 明确推迟：`<?xml` 前缀无法证明文件是 SVG（`<?xml version="1.0"?><root/>` 会误通过），且 SVG 可携带脚本、事件属性、`foreignObject` 与外部 URL 引用，需要独立的内容信任边界。PNG/JPEG 用魔数判定（PNG `89 50 4E 47 0D 0A 1A 0A`、JPEG `FF D8 FF`）。
- R7. 零新增运行时依赖。实现只使用 `node:` 内置模块与 `skills/drawio` 内已有文件，遵守 `skill-doc-and-release-contract.md` 的安装边界合同。因此不做像素重采样、裁剪或格式转换。
- R8. 体积护栏用仓库既有三级诊断词汇，单位统一为 MiB，计数口径为**引用次数加权的源字节总和**（同一 asset 被引用两次计两次，因为 XML 中确实内联两份），在 base64 编码前统计：

  | 条件 | 诊断级别 | `--strict` 下结果 |
  | --- | --- | --- |
  | 单 asset > 2 MiB | `warning` | 失败 |
  | 单 asset > 8 MiB | `error` | 失败 |
  | 引用加权总量 > 24 MiB | `error` | 失败 |

  错误信息给出实际字节数、asset id 与指向 R12 配方文档的路径。

- R9. 外来图片导入不发明数据模型。`--export-spec` 遇到无本 skill 元数据的裸 `shape=image` 单元时，要求显式 `--extract-assets <dir>`：把图片字节解码落盘到该目录，生成 `assets.<id>.path` 引用，保持单一 `path` 来源模型。未提供该 flag 时报错并在消息中给出该 flag，不静默丢图、不发明 `data` 字段。
- R10. 保留既有整页栅格化拦截（`collectFullPageImageErrors`），新能力不得提供绕过路径。`raster-extraction` 适配器边界与用例不变。
- R11. academic overlay 审计门：`meta.profile: academic-paper` 时，每个被引用 asset 必须有非空 `raster_reason`、`atomic_raster_unit === true`、`contains_reconstructable_content === false`，否则在 strict 下失败。审计字段由 base 定义为可选，门由 overlay 施加。
- R12. 素材预处理配方文档化。R8 只负责报出超限，必须同时给出可执行的下一步。skill 参考文档提供可复制的降采样配方，包含可自动断言的质量约束（保留 alpha、LANCZOS、长边由节点渲染尺寸与导出 DPI 推导、PNG 无损保存、不转有损格式）与审计要求（记录 before/after 的尺寸、字节、`sha256` 双端，源文件只读不覆盖，产物写独立目录）。配方由用户在 CLI 之外执行，不进入 CLI 运行时。工具可用性（Pillow）需前置检查，不可用时如实报告，不静默安装。
- R13. 多页 bundle（`schemaVersion: 1` + `pages`）在 v1 不支持 `assets`，出现时显式报错并给出原因，不静默丢弃。
- R14. 文档与证据同步：
  - `.trellis/spec/drawio-skill/` 新增合同文档并在 `index.md` 登记；
  - 两个 `SKILL.md`、`docs/`、根 `README.md` / `README_CN.md` / `CHANGELOG.md`；
  - 版本面完整覆盖：`package.json`、`package-lock.json`、两个 `SKILL.md` frontmatter、`skills/drawio/evals/evals.json`、`skills/drawio-academic-skills/evals/evals.json`（后者不在 `version-sync.js` 覆盖内，需手工同步或扩展脚本，二选一并说明）；
  - eval 证据按既有合同产出：在 `evals.json` 新增具名 case（prompt + 逐条断言），运行后记录逐断言明细，再向 `darwin-results.tsv` 追加分数行。只追加分数行不构成证据。产物写仓库根 `.drawio-tmp/`，不写进 `skills/`。
- R15. 先例核验（窄范围、只读）：核实 draw.io 自身对嵌入图片的原生表达（样式键、data URI 形态、自定义属性保留行为），用于验证 R3 载体选择与 R6 的 SVG 推迟决定。核实结论写入 `research/`；无法核实的部分标注 `missing evidence`，不以推测替代。

## Acceptance Criteria

每条标注对应需求。

- [ ] AC1 (R1)。含 `assets` 与 `node.image` 的扁平 YAML 通过 `cli.js in.yaml out.drawio --validate --strict-warnings`，退出码 0 且零告警；XML 中对应单元含 `shape=image` 与 `data:image/png;base64,`。另有一条单元测试直接断言 `parseDocumentYaml` 返回的 `spec.assets` 非空，锁住所有权链首环。
- [ ] AC2 (R1)。同一 asset 被两个节点引用时两个单元都正常渲染，`assets` 注册表只有一条记录。
- [ ] AC3 (R3/R4)。往返：`--input-format drawio --export-spec` 得到的 YAML 中 R3 六个字段逐一相等，`path` 字符串与输入完全一致；再次渲染在图片单元上等价。含 `--sidecar-dir` 重定向输出的用例，断言 `path` 不变。含 `profile: academic-paper` 的往返用例，断言再次 strict 渲染仍通过（证明审计字段未丢）。
- [ ] AC4 (R3)。同一 asset 的多个 XML 载体内容不一致时为硬错误，有用例。
- [ ] AC5 (R5/R6)。安全矩阵全部硬错误并带字段路径：绝对路径、realpath 逃出 asset root（`..` 与符号链接两种）、扩展名不在白名单、扩展名与魔数不符、指向目录、文件不存在、stdin 输入含 `assets`、SVG 输入被明确拒绝并提示 v1 不支持。正向用例：从仓库根调用、`path` 为 `ref/materials/a.png` 形式解析成功。符号链接用例在 Windows 权限不足时标注 `missing evidence`，不伪装通过。
- [ ] AC6 (R5)。`tests/security.test.js` 中 `VALID_ICON` 相关断言未被修改且仍通过；`node.icon` 仍拒绝含 `/` 的值。
- [ ] AC7 (R8)。护栏用例覆盖恰好阈值与阈值 +1 B 两侧：2 MiB / 2 MiB+1B、8 MiB / 8 MiB+1B、总量 24 MiB / 24 MiB+1B。断言诊断级别（`warning` / `error`）与非 strict / strict 下的退出码，而不只断言消息文本。
- [ ] AC8 (R9)。外来 `.drawio`（裸 `shape=image`，无本 skill 元数据）在无 `--extract-assets` 时报错且消息含该 flag；提供该 flag 时字节落盘、`path` 生成、重新渲染字节一致。
- [ ] AC9 (R10)。整页栅格化仍为硬错误；`raster-extraction` 对 `image` / `assets` 仍返回 `ADAPTER_PARSE`，既有用例未改动。
- [ ] AC10 (R11)。academic 门：缺 `raster_reason` 或 `atomic_raster_unit: false` 在 `academic-paper` + strict 下失败；`profile: default` 下不受约束。
- [ ] AC11 (R13)。bundle 模式下出现 `assets`（顶层或页内）时显式报错，消息含迁移提示。
- [ ] AC12 (R2)。`relabel` / `restyle` / `heatmap` 三个 canonical 变换往返后 `assets` 与 `node.image` 完全保留，各有用例。`mermaid` / `explain` / `html` 的实测降级行为写入文档并各有一条断言。
- [ ] AC13 (R7)。零新增运行时依赖：复制 `skills/drawio` 到临时目录、清空各大小写形式 `NODE_PATH`、在仓库外渲染含图片的 YAML，退出码 0 且产出通过校验。
- [ ] AC14 (R14)。根 `npm test` 与 `just ci` 全绿。注意 `just ci` 首步 `version-sync` 是写操作，运行后 `git status --short` 不得出现规划外 diff——若出现，说明版本面未同步完整。`references/examples/*.yaml` 全部仍通过 `--validate`。
- [ ] AC15 (R14)。两个 `SKILL.md` 改动先有断言映射再落笔，改动后四个策略测试全部通过；若 overlay `references/` 增删文件，`tests/drawio-academic-skill.test.js` 的 13 文件白名单同步更新。
- [ ] AC16 (R14)。`evals.json` 新增本能力的具名 case（prompt + 逐条断言），逐断言明细存入 `research/`，`darwin-results.tsv` 追加分数行。环境无法验证的断言（Desktop、人工视觉）排除出分母并在 `note` 中列名，标注 `missing evidence`。
- [ ] AC17 (R12)。配方可执行：代码可直接复制运行，返回 `src_sha256` 与 `dst_sha256` 双端，产出保留 alpha、长边符合推导规则。可自动断言的部分（模式为 RGBA、长边数值、字节下降、双端 sha256 存在）写成脚本断言；只能人工判定的部分（无白边、无锯齿振铃）单列并注明查看器、查看倍率与判定人，不与自动断言混记。Pillow 不可用时如实记 `missing evidence`。
- [ ] AC18 (R12/R8)。完整驱动场景冒烟：压缩全部 11 张素材，构造 11 条注册表、13 个图片对象（含 `烟囱` 二次引用）、全中文路径的 YAML，渲染 + 往返 + strict 校验通过，压缩前后总量对比与护栏诊断结论一并记录。AC1 的最小集成冒烟与本条分别命名，不相互替代。
- [ ] AC19 (R15)。draw.io 原生图片表达的核验结论写入 `research/`，明确支持或推翻 R3 载体选择与 R6 的 SVG 推迟；未能核实项标注 `missing evidence`。

## Out of Scope

- CLI 运行时的像素级操作：缩放、重采样、裁剪、格式转换、去除阴影。由 R12 的文档化配方在 CLI 之外完成。
- SVG 本地资产（R6 已说明推迟理由）。
- 多页 bundle 的 `assets` 支持（R13 只要求显式报错）。
- 外链模式（`image=https://...` 或 `file://`）；v1 只做内联 data URI。
- 扩展 `raster-extraction` 适配器或修改其合同。
- 放宽 `VALID_ICON` 或把本地图片挤进 `node.icon` 语义。
- 新增语义节点类型或主题 token。
- 论文仓库的任何写入。素材只读读取，压缩产物写本仓库 `.drawio-tmp/asset-smoke/materials-render/`。论文侧是否改用压缩素材由该仓库自己的任务决定。

## Key Decisions

- **路径一律相对 asset root，不相对规范文件。** 这消除了 `--sidecar-dir` 重定向导致的路径语义漂移，也让 YAML、XML 载体、导出规范三处的路径字符串完全一致，无需任何重定基。
- **往返载体逐单元携带全部六个字段**，多引用时校验一致性。放弃字节哈希反查：素材被外部替换后会静默失配。
- **外来图片走 `--extract-assets` 显式落盘**，不发明 `data` 字段。保持单一 `path` 来源模型，同时满足「不静默丢图」。
- **v1 不支持 SVG。** `<?xml` 前缀不能证明文件是 SVG，且 SVG 的脚本/外部引用需要独立信任边界，不在本任务范围内建立。
- **不引入 `sharp` 或任何图像编解码依赖。** 安装边界合同的硬约束。体积问题用护栏 + 文档化离线预处理。
- **护栏阈值不放宽，改为前置压缩（2026-08-24 用户决定）。** 复核后修正理由：论文场景引用加权总量 16.530 MiB **低于** 24 MiB 上限，真正触发失败的是 `烟囱.png` 2.181 MiB 超过单图 2 MiB 阈值 + `--strict` 把 warning 当失败。压缩的正当性在于 2.7× 像素冗余，不在于总量超限。
- **审计字段在 base 定义、门在 overlay 施加**，符合 `CONTEXT.md` 的 Overlay Resource Boundary。
- **触发面不动。** frontmatter `description` 不修改，不触发 26 条 desc 探针回归。所需的是能力侧 output eval（R14）。

## Notes

- 分析与代码定位见 `research/capability-gap-analysis.md`；原始阻塞证据见 `thesis/.trellis/tasks/08-24-recreate-chapter2-fig2-1/offline-image-capability-evidence.md`。
- 相关合同：`raster-replicate-adapter.md`、`skill-doc-and-release-contract.md`、`multi-page-foundation.md`、`postprocess.md`、`semantic-types.md`。
- 分支基线：工作分支为 `dev`，`task.json` 的 `base_branch` 保持 `main`（仓库 PR 目标分支）。实施在 `dev` 上进行。
- 工作区已有 19 个任务外 dirty 路径（`.trellis/` 模板更新与 `.gitattributes`），全程不动、不暂存、不回退。
