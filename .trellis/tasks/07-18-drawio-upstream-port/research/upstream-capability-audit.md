# 上游能力与本仓差距审计

## 目的

为 `drawio-upstream-port` 的规划提供可复核证据。本文只记录已经从源码、测试或本机运行得到的事实；没有执行到的外部集成保持 `missing evidence`。

## 范围与基线

- 上游：`ref/drawio-skill`，`SKILL.md` 声明版本 `1.34.0`。
- 本仓：`skills/drawio` 与 `skills/drawio-academic-skills`，版本 `2.7.0`。
- 用户决策：追求上游能力的功能等价整合，不承诺兼容上游 37 个 Python 命令、参数或中间文件格式。
- 本仓硬边界：canonical spec、YAML-first、offline-first、base runtime + thin academic overlay。

## 已验证事实

### 上游规模与测试

- `ref/drawio-skill/skills/drawio-skill/scripts/` 有 37 个 Python 脚本。
- 静态测试方法计数为 129。
- 本机运行：

  ```powershell
  $env:PYTHONDONTWRITEBYTECODE='1'
  python -B -W error::ResourceWarning -m unittest discover -s ref\drawio-skill\tests -v
  ```

- 结果：`Ran 129 tests ... OK (skipped=7)`。
- 7 个跳过项依赖 draw.io CLI 或 Graphviz；因此上游的完整 Desktop/Graphviz 路径是 `missing evidence`，不能由单元测试通过替代。
- 测试运行还暴露了未关闭文件的 `ResourceWarning`，但 unittest 最终仍报告通过。

### 方向一：输入与漂移

- 上游代码输入：Python import、Python class、JS/TS、Go、Rust。
- 配置输入：Terraform HCL/state、Kubernetes YAML/JSON、Compose、SQL DDL、OpenAPI、GitHub Actions/GitLab CI。
- 运行态输入：Terraform state、Docker inspect、Kubernetes live JSON。
- `drawiodiff.py` 按 cell id 或 label 匹配；只有声明态与运行态共享稳定语义身份时，漂移颜色才可靠。
- 多数 importer 本身只输出 graph JSON；Graphviz 通常属于后续 autolayout 阶段，不应把所有 importer 都描述成 Graphviz 硬依赖。

#### C1 逐脚本映射（权威表）

Evidence state 仅描述当前已取得的上游证据；它不等于本仓 child 已实施。上游 importer 小 fixture 来自 `ref/drawio-skill/tests/test_scripts.py`；Graphviz/Desktop 跳过或未运行的路径继续标记 `missing evidence`。

