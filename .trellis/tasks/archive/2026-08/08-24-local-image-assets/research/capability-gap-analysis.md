# 能力缺口代码定位

2026-08-24 记录。来源：论文任务 `thesis/.trellis/tasks/08-24-recreate-chapter2-fig2-1/offline-image-capability-evidence.md` 的 5 条探针，逐条落到本仓库代码。

## 1. 已有机制（可直接复用）

| 机制           | 位置                                                  | 说明                                                                                                                                                           |
| -------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 图片样式前缀   | `skills/drawio/scripts/dsl/icon-resolver.js:9`        | `shape=image;html=1;imageAspect=0;aspect=fixed;verticalLabelPosition=bottom;verticalAlign=top;image=`                                                          |
| 唯一图片接入点 | `skills/drawio/scripts/dsl/spec-to-drawio.js:1090`    | `resolveImageIconStyle(iconName)` 返回非空即替换形状样式，随后拼装 `whiteSpace/fillColor/strokeColor/fontColor/fontSize/fontFamily/labelBackgroundColor/align` |
| data URI 编码  | `icon-resolver.js:svgDataUri`                         | 现用 percent-encoding（仅 SVG）；本地二进制需改用 base64                                                                                                       |
| 元数据载体     | `spec-to-drawio.js:1371` `canonicalCell`              | `<UserObject label="" dataPageId dataObjectId dataObjectKind>` 包装 mxCell，仅在多页 `options.canonicalMetadata` 下启用                                        |
| 整页栅格化拦截 | `spec-to-drawio.js:3507` `collectFullPageImageErrors` | 硬错误：宽 ≥90% 且高 ≥90% 且面积 ≥80% 且贴近原点。在 `validateXml`（`:3670`）中调用                                                                            |

结论：渲染侧的图片单元产出、样式协同、反截图策略都已存在。缺口仅是「本地文件 → 图片样式」的解析分支与对应往返。

## 2. 五条探针的失败位置

| 探针                           | 现象                                              | 代码位置                                                        | 判定                                                                    |
| ------------------------------ | ------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `style.shape` / `style.image`  | strict 下 exit 1，报 "unknown key(s) ... ignored" | `spec-to-drawio.js:2322` `KNOWN_NODE_STYLE_KEYS`                | 正确行为，不改。参考文档中的 `style.image` 示例与实现不一致，属文档缺陷 |
| `icon` 填本地路径              | 正则拒绝                                          | `spec-to-drawio.js:3367`、`assets/schemas/spec.schema.json:287` | 正则是注入防线，`tests/security.test.js:49`/`:126` pin 住，不放宽       |
| `icon` 填自定义名              | 报 unknown shape / 空框                           | `spec-to-drawio.js:2208` `validateShapeReferences`              | 需要对 `node.image` 节点跳过                                            |
| `raster-extraction` 拒 `image` | `ADAPTER_PARSE` unknown field                     | `scripts/adapters/raster-extraction.js`                         | 既定合同，见 §3                                                         |
| `.drawio` import 丢图          | 图片单元退化为普通节点                            | `scripts/dsl/drawio-to-spec.js:182` `inferIconFromStyle`        | 真正的往返缺口，只识别 `resIcon`/`shape`/`prIcon`                       |

## 3. 既有合同对设计的硬约束

从 `.trellis/spec/drawio-skill/` 提取：

- **`raster-replicate-adapter.md`**：`Never accept raw style, image data, arbitrary links, HTML fields, ...` — 适配器边界明文排除 image data。新能力不得走该适配器，探针 4 的失败是设计意图。
- **`skill-doc-and-release-contract.md`**：
  - mandatory runtime 只能解析到 `skills/drawio` 内的相对文件或 `node:` 内置模块，安装后不得依赖 `NODE_PATH` / 包管理器命令 / 网络。**这条排除了 `sharp` 等图像编解码依赖**，因此像素缩放/裁剪不在 skill 内实现。
  - 四个根测试对两个 `SKILL.md` 做字面量、结构正则、邻近窗口断言；`tests/drawio-academic-skill.test.js` 对 overlay `references/` 是 13 文件 `assert.deepEqual` 白名单。
  - 发布 zip 内容 == `git ls-files`，新文件须先提交。
- **`multi-page-foundation.md`** + `document-spec.js:152`：bundle 有独立规范化路径，且已有「不得混用」的显式拒绝写法可参照。
- **`semantic-types.md`**：新增语义类型需要同步所有 `assets/themes/*.json`，否则静默回退。本任务不新增语义类型，图片节点复用既有 fill/stroke/font 解析，因此不触发该检查表——实施时需实测确认。

## 4. 体积量级（论文场景实测）

`thesis/ref/plans/chapter2/fig2-1-refactor/materials/` 共 11 张 PNG，14.4 MB：

| 文件                                     | 大小                  |
| ---------------------------------------- | --------------------- |
| 烟囱.png                                 | 2234 KB（被引用两次） |
| 回转窑及窑系统散热风机.png               | 1850 KB               |
| 离心风机.png                             | 1540 KB               |
| 袋式除尘器.png                           | 1504 KB               |
| 增湿塔.png                               | 1469 KB               |
| 分解炉及喂煤系统.png                     | 1332 KB               |
| 窑尾烟室.png                             | 1307 KB               |
| 原料均化库_生料转子秤_入窑斗式提升机.png | 1106 KB               |
| 篦冷机_破碎机_熟料库.png                 | 976 KB                |
| 窑头罩及窑头喂煤系统.png                 | 768 KB                |
| 五级旋风预热器.png                       | 612 KB                |

data URI 在每个引用它的单元中各嵌一份。精确复核见 §6。

