# 离线 AI 图标目录

## Goal

把上游 `aiicons` 的 300+ 品牌发现与嵌入能力按功能等价方式整合进 `skills/drawio`：固定包中的 309 个真实 base brand 各有一个随 skill 发布的 canonical SVG，可通过 `lobe.*` / `ai.*` 离线解析、搜索和建议，并在 draw.io Desktop 导出中稳定显示。运行时不访问 npm、CDN、MCP 或 browser。

## Confirmed Facts

- 用户选择完整离线目录，不保留“核心离线 + 可选联网”分支。
- 固定来源为 `@lobehub/icons-static-svg@1.91.0`，MIT，registry integrity 为 `sha512-ZDflEq0uUvAkH4WK4h3qNvvY09ts4OqUb5azD7A0xKfcuYhffGwB1Q/As2RguZYq4Gh4v925CJ8iodiClzc4zw==`。
- 上游 regex 报告 311 个 family identifier，但其中 `civitai-text`、`kwaikat-text` 是 `*-text-color` suffix 误分项；修正规则后 871 个 SVG variant 形成 309 个真实 base brand。
- 按 `-color`、`-brand-color`、base 顺序可解析 209/1/99 个品牌，覆盖 309/309。
- 当前 resolver 只内嵌 OpenAI、Claude、Gemini；`tests/skill-metadata.test.js` 禁止在 `icon-resolver.js` 直接读取文件或出现 CDN/HTTP image。
- 309 个 canonical SVG 的安全和渲染特征审计见父任务 `research/offline-ai-icon-catalog.md`。

## Dependencies

- **实施顺序依赖**：先完成 `07-18-drawio-vision-rework`，本任务复用其 `vision-preview`、稳定落盘和 structured visual review 做 Desktop 验收。
- **运行时无耦合依赖**：catalog loader/resolver 不依赖视觉模型；没有 Desktop 时确定性单元测试仍可运行，但 Desktop/vision 证据保持 `missing evidence`。
- **后继依赖**：最终 integration/promotion child 统一更新 `SKILL.md` 路由、interfaces、用户文档、跨能力 eval 和 `reports/output_quality_scorecard.md`。

## Requirements

### R1 固定来源与可复现生成

- 通过开发期生成器从明确提供的、已解包的固定 package source 生成 catalog；生成器本身不隐式下载或自动升级。
- 校验 package name、version、registry integrity 输入、MIT license、871 variant 和 309 个修正后的 base brand；任一不匹配显式失败，并显式防止 `*-text-color` 再次被误分。
- 输出按 slug 排序，gzip 字节可复现，不含时间戳、绝对路径或临时目录。
- canonical variant 选择顺序固定为 `-color`、`-brand-color`、base；不得依赖文件系统枚举顺序。

### R2 Catalog 与 Loader 契约

- generated asset 为 `skills/drawio/assets/catalog/ai-icons.json.gz`，包含 schema version、来源 provenance、选择策略和 309 个 `{slug, variant, svg}` 记录。
- `skills/drawio/scripts/dsl/ai-icon-catalog.js` 独立持有 read/gunzip/schema/count/cache；`icon-resolver.js` 保持窄接口并继续满足 metadata test。
- 首次 AI icon 请求 lazy load，后续复用同一缓存。catalog 缺失、损坏、重复 slug 或 provenance/count 不匹配时抛出可操作错误；这类错误不得伪装成 unknown icon。
- 不请求 AI icon 的普通图表不应加载 catalog，也不因 catalog 错误影响 Lucide、Redis 或普通 draw.io shape。

### R3 名称、兼容与发现

- `lobe.<slug>` 是 309 个 canonical identifier；`ai.<slug>` 是同一离线目录的便捷 namespace。
- canonical slug 使用 exact lookup；只有 exact miss 时才走 slug alias。已公开的 full-name compatibility identifier 单独保留，包括 `brand.openai`、bare `openai`、`lobe.chatgpt`、`lobe.open-ai` 和 `ai.anthropic` 的既有输出。
- 新增 `lobe.anthropic` 可精确访问来源中的 Anthropic 品牌，不被 `ai.anthropic -> claude` 兼容例外遮蔽。
- `search <query> --prefix lobe` 和未知 `lobe.*` / `ai.*` validation 使用同一离线候选与确定性排名，返回最多三个可复制的 canonical suggestions。

### R4 离线、安全与法律边界

- catalog、resolver 结果和生成的 `.drawio` 不含 HTTP(S) image URL；运行时不读取 npm package 或用户 home cache。
- 生成器拒绝 script、事件属性、foreignObject、embedded image、外部 href/src/CSS URL、缺失 viewBox 和超出边界的 SVG；`1em` intrinsic size 规范化为 draw.io 可缩放尺寸。
- 保留 `skills/drawio/assets/licenses/lobe-icons-MIT.txt` 并增加 provenance 指针；文档说明商标仅用于识别，不暗示品牌方背书。
- 来源升级必须显式改 version/integrity 并重新执行 count、安全、视觉和 package diff 审查。

### R5 输出质量与证据

- 所有 309 个 canonical slug 都要通过 resolver/data URI/无网络确定性测试。
- 至少五个 `file-backed fixture` 覆盖：现有 alias/core、linear/radial gradient、currentColor、clip/mask/filter、CJK dense RAG/Agent 图。
- 使用 C0 `vision-preview` 验证代表性 Desktop PNG 非空、图标未丢失、标签不遮挡；视觉问题以 structured review record 回写 canonical YAML 后重导。
- recorded fixture、command-executed、Desktop-executed、model-executed 分开标注；没有 provider/model metadata 时记录 `missing evidence`。

## Acceptance Criteria

- [ ] 同一固定输入连续生成两次得到字节相同的 `ai-icons.json.gz`；catalog provenance 与固定 package/version/integrity/license 匹配。
- [ ] catalog 恰有 309 个排序且唯一的 slug，variant 分布为 209 `-color`、1 `-brand-color`、99 base；不存在 `civitai-text` / `kwaikat-text` 伪品牌，所有 SVG 通过安全拒绝规则。
- [ ] 309 个 `lobe.<slug>` 和对应 `ai.<slug>`（除文档化的 full-name compatibility 例外）在完全离线环境返回 self-contained `data:image/svg+xml` style，结果中没有 HTTP(S) URL。
- [ ] 既有 OpenAI/Claude/Gemini/alias/Redis/Lucide 测试不回归；`lobe.anthropic` 精确命中 Anthropic，`ai.anthropic` 保持既有 Claude compatibility behavior。
- [ ] catalog 损坏与 unknown slug 是两种可区分失败；unknown validation 提供确定性建议。
- [ ] 非 AI 图表不触发 catalog load；`icon-resolver.js` 继续通过 offline/narrow-module metadata gate。
- [ ] 五个 file-backed case 的确定性结果齐全；可用 Desktop 上的 preview 非空且通过 structured visual review，缺失外部证据诚实标注。
- [ ] 没有新增 runtime dependency、网络分支、第二套 XML renderer 或 academic runtime copy。

## Out of Scope

- 兼容上游 `aiicons.py` 的 Python CLI、JSON 格式、`--variant` 或 `--size` 参数。
- vendoring 871 个全部 variant；本任务每个品牌只保留一个 canonical SVG。
- 纳入上游 simple-icons CDN supplement 的 18 个通用数据平台；现有 `brand.redis` 继续保留。
- 自动升级 Lobe Icons、运行时下载图标、为品牌图形声明商标权或品牌背书。
- 在本 feature child 中扩写两个 `SKILL.md`、interfaces 或全局 release scorecard；这些由 integration/promotion child 单点收口。