| Upstream script | Mapping | C1 owner / replacement entry | Reason | Current evidence |
| --- | --- | --- | --- | --- |
| `autolayout.py` | `replace` | `07-18-drawio-adapter-identity-foundation` -> existing JS `applyAutoLayout` + canonical renderer | upstream 直接调用 Graphviz `dot` 并生成 XML；本仓已有 vendored ELK/canonical renderer，Graphviz 不应成为默认硬依赖 | upstream unit helpers command-executed；Graphviz comparison `missing evidence` |
| `pyimports.py` | `adapt` | `07-18-drawio-code-importers` | 保留 Python AST/intra-project import intent；输出 projection，移除 `tred`/graph JSON CLI/layout coupling | small file-backed fixture command-executed；large repo corpus `missing evidence` |
| `pyclasses.py` | `adapt` | `07-18-drawio-code-importers` | 保留 inheritance scope；identity 改为 canonical module path + qualified class，移除 `tred` | small fixture command-executed；nested/ambiguous corpus `missing evidence` |
| `jsimports.py` | `adapt` | `07-18-drawio-code-importers` | 保留 intra-project ESM import graph job；替换 regex/Python shell、mutable path id 与 `tred`，使用 direct-pinned `es-module-lexer@2.3.1` | small fixture + real parser command-executed；CJS/TS aliases/large corpus `missing evidence` |
| `goimports.py` | `adapt` | `07-18-drawio-code-importers` | 用 direct-pinned Node tree-sitter Go grammar 保留 intra-module package graph；canonical path 由 shared factory 生成，不调用 Go toolchain | upstream small fixture command-executed；workspace/replace/build-tag corpus `missing evidence` |
| `rustimports.py` | `adapt` | `07-18-drawio-code-importers` | 用 direct-pinned Node tree-sitter Rust grammar 保留 crate module-use job；明确 cfg/inline module/edition 限制，不调用 Rust toolchain | upstream small fixture command-executed；workspace/cfg/inline module corpus `missing evidence` |
| `tfimports.py` | `adapt` | `07-18-drawio-config-importers` | 保留 resource/module/reference semantics；使用 module-qualified address、成熟 HCL parser 决策、projection hints 和 JS ELK | small fixture command-executed；multi-module HCL parser corpus `missing evidence` |
| `k8simports.py` | `adapt` | `07-18-drawio-config-importers`; live mode bridges to same adapter in live child | 一套 structured YAML/JSON parser 同时服务 declared/live；identity 固定为 scope/namespace/kind/name | JSON/file/stdin fixtures command-executed；CRD scope/real cluster `missing evidence` |
| `composeimports.py` | `adapt` | `07-18-drawio-config-importers` | 保留 service/dependency/volume semantics；补 project/service identity，shared live normalization | PyYAML fixture command-executed when dependency available；profiles/includes `missing evidence` |
| `sqlerd.py` | `adapt` | `07-18-drawio-config-importers` | 保留 table/PK/FK job；schema-qualified identity、parser/subset contract 和 semantic edges 替换 raw style | small DDL fixture command-executed；dialect corpus/parser choice `missing evidence` |
| `openapiimports.py` | `adapt` | `07-18-drawio-config-importers` | 保留 operation/schema refs；operation identity 改为 method + normalized path，不使用 `opN` ordinal | JSON fixture command-executed；callbacks/webhooks/external refs corpus `missing evidence` |
| `ciimports.py` | `adapt` | `07-18-drawio-config-importers` | 保留 jobs/needs/stage/trigger semantics；identity 改为 provider/workflow/job，不依赖 display name | GitHub/GitLab fixtures command-executed；includes/expressions/real repos `missing evidence` |
| `tfstate.py` | `adapt` | `07-18-drawio-live-snapshots-drift` | 保留 managed resource/state recursion；复用 declared Terraform identity/attribute allowlist，过滤 sensitive values | saved JSON fixture command-executed；real provider state/plan `missing evidence` |
| `dockerimports.py` | `adapt` | `07-18-drawio-live-snapshots-drift` | 保留 container/network/volume relations；Compose-managed container primary identity 改为 project/service，instance 作为 attribute | inspect fixture command-executed；replicas/swarm/real daemon `missing evidence` |
| `drawiodiff.py` | `replace` | `07-18-drawio-live-snapshots-drift` | 从 XML cell id/label diff 改为 projection identity + node/edge/important-attribute diff；状态必须有文字/线型，不只靠颜色 | upstream id/label fixtures command-executed；new projection drift/model review `missing evidence` |

Graphviz `dot/tred` 作为 C1 默认路径整体 `defer`。只有独立 fixture 证明 JS ELK 无法满足具体布局/约简需求，并取得可复核对比证据后，才可另立 optional tool；当前没有这类证据。

### 方向二：专业作图

- 两边 shape index 都是 10,446 项；`shapesearch` 是已有能力，不需要重新移植数据集。
- 本仓已有 shape catalog search、ELK auto-layout、network topology、swimlane、replicate 和本地 YAML bounds。
- 上游 `aiicons.py --list` 返回 311 个 family identifier，但 suffix 解析把 2 个 `*-text-color` variant 误算成品牌；固定包实际有 309 个 base brand。其默认样式指向 CDN，`--embed` 仍需联网抓取 SVG。用户已选择完整离线替代，固定来源与生成证据见 `research/offline-ai-icon-catalog.md`。
- 本仓只内嵌 OpenAI、Claude、Gemini 三个 Lobe SVG，满足 offline-first，但不满足 300+ 品牌覆盖。
- 上游 `raster2drawio` 不读取图片；视觉模型先把图片转成 JSON，脚本再把 JSON 转成 XML。本仓 replicate 已经承担图片理解，新增能力应输出 canonical spec，而不是建立第二套 image -> graph JSON -> XML 管线。
- C4 多页下钻不是单纯样式预设。本仓 canonical schema 当前是单页 `meta/nodes/edges/modules`，多页支持需要明确的数据模型、链接、导入、导出和校验契约。

