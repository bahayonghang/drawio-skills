# 完整离线 AI 图标目录审计

## 结论

采用完整离线目录，不保留上游运行时 CDN 分支。固定 `@lobehub/icons-static-svg@1.91.0`，从 871 个 SVG variant 确定性选择 309 个真实 base brand 的 canonical SVG，生成 gzip catalog 随 `skills/drawio` 发布。普通 create/edit/export 只读取本地资产，零网络访问。

## 上游行为与替代理由

- `ref/drawio-skill/skills/drawio-skill/scripts/aiicons.py` 通过 manifest 报告 311 个 Lobe family identifier。
- 默认结果引用 unpkg CDN；`--embed` 也需要先联网下载 SVG。
- 上游 family regex 没有整体识别 `-text-color`，因此把 `civitai-text-color` 和 `kwaikat-text-color` 分别误算为 `civitai-text`、`kwaikat-text` 两个新“品牌”。修正 suffix 后固定包有 309 个真实 base brand。
- 上游还为 18 个数据平台维护 simple-icons CDN supplement。该 supplement 不属于 309 个 Lobe AI 品牌目录；已有 `brand.redis` 保持兼容，其他通用品牌扩展另行规划。
- 因此本仓处理类型是 `replace`：保留品牌搜索与可嵌入图标的用户价值，替换网络与 Python CLI 边界。

## 固定来源

| 字段               | 已验证值                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| package            | `@lobehub/icons-static-svg`                                                                       |
| version            | `1.91.0`                                                                                          |
| license            | MIT                                                                                               |
| registry integrity | `sha512-ZDflEq0uUvAkH4WK4h3qNvvY09ts4OqUb5azD7A0xKfcuYhffGwB1Q/As2RguZYq4Gh4v925CJ8iodiClzc4zw==` |
| tarball size       | 718,623 bytes                                                                                     |
| unpacked files     | 873                                                                                               |
| unpacked size      | 2,248,774 bytes                                                                                   |
| SVG variants       | 871                                                                                               |

现有许可证副本位于 `skills/drawio/assets/licenses/lobe-icons-MIT.txt`。品牌图形仍是各权利人的商标，只用于产品/服务识别；MIT 覆盖 Lobe Icons 代码与图形集合的许可，不表示品牌方背书。

## Canonical Variant 选择

先把 `-text-color`、`-text[-locale]`、`-brand[-color]`、`-color` 作为完整 variant suffix 归回 base brand，再按以下顺序选择一个文件：

1. `<slug>-color.svg`
2. `<slug>-brand-color.svg`
3. `<slug>.svg`

本机审计结果：

| 选择分支       | 品牌数 |
| -------------- | -----: |
| `-color`       |    209 |
| `-brand-color` |      1 |
| base           |     99 |
| 总计           |    309 |

309/309 个真实 base brand 都有结果，所选原始 SVG 合计 740,310 bytes。一个带最小 provenance 的 compact JSON 原型为 756,945 bytes，gzip level 9 为 245,136 bytes；最终字节数取决于正式 schema，因此它是容量证据，不是发布 hash。

## 静态安全与渲染风险

对 309 个所选 SVG 的扫描结果：

- `<script>`：0
- `on*=` 事件属性：0
- `<foreignObject>`：0
- HTTP(S) `href` / `src` / `url(...)`：0
- embedded `<image>`：0
- 缺失 `viewBox`：0

渲染特征不是安全通过的替代证据：58 个使用 linear gradient，11 个使用 radial gradient，2 个使用 clipPath，2 个使用 mask，2 个使用 filter，116 个使用 `currentColor`；309 个都使用 `1em` intrinsic size。生成器需要规范化 intrinsic size，并以这些特征选择 Desktop/vision fixtures，不能只抽查 OpenAI、Claude、Gemini 三个简单图标。

## 本仓约束

- `tests/skill-metadata.test.js` 禁止在 `icon-resolver.js` 直接出现 `readFileSync`、动态 require、CDN base 或 HTTP image。
- `skills/drawio/scripts/dsl/shape-catalog.js` 已证明独立 lazy loader + bundled `.json.gz` 是本仓接受的资源边界。
- 因此新增 `ai-icon-catalog.js` 持有读取、gunzip、schema/count 检查与缓存；`icon-resolver.js` 只做 namespace、alias 和 data URI 编排。
- catalog 缺失、损坏或 count/provenance 不匹配必须显式失败；未知品牌与损坏 catalog 不得都退化成同一个 `null`。

## 计划资产与证据

- generated asset：`skills/drawio/assets/catalog/ai-icons.json.gz`
- loader：`skills/drawio/scripts/dsl/ai-icon-catalog.js`
- deterministic generator：`skills/drawio/scripts/tools/build-ai-icon-catalog.js`
- runtime dependency：无新增 npm 包、无 CDN、无 MCP、无 browser
- focused evidence：count/provenance/integrity、安全拒绝、byte reproducibility、alias/unknown suggestion、代表性 Desktop PNG 和 C0 structured visual review
- provider-backed visual review 不可用时保留 `missing evidence`，不得用单元测试或 recorded fixture 冒充

## 复核命令与边界

来源 metadata 通过 `npm view @lobehub/icons-static-svg@1.91.0 ... --json` 核对；tarball 与解包审计在临时目录完成。临时文件不是实施输入的长期事实源，正式刷新流程必须从固定 package/version/integrity 重新获取并由生成器复验。

本研究不授权升级来源版本。任何版本变更都要重新计算 family/variant、安全特征、视觉覆盖和 package hash，并进行人工 diff 审查。
