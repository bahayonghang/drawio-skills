# drawio 上游能力等价整合与视觉返工闭环加固

## Goal

将 `ref/drawio-skill` 方向一、二、三的高价值能力按**功能等价**方式整合进本仓 `skills/drawio` 与薄层 `skills/drawio-academic-skills`，保持 canonical spec、YAML-first、offline-first 和 base/overlay 所有权边界。优先解决用户点名的 P0：导出图片可被视觉模型稳定读取，并把视觉反馈转成可验证、可复跑的最小返工。

本任务不追求上游 37 个 Python CLI 的命令、参数或中间格式兼容。现有能力优先桥接；只有真实差距才新增代码。

## Confirmed Facts

- 上游有 37 个 Python 脚本；本机运行 129 个测试通过，7 个 Desktop/Graphviz 相关用例跳过。
- 两边 shape index 都有 10,446 项；本仓已有 catalog search、JS ELK、draw.io import、validate、diagrams.net URL、network topology、swimlane 和 image replicate。
- 上游 `aiicons` 暴露 311 个 family identifier，但其中 2 个是 suffix 解析把 `*-text-color` 误算成品牌；固定包实际有 309 个 base brand。用户已选择完整离线目录，本仓将以 `@lobehub/icons-static-svg@1.91.0`（MIT、固定 registry integrity）生成 309 个 canonical SVG，并保证运行时零网络访问。
- 当前 Desktop `30.3.11` 的嵌入 PNG 实测为 `2996 x 3249`，IEND 完整且可视觉读取；非嵌入 `--width 2000` preview 为 `2000 x 2170`，更小且可读。
- IEND 截断在当前版本没有复现；修复只能作为严格验证后的兼容分支。
- Windows Desktop 存在进程返回后输出文件短暂尚未落盘的现场证据。
- 完整证据和能力差距见 `research/upstream-capability-audit.md`。

## Requirements

### R0 视觉识别与返工闭环（P0）

- 增加显式 `vision-preview` 导出 profile：PNG 不嵌入 XML、不使用 DPI scale，最长边最终不超过 2000px。
- Desktop 返回后等待输出存在且大小稳定，再读取 PNG 或交给视觉模型。
- 用结构化 PNG 解析检查签名、IHDR、chunk 边界和 IEND；只修复精确匹配已知 IEND 截断形态的有效 PNG，其他损坏显式失败。
- 保持现有 final PNG 默认契约：300dpi、可嵌入；preview 不替代最终交付物。
- 视觉评审输出结构化问题：对象/页面、问题类型、严重度、可观察证据和建议动作。
- canonical YAML/spec 是返工首选；仅在没有 sidecar 的导入图或 direct-XML 例外中修改 XML。
- 每次返工后重新 validate、导出和读取；自主自检最多 2 轮，用户评审 5 轮后建议 Desktop 精调。
- base 持有共享视觉评审单一事实源；academic overlay 只追加论文/A4/印刷可读性检查，不复制 runtime 或完整表格。

### R1 输入适配器与架构漂移

- 代码输入覆盖 Python imports、Python classes、JS/TS、Go、Rust。
- 配置输入覆盖 Terraform、Kubernetes、Compose、SQL DDL、OpenAPI、GitHub Actions/GitLab CI。
- 运行态覆盖 Terraform state、Docker inspect、Kubernetes JSON。
- 所有 adapter 输出 canonical spec 或正式定义的 canonical graph projection，再进入现有校验、ELK、渲染和 sidecar 管线。
- 声明态与运行态定义稳定身份：Terraform resource address、Kubernetes namespace/kind/name、Compose service/container 等。
- drift 对节点、边和重要属性分别报告 added/removed/changed/same；颜色之外保留文字或线型语义。

### R2 专业作图能力

- `raster2drawio` 作为现有 replicate 的结构化输入分支：视觉抽取直接归一化为 canonical spec，不建立第二套 XML 生成器。
- shape search 作为已有桥接能力，仅补排名或覆盖测试，不复制 10,446 项数据。
- AI 图标采用完整离线目录：309 个真实 base brand 各保留一个 canonical SVG，确定性选择顺序为 `-color`、`-brand-color`、base；生成资产、许可证和来源完整随 skill 发布，运行时不访问 npm、CDN 或其他网络端点。
- SysML、BPMN 仅在现有 schema/semantic types/shape catalog 无法表达时扩展；network topology 与 swimlane 视为已有能力。
- C4 多页下钻先定义 canonical multi-page contract，再实现页面链接、逐页导入导出与校验。

### R3 后处理与发布

- 离线变换优先 JS/ESM：Mermaid、Markdown explain、relabel、restyle、heatmap、runbook 和可安全实现的 diff/HTML 逻辑。
- Desktop、Git 或专用库相关能力作为隔离工具：interactive HTML SVG export、PPT、buildup、compress、timelapse、prdiff。
- 自包含 HTML 对标签、SVG、Git 文本执行注入/XSS 边界检查。
- `compress` 只承诺确定性结构摘要与下钻，不声称自动生成语义正确的董事会叙事；语义命名需要评审证据。
- PR bot 独立进入 Governed 风险面：默认禁用模板、固定依赖、校验下载、最小权限和无 secrets 暴露。

