# Design - 离线 AI 图标目录

## 1. Capability Boundary

本任务对上游 `aiicons` 采用 `replace`：保留“按品牌发现并生成可嵌入 draw.io 图标”的能力，不保留 CDN、Python CLI、variant 参数或运行时 fetch。canonical/offline pipeline 仍是唯一主干。

```text
pinned extracted package + reviewed integrity
  -> deterministic build-ai-icon-catalog
  -> bundled ai-icons.json.gz
  -> lazy ai-icon-catalog loader
  -> icon resolver / catalog search / validation suggestions
  -> self-contained SVG data URI in canonical render
  -> C0 vision-preview + structured visual review
```

## 2. Generated Catalog

固定 schema：

```json
{
  "schemaVersion": 1,
  "source": {
    "package": "@lobehub/icons-static-svg",
    "version": "1.91.0",
    "integrity": "sha512-ZDflEq0uUvAkH4WK4h3qNvvY09ts4OqUb5azD7A0xKfcuYhffGwB1Q/As2RguZYq4Gh4v925CJ8iodiClzc4zw==",
    "license": "MIT",
    "variantOrder": ["color", "brand-color", "base"]
  },
  "icons": [{ "slug": "openai", "variant": "openai", "svg": "<svg ...>...</svg>" }]
}
```

约束：

- `icons` 按 slug ASCII code-unit 排序，禁止 `localeCompare` 和重复。
- 不写 `generatedAt`、本机绝对路径、registry tarball URL 或临时文件名。
- JSON 使用固定字段插入顺序、UTF-8 和一个尾随换行。gzip 固定 level 9、mtime 0、FLG 0、无 filename/comment，并把 OS byte 固定为 255；测试断言十字节 header、完整 bytes 和 SHA-256。
- `variant` 保存来源文件 stem，便于升级 diff；runtime 只暴露 slug 和 SVG。
- catalog 是生成资产，不是手工编辑入口；更新必须经 build tool。

## 3. Generator

`skills/drawio/scripts/tools/build-ai-icon-catalog.js` 接收显式 `--source-dir`、`--integrity` 和 `--output`。网络获取、tarball SRI 核对、安全 tar listing 和解包是开发期供应链步骤，生成器不自己联网，也不从 `node_modules` 猜版本。trust report 同时记录已验证 tarball SRI 与生成器输入；`--integrity` 本身不是 source-dir 的密码学证明。

生成流程：

1. 读取 source `package.json`，要求 package/version/license 精确匹配规划值。
2. 枚举 `.svg` stems，用 longest-first `-text-color`、`-text-xx`、`-text`、`-brand-color`、`-brand`、`-color` suffix 归组，并用 ASCII code-unit 排序。
3. 用修正后的 suffix 规则归并 `-text-color`，再按 `-color`、`-brand-color`、base 选取；要求 871 variants、309 base brands 和 209/1/99 分布，并拒绝重新产生 `civitai-text` / `kwaikat-text` 伪品牌。
4. 校验 SVG root、viewBox、大小边界和拒绝清单；把 root `width="1em" height="1em"` 规范化为数值尺寸，不改写 path/style 语义。
5. 生成稳定 JSON、gzip，重新读取并验证 catalog，再原子替换输出。
6. 打印来源、count、variant distribution、uncompressed/gzip bytes 和 SHA-256，供 trust evidence 使用。

测试使用小型本地 source fixture 验证选择、排序、`-text-color` 归并、拒绝和 byte reproducibility；正式 309 count/provenance 测试读取 checked-in catalog，不依赖网络或临时审计目录。

## 4. Runtime Loader

新增 `skills/drawio/scripts/dsl/ai-icon-catalog.js`，模式与 `shape-catalog.js` 一致但失败语义更严格：

- 模块级 lazy cache；只有 `lobe.*` / `ai.*` 或兼容 AI identifier 才加载。
- load 时校验 schema version、固定 provenance、309 unique slugs 和 SVG string。
- `getAiIcon(slug)` 返回 immutable record 或 `null`；catalog 读取/解析错误抛出 `AI icon catalog ...` 明确错误。
- `searchAiIcons(query, {limit})` 使用 normalized exact/prefix/substring/edit-distance 排名，稳定地以 score + slug 排序。
- 测试通过注入 loader/path 或隔离 helper 覆盖 corrupt/missing data；生产 API 不暴露任意路径读取。

`readFileSync`、`gunzipSync` 和 catalog path 只存在于 loader。`icon-resolver.js` 不直接读文件，保持 `tests/skill-metadata.test.js` 的窄模块契约。

## 5. Resolution Precedence

为避免新 309 slugs 与既有别名互相遮蔽，采用两层规则：