渲染尺寸对比：画布 1200×680，节点约 120×160 px；300 dpi 导出对应约 375×500 px。源图 1024×1536 约有 2.7× 像素冗余。

## 5. 未决验证点

- `UserObject` 自定义属性在 draw.io 编辑保存后的保留行为。这是往返载体选择的前提；推翻则改用样式串自定义键。
- `UserObject@label` 作为标签载体在 draw.io Desktop 中的实际渲染行为。现有多页路径写 `label=""` 并保留 `mxCell@value`，本任务的 asset 包装计划反过来。
- 图片节点是否真的完全不需要 `assets/themes/*.json` 改动（按 `semantic-types.md` 的 grep 配方实测）。
- draw.io 对 data URI 形式 SVG 的处理模式与外部资源行为。
- Windows 符号链接逃逸测试在当前权限下能否稳定运行。
- `postprocess` 的 `mermaid` / `explain` / `html` 三个投影对图片节点的实际降级行为。
- 2× 超采样系数与「低于 1.5 会软边」的视觉结论目前无测量证据。

## 6. 规划复核期间新增的核验（2026-08-24）

一轮独立复核提出 12 条 findings，逐条核对代码后确认 11 条成立。以下是对设计有结构性影响的部分。

### 6.1 顶层字段会在到达 renderer 前被剥离（阻断级）

`cli.js:333` 对所有 YAML 输入调用 `parseDocumentYaml`。扁平规范走 `normalizeDocumentSpec` 的 `legacy-single-page` 分支，该分支硬编码重建对象：

```js
// document-spec.js:193
const spec = { meta: value.meta || {}, nodes: value.nodes || [], edges: value.edges || [], modules: value.modules || [] }
```

同形状的剥离共四处，全部必须改：`document-spec.js:169`（`validateDocumentSpec` legacy 分支）、`:193`（`normalizeDocumentSpec`）、`:37`（`pageSpec`）、`postprocess/input.js:13`（同名 `pageSpec` 副本）。

导出侧无此问题：`serializeSpecYaml`（`runtime/artifacts.js:121`）是 `yaml.dump` 直通，无白名单。`serializeDocumentSpecYaml` 有白名单但只作用于多页。

### 6.2 `--strict` 的实际语义

```js
// spec-to-drawio.js:3049
const strictFailures = options.strict ? allDiagnostics.filter((item) => item.level !== 'info') : errors
```

`warning` 在 strict 下即失败。因此护栏必须用 `info` / `warning` / `error` 三级词汇描述，「warning / strict-error」两栏写法会让不同阈值在退出行为上冗余。

### 6.3 导出目录可被重定向

`cli.js:505` 在 `--sidecar-dir` 存在时把 `specPath` 重定位到该目录。任何「相对规范文件」的路径约定都会随输出位置改变语义。结论：`assets.<id>.path` 改为一律相对 asset root。

### 6.4 `bounds` 字段名

`spec.schema.json:390` 与 `spec-to-drawio.js:3130` 的 `validateBounds` 都要求 `x` / `y` / `width` / `height`。规划初稿沿用论文草稿的 `w` / `h`，会立即校验失败。

### 6.5 版本同步面

`scripts/version-sync.js` 的同步目标是 `package.json`、`package-lock.json`、两个 `SKILL.md` frontmatter、`skills/drawio/evals/evals.json`。**不含** `skills/drawio-academic-skills/evals/evals.json`，而该 skill 的 `evals/README.md:3` 要求其 `version` 跟随 `SKILL.md`。

`justfile:176` 的 `ci: version-sync version-check lint test docs-build` 第一步是写操作，会在版本面未同步时产生规划外 diff。

### 6.6 体积量级精确复核

| 口径 | 字节 | MiB |
| --- | --- | --- |
| 11 个唯一素材 | 15,045,957 | 14.349 |
| 引用加权（`烟囱.png` 2,287,044 计两次） | 17,333,001 | 16.530 |
| base64 后 | 约 23,110,668 | 约 22.040 |

**加权总量低于 24 MiB 阈值。** 规划初稿称「22 MB 会命中 24 MB 上限」不成立。实际触发失败的是 `烟囱.png` 单图 2,287,044 B = 2.181 MiB，超过 2 MiB 的 `warning` 阈值，在 `--strict` 下失败。11 张中只有这一张超过 2 MiB。

压缩决定本身仍然正确，但正当性来自 2.7× 像素冗余与打印质量，不来自总量超限。

### 6.7 `postprocess` 合同要求透传而非拒绝

`postprocess.md` §3：「Preserve page order, (pageId, objectId), links, adapter identity, icons, stencils, geometry, and academic metadata unless the selected mutator owns a bounded field.」`assets` 不被任何 mutator 拥有，因此正确行为是原样透传，而不是显式拒绝。

### 6.8 SVG 类型判定不成立

前缀嗅探 `<svg` / `<?xml` 无法证明文件是 SVG：`<?xml version="1.0"?><root/>` 会通过而它不是 SVG；带 BOM、注释或 DOCTYPE 的合法 SVG 又可能被误拒。正确做法需解析 XML 根元素与命名空间，且 SVG 可携带脚本、事件属性、`foreignObject` 与外部 URL 引用，需要独立的内容信任边界。结论：v1 只支持 PNG / JPEG，SVG 显式推迟。

### 6.9 复核中未采纳的一条

复核建议按 qiaomu 的先例发现流程做一轮技能目录检索。本任务是既有 skill 的能力扩展而非技能重设计，通用目录检索价值有限；改为窄范围核验 draw.io 自身的原生图片表达（见 design.md §12），因为那才是往返载体与 SVG 决定的权威依据。