### R4 Skill 工程与集成

- 保持两个 `SKILL.md` 精简；只增加能力族路由和强 context pointer，详细能力矩阵下沉到 references。
- base 是共享执行与参考的单一事实源；academic overlay 不复制 base 文件。
- 更新受影响的 `agents/interface.yaml`、`agents/openai.yaml`、evals、compatibility、docs 和中英文镜像。
- description 只有在现有触发面确实缺失时才改；若改，执行既有 26 条 trigger 探针和字符预算门禁。
- Library 级输出评测至少覆盖 5 个 file-backed case，并区分 recorded fixture、command-executed、model-executed 和 `missing evidence`。

## Constraints

1. canonical spec 与 YAML sidecar 是可编辑事实源；生成的 raster preview 不是 canonical。
2. Node 20+ 是必需 runtime；Python 3 只能作为显式、可选、隔离的 adapter/export tool，并精确报告 PyYAML、python-pptx、Pillow 等按需依赖。
3. 不承诺上游 CLI 兼容，不复制已有 shape index、ELK、validate、URL、network 或 swimlane 实现。
4. 普通 create/edit/import/export 不增加网络、MCP 或 browser 硬依赖。
5. base 拥有 runtime；academic overlay 保持薄。
6. 用户输入、导入 XML、Git 文本和生成 HTML 全部按不可信数据处理。
7. 每个可执行子任务必须有自己的 `prd.md`、`design.md`、`implement.md` 和显式依赖；能力域 bucket 不得直接 `task.py start`。
8. 规划和实施引用仓库 spec/research 文件，不再依赖会话记忆键。

## Acceptance Criteria

- [ ] 37 个上游脚本逐项映射为 `bridge`、`adapt`、`replace` 或 `defer`，每项有理由、入口和验证证据；`bridge` 项不要求产生重复代码。
- [ ] R0 在 base + academic policy 路径落地，preview 最长边不超过 2000px，PNG 结构有效，返工通过稳定 ID 回写 canonical spec。
- [ ] IEND 完整文件保持字节不变；精确已知截断可修复；任意非 PNG/其他截断被拒绝。
- [ ] R1 adapter 进入同一 canonical pipeline；声明态/运行态 stable identity 和 drift 语义有 fixture 测试。
- [ ] R2 明确已有与新增能力；C4 多页可逐页 round-trip；AI 图标目录离线解析 309/309 个 canonical slug，并通过来源、完整性、安全和代表性渲染检查。
- [ ] R3 自包含 HTML 通过不可信标签/脚本注入测试；PR bot 通过独立 trust/permission/supply-chain 门禁。
- [ ] 每个新增能力都有最小用例、focused tests、路由 reference 和诚实的可选依赖错误。
- [ ] Library output scorecard 至少 5 个 file-backed case；不可执行的 Desktop/Graphviz/model/PR 路径标为 `missing evidence`。
- [ ] 受影响的 interface/evals/docs/compatibility 同步；root `npm test`、`just ci` 与 docs build 按风险执行。
- [ ] 每个实施子任务独立可验收、可归档；父任务只做跨子任务需求、顺序和最终集成审查。

## Task Map

- **C0 P0** `07-18-drawio-vision-rework`：vision-preview、PNG 检查、结构化视觉评审、YAML-first 返工。无前置依赖，完成规划审查后最先实施。
- **C1 bucket** `07-18-drawio-dir1-import`：canonical adapter、代码/配置/运行态输入与 drift。实施前按 adapter foundation、代码输入、infra/live/drift 拆成独立 deliverable，并把 stable identity 依赖写入子工件。
- **C2 bucket** `07-18-drawio-dir2-authoring`：replicate/raster、AI icons、SysML/BPMN、C4 multi-page。实施前把 multi-page foundation 与资产/diagram-type 增量拆开。
  - **C2.1 P1** `07-18-drawio-ai-icon-catalog`：固定 Lobe Icons 来源、生成 309 品牌离线目录、lazy loader、resolver/alias/suggestion 契约和代表性渲染证据；依赖 C0 的 preview/review 契约完成视觉验收。
- **C3 bucket** `07-18-drawio-dir3-postprocess`：离线后处理、runtime-rich export、PR bot。PR bot 必须独立 Governed 子任务。
- **Integration child（待创建）**：skill 路由、interfaces、evals、compatibility、output scorecard、package/release gates；依赖所有实际 feature children。

## Out of Scope

- 逐命令兼容上游 37 个 Python CLI。
- 把 upstream `SKILL.md` 的 6,000+ words 原样并入现有入口。
- 默认联网获取图标、主题或运行态云资源。
- 在没有证据时声称 Desktop、Graphviz、视觉模型或 PR 评论链路已验证。