### 方向三：后处理

- 纯数据/XML 类能力：Mermaid、Markdown explain、relabel、restyle、heatmap、runbook、部分 diff。
- Desktop/runtime 类能力：interactive HTML 的 SVG 导出、PPT、buildup、timelapse、prdiff。
- `compress` 的聚类是结构启发式；上游明确要求后续人工重命名，不能直接宣传为语义正确的“董事会摘要”。
- 自包含 HTML 会承载用户标签、SVG 或 Git 提交文本，必须纳入 XSS/HTML 注入测试。
- 上游 PR bot 会安装系统包、下载 latest draw.io `.deb`、上传 artifact 并写 PR 评论；这是 Governed 风险面，不应与普通离线转换器共用一个轻量验收。

## 视觉导出现场证据

### 环境

- draw.io Desktop：`C:\Program Files\draw.io\draw.io.exe`
- 版本：`30.3.11`
- fixture：`skills/drawio/evals/fixtures/industrial-architecture.yaml`

### 当前 final 导出

- 使用本仓 CLI 默认 Desktop PNG 导出。
- PNG：`2996 x 3249`，约 908 KB。
- 包含 `zTXt` / `mxGraphModel` 嵌入内容。
- PNG 签名正确，IEND 完整。
- 当前会话的视觉读取成功，因此“嵌入 PNG 必然不可读”不是普遍事实。

### 非嵌入 preview 导出

- 直接使用 Desktop `--width 2000`，不带 `-e`。
- PNG：`2000 x 2170`，约 539 KB。
- 不包含 `zTXt` / `mxGraphModel`。
- PNG 签名和 IEND 完整，视觉读取成功。
- 宽度上限不能保证高度上限；稳定方案必须检查 IHDR，必要时按 `--height 2000` 重导。

### 新发现：Windows 落盘竞态

- 在本机直接调用 Desktop 时，进程返回后立即读取输出曾得到 `ENOENT`，稍后文件出现。
- 视觉 preview 管线必须等待输出存在且文件大小稳定，再读取 IHDR、修复或交给视觉模型。
- 该行为需要可注入时钟/文件系统的确定性单元测试，以及本机 Desktop 集成证据。

### IEND 结论

- 当前 Desktop 版本没有复现上游的 IEND 截断。
- 上游 `repair_png.py` 对任何非 IEND 结尾文件追加终块，未验证 PNG 签名、chunk 边界或截断位置，不能原样移植。
- 本仓只应修复“PNG 有效且精确匹配已知 IEND 截断形态”的文件；其他损坏必须显式报错。

## 推荐整合原则

1. 能力矩阵逐项标记 `bridge`、`adapt`、`replace`、`defer`；`bridge` 不制造重复入口。
2. 所有输入适配器输出 canonical spec；多页能力先扩展 canonical page contract。
3. JS 是默认 runtime；Python 只作为可选、隔离、显式依赖的适配器或导出工具，不承诺上游 CLI 兼容。
4. base 拥有共享执行与视觉返工单一事实源；academic overlay 只追加论文可读性规则。
5. 视觉证据至少覆盖 small、wide、tall、CJK、dense academic 五类 file-backed fixture。
6. 录制 fixture、命令执行和视觉模型执行必须分别标注；没有 provider/model 元数据时不得声称 model-executed。
7. PR bot 独立做权限、供应链、固定版本和默认禁用审查。

## Skill 工程审阅

### 入口规模