1. full identifier compatibility map 穷举已经公开且需要保持输出的名字：`brand.openai`、bare `openai`、两 namespace 的 `chatgpt`、`open-ai`、`open_ai` 都投影到 `lobe.openai`；只有 `ai.anthropic` 投影到 `lobe.claude`。
2. canonical `lobe.<slug>` exact lookup；`ai.<slug>` 除 full-name 兼容例外外投影到相同 exact slug。
3. exact miss 后才查 slug alias，如 `chatgpt`、`open-ai`、`open_ai`；alias target 也必须存在于 catalog。
4. 仍未命中返回 `null`，validation 调用 `searchAiIcons` 给出最多三个 `lobe.*` 建议。

这使 `lobe.anthropic` 命中来源中的 Anthropic SVG，同时 `ai.anthropic` 保持当前文档化的 Claude 行为。别名只在一个表维护，resolver tests 是其公共契约。

## 6. Search Integration

复用现有 `catalog-search.js` 的输出形状和 CLI，不新增 `aiicons` 命令：

- `search <query> --prefix lobe` 只搜索 309 canonical AI candidates。
- unknown `lobe.*` / `ai.*` 的 library prefix 路径复用同一搜索函数。
- 普通无 prefix search 是否混入 AI 结果由 focused tests 固定；默认建议只在明确 AI namespace 中加入，避免污染 10,446 shape 排名。
- CLI 输出建议使用 `icon: lobe.<slug>`，不输出 SVG 本文或 CDN URL。

## 7. Security, License, and Trust

生成器将 SVG 视为固定供应链输入而非可信模板，拒绝：active script、事件属性、foreignObject、embedded image、DOCTYPE/entity/processing instruction、非本地 href/src、非本地 CSS `url(...)`、missing viewBox、非 SVG root 和超过合理字节上限的单项。仅允许 `#id` fragment 引用以保留 gradient、clipPath、mask、filter 和 currentColor。来源 tarball integrity 在生成前对 bytes 复核，发布资产 hash 在生成后记录。

许可证使用现有 `assets/licenses/lobe-icons-MIT.txt`。后继文档增加商标识别说明。任何 package/version/integrity 变化都是人工审查事件，不由 dependabot 或运行时自动替换 generated asset。

## 8. Visual Evidence and Rework

视觉风险按 SVG feature 分层，不只按品牌知名度抽样。五个 `file-backed fixture`：

1. core/compatibility：OpenAI、Claude、Gemini、Anthropic 与 legacy aliases；
2. gradients：linear + radial gradient；
3. monochrome/currentColor：base/currentColor SVG 在浅色和深色节点；
4. advanced SVG：clipPath、mask、filter；
5. dense CJK RAG/Agent：多品牌节点、长标签、连接线和图例。

确定性检查覆盖全部 309 项：resolver 非空、data URI 可解码、无 HTTP、draw.io XML 可 validate。Desktop 检查使用 C0 `vision-preview`，读取非空 PNG 并记录每个代表性 icon 的可观察证据。发现空白、裁切、错误对比度或标签遮挡时，修复 catalog normalization 或 canonical YAML，然后重新 validate/export/review；preview 不是 canonical source。

## 9. Governed Resource Contract

- `owner`：`skills/drawio` base runtime。
- `review cadence`：每次来源升级或 release packaging 变更时复核；版本不变不自动刷新。
- `input_files`：固定来源 package、generator fixture、五个 file-backed visual fixtures。
- `output contract`：309 unique canonical SVG、self-contained data URI、deterministic search/suggestion、zero runtime network。
- `rollback boundary`：删除 catalog/loader/search branch，并恢复现有三项 embedded Lobe constants；Redis/Lucide 与普通 renderer 不受影响。
- `trust report`：实施时在本 child `research/` 记录 source integrity、generator hash/count/security 输出和 Desktop evidence。
- `reports/output_quality_scorecard.md`：由 integration/promotion child 汇总本 child cases；缺少 provider-backed visual run 时保留 `missing evidence`。

## 10. Skill Information Hierarchy

依据 `writing-great-skills`，309 名称、生成细节和安全表不进入 `SKILL.md`。后继 integration 只增加一个能力族 context pointer；catalog/reference 是单一事实源。步骤的完成条件由 count、hash、offline、validation 和 visual record 共同定义，避免以“图标看起来正常”提前结束。

## 11. Rollback and Residual Risk

- generated asset 与 loader 是独立模块，可整体回滚而不改变 canonical YAML schema。
- `lobe.*` / `ai.*` 仍生成 image style，不改变普通 shape mapping。
- Desktop 对 gradient/mask/filter 的版本差异只能由代表性运行证明；未运行环境保持 `missing evidence`。
- 商标政策和上游图形变化需要人工判断，自动静态扫描不能替代该审查。
