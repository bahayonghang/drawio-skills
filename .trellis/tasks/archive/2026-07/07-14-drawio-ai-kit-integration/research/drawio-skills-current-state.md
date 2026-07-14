# 现有 drawio skills 深度分析（探索代理报告，2026-07-14）

来源：对 `skills/drawio`、`skills/drawio-academic-skills` 及仓库根的全量探索。根为 `D:\Documents\Code\Agents\drawio-skills`。

## 1. 目录结构与体量

**`skills/drawio`（约 3.1 MB）**
- `SKILL.md`（200 行，frontmatter + 路由表 + 14 条默认规则）
- `scripts/`（纯 Node ESM）：`cli.js`（435 行入口）、`dsl/spec-to-drawio.js`（**3548 行，核心渲染+校验器**）、`dsl/auto-layout.js`（206 行 elkjs 预处理）、`dsl/shape-catalog.js`（77 行）、`dsl/icon-resolver.js`（150 行）、`dsl/drawio-to-spec.js`、`adapters/`（Mermaid/CSV）、`math/`、`svg/drawio-to-svg.js`（离线 SVG）、`runtime/desktop.js`、`shared/xml-utils.js`、`vendor/elkjs/elk.bundled.cjs`（3MB 主体）。每模块旁有 `.test.js`。
- `assets/`：`catalog/shape-catalog.json.gz`（11.3KB gzip 白名单）、`schemas/spec.schema.json`（560+ 行）、`themes/*.json`（11 主题）、`examples/`、`licenses/`
- `references/`：`docs/`（design-system 8 子文档、architecture-diagrams、stencil-library-guide、ieee-network-diagrams、edge-quality-rules、math-typesetting、mcp-tools 等）、`official/`、`workflows/`（create/edit/replicate）、`examples/`（22 个 YAML）
- `styles/built-in/`、`evals/`、`agents/interface.yaml`、`.mcp.json`

**`skills/drawio-academic-skills`（约 154 KB，薄 overlay）**
- `SKILL.md`（209 行）+ 3 个 overlay 文档（publication-overlay、academic-figure-playbook、academic-export-checklist）+ 8 论文级 YAML + 2 模板。**不含 scripts/themes/schema**，全部复用 `../drawio`（有 Required Sibling Base 映射表；缺 base 即停，禁止 vendor-copy）。

`skills/` 是权威源；`.agents/`、`.claude/`、`.codex/` 是分发镜像。根测试只跑 `tests/` 和 `skills/`。

## 2. YAML → .drawio 工作流

- Spec 三段：`meta`（title/theme/layout/routing/profile/figureType/source/canvas/font/print）、`nodes`（id/label/type/position|bounds/size/icon/module/style/network）、`edges`、`modules`。
- 链路：`cli.js` → 按 `--input-format` 归一（yaml/mermaid/csv/drawio）→ `applyAutoLayout()`（elkjs）→ `validateSpec()` → `specToDrawioXml()`；`.svg` 离线渲染，`.png/.pdf` 走 draw.io Desktop CLI。纯 Node，唯一运行时依赖 js-yaml。
- 布局混合式：作者可写 position/bounds；`meta.layout: hierarchical` 且全图无显式坐标才走 elkjs（layered/RIGHT/ORTHOGONAL/INCLUDE_CHILDREN，module 为 compound container），失败退 legacy grid。horizontal/vertical/star/mesh/tiered 是确定性算法布局。任一节点有坐标 → 整图作者掌控。

## 3. shape 处理（四条来源，均预设查表）

1. `SHAPE_STYLES`（spec-to-drawio.js:296，约 45 键）：service/database/decision/queue/cloud/server/firewall/subnet + 深度学习（conv/pool/attention/tensor3d）+ agentic（llm/agent/vector_store/memory/tool/gateway）。`detectSemanticType()`（:348）推断，fallback service。
2. 云厂商 stencil：`icon-resolver.js` + `ICON_PREFIXES`（:891）把 `aws.*/gcp.*/azure.*/k8s.*/cisco.*/cisco19.*` 映射为 `mxgraph.aws4.*` 等真名；`ICON_ALIASES` 纠常见误写（`aws.alb→application_load_balancer`）；aws4 resourceIcon 自动包 `shape=mxgraph.aws4.resourceIcon;resIcon=<name>`。
3. 内嵌 SVG 图标：`lobe.*/ai.*/brand.*/lucide.*` → data-URI `shape=image`，无 CDN 回退。
4. 原始 `mxgraph.*` 透传。