| 入口                                 | 行数 |  词数 | UTF-8 bytes |
| ------------------------------------ | ---: | ----: | ----------: |
| 上游 `ref/drawio-skill/.../SKILL.md` |  353 | 6,018 |      42,818 |
| 本仓 `skills/drawio/SKILL.md`        |  150 | 1,703 |      13,995 |
| 本仓 academic overlay                |  159 | 1,403 |      11,994 |

按 `writing-great-skills` 的 predictability / information hierarchy / single source of truth 规则，上游入口把 37 个工具分支、依赖探测、完整导出说明、视觉检查表、故障排查和 diagram-type 预设放在同一上下文层，形成明显 sprawl；同一 preview/IEND/vision 规则在 workflow、self-check、export 和 troubleshooting 多处重复，也增加 sediment 与更新漂移风险。

本仓当前的 route table + context pointer 结构更适合作为 canonical 入口。优化应保持以下边界：

1. 不为每个新能力创建 model-invoked skill；这会增加常驻 description 的 context load 和 near-neighbor route 冲突。
2. `SKILL.md` 只增加能力族路由与一条可检查的完成契约，脚本参数、311/309 统计、依赖矩阵和长示例下沉到 references/scripts/assets/evals。
3. deterministic parser、catalog、PNG inspection 和 export stabilization 写成脚本；不要用长 prose 让模型每次重写脆弱逻辑。
4. visual self-check 的完成条件必须包含“稳定落盘、结构有效、尺寸受控、旧 blocker 已关闭或显式保留、review record 已持久化”，而不是“读取图片后感觉正常”。这直接针对 premature completion。
5. base 是 runtime 与完整 visual-review contract 的单一事实源；academic overlay 只追加论文/A4/印刷 rubric 和强 pointer，避免两份检查表漂移。
6. description 先保持不变；只有真实 missed-trigger/route-confusion 证据才修改，并运行既有 26-probe trigger regression 与 1024-byte gate。

按 `yao-meta-skill`，本仓是 Library 级、部分能力（PR bot、固定第三方资产）进入 Governed 风险面。相应规划已把确定性逻辑放 `scripts/`、静态图标放 `assets/`、详细能力矩阵放 `references/`、file-backed output evidence 放 `evals/reports`，并要求 trust、permission、provenance、rollback 与 `missing evidence` 标签。视觉质量不能只靠结构测试：C0 和图标 child 都保留五类 file-backed case、真实导出检查和 YAML-first self-repair。

### 当前规划就绪度

- C0 `07-18-drawio-vision-rework` 已有可审阅的 PRD/design/implement。
- C2.1 `07-18-drawio-ai-icon-catalog` 已拆分并有可审阅的 PRD/design/implement。
- 父任务尚不可启动：37 项逐项 mapping 表仍未完成，C1/C3 和 C2 其余 deliverable 尚未拆分，integration/promotion child 尚未创建。
- 这些未完成项是 planning backlog，不是通过项，也不能由上游 129 个单元测试或当前两份 child 规划替代。

## 证据路径

- `ref/drawio-skill/skills/drawio-skill/SKILL.md`
- `ref/drawio-skill/skills/drawio-skill/references/toolbox.md`
- `ref/drawio-skill/skills/drawio-skill/references/diagram-types.md`
- `ref/drawio-skill/skills/drawio-skill/references/live-infra.md`
- `ref/drawio-skill/skills/drawio-skill/references/derasterize.md`
- `ref/drawio-skill/skills/drawio-skill/references/pr-bot.md`
- `ref/drawio-skill/skills/drawio-skill/scripts/repair_png.py`
- `ref/drawio-skill/skills/drawio-skill/scripts/drawiodiff.py`
- `skills/drawio/SKILL.md`
- `skills/drawio-academic-skills/SKILL.md`
- `skills/drawio/scripts/runtime/desktop.js`
- `skills/drawio/scripts/cli.js`
- `.trellis/spec/frontend/component-guidelines.md`
- `.trellis/spec/frontend/hook-guidelines.md`
- `.trellis/spec/frontend/quality-guidelines.md`
- `.trellis/spec/drawio-skill/skill-doc-and-release-contract.md`