**防编造现状**：`assets/catalog/shape-catalog.json.gz` 从 draw.io 官方 10,446 条 shape index 过滤的白名单（builtin 78 + stencils 1184 + aws4ResourceIcons 554）。`shape-catalog.js:resolveShapeNameKind()` 对覆盖前缀（aws4/gcp2/azure/kubernetes/cisco/cisco19/networks）分类；`validateShapeReferences()`（:2173）对覆盖命名空间内不在白名单的名字发 warning："would render as an empty box in draw.io Desktop"。

**缺口**：
1. warning 级，仅 `--strict` 升 error，默认不阻断。
2. 白名单极不均衡：aws4 599、cisco 291、gcp2 110、azure 87、networks 58、cisco19 38、**kubernetes 仅 1**；覆盖前缀外标 `uncovered` 不校验。
3. 交互式 `search_shape_catalog` 只是 MCP/live 后端的可选工具，**离线 scripts 未实现**（grep 确认无 searchShapeCatalog）。离线路径 AI 只能先写后被 warning 兜底。

## 4. 校验与质量门

- 硬校验（抛错）：ID 正则、枚举、bounds 数值、MAX_NODES=100/EDGES=200/MODULES=20、style 文本白名单正则（防注入）。
- 软校验（warning，--strict 升 error）：validateColorScheme、validateLayoutConsistency、validateConnectionPointPolicy、validateEdgeQuality（短末段、waypoint 与连接点混用、非共线折弯）、validateTextNodeStyles、validateLabelFit/validateLabelCollisions、validateAcademicProfile、validateShapeReferences、validateSchemaDrift。`--validate` 另报布局质量指标。
- 根 `tests/`（12 个 node:test 策略契约）：
  - `visual-verification-policy.test.js`：断言 SKILL.md/workflows 里必须出现"优先导出物、不得用浏览器/Playwright 截图"等**精确字符串**，以及 `.drawio-tmp/<name>/`、`--sidecar-dir` 措辞。
  - `no-visio-skill-policy.test.js`、`drawio-academic-skill.test.js`（310 行：overlay 不复制 base runtime）、`skill-metadata.test.js`、`security.test.js`（421 行）、`integration.test.js`（359 行 CLI 端到端）、`academic-templates-strict.test.js`（模板过 --strict）、`math-typesetting.test.js`、`adapters.test.js`、`arch-json.test.js`、`desktop-detection.test.js`。
- 收尾必须跑根 `npm test`（node scripts/run-tests.js，扫 tests/+skills/）或 `just ci`（version-sync + version-check + lint + test + docs-build）。

## 5. academic overlay 关系

薄策略层："intentionally thin"，自己只拥有 academic 策略/gate/文档/示例；执行全调 `../drawio`。base 的 `meta.profile: academic-paper`/`figureType`/`PRINT_TARGETS`（cn-thesis 9pt/440pt、ieee-single 8pt/252pt，`collectAcademicLayoutSizeWarning`）已在 base 校验器。

## 6. 能力缺口对照

- 真实 stencil 校验：部分具备，warning 软兜底；缺"查询-约束-拒绝"闭环。
- 自动布局：较成熟（elkjs），仅全图无坐标+hierarchical 触发；正交边无 waypoint 时离线 SVG 只做 L/Z 近似。
- 云厂商目录：aws/cisco 强，gcp2 110/azure 87/k8s 1 弱；无面向 AI 的可浏览/可查询接口。
- 防编造：机制存在但偏软；离线默认"先写后验"。

## 7. 依赖与 Windows

纯 Node 20+ ESM，运行时依赖仅 js-yaml；elkjs vendored。运行：`node <base>/scripts/cli.js input.yaml output.drawio --validate --write-sidecars --sidecar-dir .drawio-tmp/output`；PNG 需 `--use-desktop`（desktop.js 有可执行文件信任校验），无 Desktop 退 standalone SVG。justfile `set windows-shell := powershell`。
