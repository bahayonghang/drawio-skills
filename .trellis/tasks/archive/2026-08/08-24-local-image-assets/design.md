# 技术设计：本地图片资产能力

## 1. 边界

改动范围限于 `skills/drawio`（中性能力）与 `skills/drawio-academic-skills`（审计门），加上根 `tests/`、`docs/`、`.trellis/spec/drawio-skill/`。不改论文仓库，不改 `raster-extraction` 适配器，不改 `VALID_ICON`，不新增运行时依赖。

四条既有合同是约束而非可协商项：

- `raster-replicate-adapter.md` — 适配器边界明文禁止 image data，新能力走 canonical YAML。
- `skill-doc-and-release-contract.md` — mandatory runtime 只依赖 `skills/drawio` 内文件与 `node:` 内置模块，排除任何图像编解码库。
- `multi-page-foundation.md` — bundle 有独立规范化路径，v1 不承载 `assets`。
- `postprocess.md` — 未被 mutator 拥有的字段必须保留，因此 postprocess 是透传而非拒绝。

## 2. 所有权链（本设计的第一风险点）

`cli.js:333` 对所有 YAML 输入调用 `parseDocumentYaml`。扁平规范经 `normalizeDocumentSpec` 的 `legacy-single-page` 分支处理，该分支**硬编码重建**对象：

```js
// document-spec.js:193
const spec = { meta: value.meta || {}, nodes: value.nodes || [], edges: value.edges || [], modules: value.modules || [] }
```

顶层 `assets` 在此消失。同形状的剥离共有四处，全部必须改：

| 位置 | 函数 | 作用 |
| --- | --- | --- |
| `document-spec.js:169` | `validateDocumentSpec` legacy 分支 | 传给 `validateSpec` 的对象 |
| `document-spec.js:193` | `normalizeDocumentSpec` legacy 分支 | 传给 renderer 的 `spec` |
| `document-spec.js:37` | `pageSpec` | 多页页面归一化 |
| `postprocess/input.js:13` | `pageSpec`（同名副本） | postprocess 归一化与重封装 |

`serializeSpecYaml`（`runtime/artifacts.js:121`）是 `yaml.dump` 直通，无白名单，因此导出侧不需改动。`serializeDocumentSpecYaml` 有白名单，但只作用于多页，而多页按 §8 拒绝 `assets`，两者不冲突。

**验收锁：** AC1 要求一条直接断言 `parseDocumentYaml(text).spec.assets` 非空的单元测试，把所有权链首环钉死，避免后续重构再次静默剥离。

## 3. 数据模型

```yaml
assets:
  chimney:
    path: ref/plans/chapter2/fig2-1-refactor/materials-render/烟囱.png   # 相对 asset root
    sha256: 2FC7D9F2E8A4FE0631EDB781D4CF2EFD4D42D884F62344EA9F2967BF834ABAA7
    raster_reason: 复杂工业设备外形，无法用原生图形可靠重建
    atomic_raster_unit: true
    contains_reconstructable_content: false
    decomposition_note: 设备名称与测点标签已拆为原生文本对象
nodes:
  - id: kiln_head_chimney
    label: 窑头烟囱
    image: chimney
    bounds: { x: 980, y: 120, width: 90, height: 135 }
```

- asset id 复用既有 ID 规则 `^[A-Za-z][A-Za-z0-9_-]*$`，可安全进入 XML 属性。
- **`bounds` 用 `x/y/width/height`**，与 `spec.schema.json:390` 和 `validateSpec` 的 `validateBounds`（`spec-to-drawio.js:3130`）一致。不使用 `w`/`h`。
- `path` 是唯一的字节来源，必填。不存在 `data` 字段——外来图片走 §7 的落盘路径。
- `sha256` 可选；提供时在渲染期比对，不符为硬错误。
- 四个审计字段在 base 层可选、只做类型校验；`academic-paper` profile 下由 §9 升级为必填。
- `node.image` 与 `node.icon` 互斥，同时出现为硬错误。

## 4. 路径约定：一律相对 asset root

`assets.<id>.path` **相对 asset root**，不相对规范文件。asset root 默认 `process.cwd()`，`--asset-root <dir>` 可覆盖。

这条约定解决了 `--export-spec` 的输出目录可被 `--sidecar-dir` 重定向（`cli.js:505`）带来的语义漂移：路径字符串在 YAML、XML 载体、导出规范三处完全一致，任何位置的输出都不需要重定基。论文场景从仓库根运行时，路径形如 `ref/plans/.../materials-render/烟囱.png`，不含 `..`。

stdin 输入（`input === '-'`）无规范文件上下文；`assets` 出现时报错，提示改用文件输入或显式 `--asset-root`。

## 5. 路径安全与类型判定

顺序固定，任一步失败即硬错误并附 `assets.<id>.path` 字段路径：

1. 拒绝绝对路径（`path.isAbsolute` 与 Windows 盘符形式）。
2. 相对 asset root 解析。
3. `fs.realpathSync` 跟随符号链接；asset root 自身也取 realpath。
4. 包含性检查：按路径分隔符边界判定前缀，不用裸 `startsWith`。
5. 扩展名白名单：`.png` / `.jpg` / `.jpeg`。
6. `statSync` 必须是普通文件。
7. 魔数比对：PNG `89 50 4E 47 0D 0A 1A 0A`，JPEG `FF D8 FF`。与扩展名不符为硬错误。
8. `sha256` 若声明则比对。

**v1 不支持 SVG。** 理由有二：一是前缀嗅探不能证明类型——`<?xml version="1.0"?><root/>` 会通过 `<?xml` 判断而它不是 SVG，反之带 BOM/注释/DOCTYPE 的合法 SVG 会被误拒；正确做法要解析 XML 根元素与命名空间，属于新的解析面。二是 SVG 可携带脚本、事件属性、`foreignObject` 与外部 URL 引用，base64 包装不构成内容信任边界，需要独立的允许/拒绝策略。两者都超出本任务范围，因此显式拒绝并提示 v1 不支持，而不是含糊接受。

`..` 允许出现在书写形式中，安全性由第 3–4 步承担；表层拒 `..` 可被符号链接绕过，不作为防线。

Windows 上符号链接测试需要 Developer Mode 或管理员权限；不可用时该用例标注 `missing evidence`，不改写断言使其虚假通过。

## 6. 渲染路径

新增 `skills/drawio/scripts/dsl/asset-resolver.js`，与 `icon-resolver.js` 同构：

```js
export function resolveAssetImageStyle(assetId, assets, { assetRoot })
// -> { style, resolvedPath, bytes, sha256, mime } | null
```

复用 `icon-resolver.js:9` 的 `IMAGE_ICON_STYLE_PREFIX`，把字节编码为 `data:<mime>;base64,<...>`。

接入点是 `spec-to-drawio.js:1090` 所在的 `generateNodeStyleWithSpec` 分支：

```
node.image 存在 → assetImageStyle
否则 → 现有 resolveImageIconStyle(iconName) → resolveIconShape(iconName)
```

命中后 `whiteSpace/fillColor/strokeColor/fontColor/fontSize/fontFamily/labelBackgroundColor/align` 的拼装完全复用现有 image-icon 分支代码。因此图片节点仍从主题取 fill/stroke/font，**不需要改任何 `assets/themes/*.json`**，不触发 `semantic-types.md` 的主题覆盖检查表（实施时按该文档的 grep 配方实测确认）。

`validateShapeReferences`（`:2208`）对 `node.image` 节点 `continue`。`KNOWN_NODE_STYLE_KEYS`（`:2322`）**不改**——本设计不经由 `node.style`。

## 7. 往返载体与外来图片

### 7.1 载体

复用既有 `UserObject` 机制（`spec-to-drawio.js:1371`），新增同层的 `assetCell` 包装，逐单元携带 R3 定义的全部六个字段：

```xml
<UserObject label="窑头烟囱"
            dataAssetId="chimney"
            dataAssetPath="ref/plans/.../materials-render/烟囱.png"
            dataAssetSha256="2FC7D9F2..."
            dataAssetRasterReason="复杂工业设备外形，无法用原生图形可靠重建"
            dataAssetAtomic="true"
            dataAssetReconstructable="false"
            dataAssetDecomposition="设备名称与测点标签已拆为原生文本对象">
  <mxCell id="7" value="" style="shape=image;...;image=data:image/png;base64,..." vertex="1" parent="1">
    <mxGeometry .../>
  </mxCell>
</UserObject>
```

只带 `id/path/sha256` 不足以满足 R3：审计字段丢失后，`academic-paper` profile 的图在往返后再次 strict 渲染会因 §9 的门失败。因此六个字段全带。

同一 asset 被多次引用时各载体重复出现；导入取首次出现并校验其余一致，不一致为硬错误（素材被局部手工改过的信号）。

asset 单元把 label 放在 `UserObject@label`、`mxCell@value` 置空，这是 draw.io 的标准约定；不改动多页路径现有的 `label=""` 行为。§8 保证 bundle 与 assets 不共存，两个包装器不会嵌套。

### 7.2 导入两条分支

改 `drawio-to-spec.js`，`shape=image` 分支在 `inferIconFromStyle`（`:182`）之前短路：

| 输入 | 行为 |
| --- | --- |
| UserObject 带 `dataAssetId` | 完整还原六个字段与 `node.image`，label 取自 `UserObject@label` |
| 裸 `shape=image`（外来文件、draw.io 手工粘贴） | 需要 `--extract-assets <dir>`：解码 data URI 字节落盘到该目录，生成稳定 id 与 `path`，产出正常的 `assets` 条目。未提供该 flag 时报错，消息中给出该 flag |

第二条既满足「不静默丢图」，又不引入 `data` 字段——数据模型保持单一 `path` 来源。落盘目录必须显式给出，不默认写盘。文件名冲突时以内容 sha256 前缀去重。

## 8. postprocess 与多页

**postprocess 透传。** `postprocess.md` 要求保留未被 mutator 拥有的字段，因此 `assets` 在 `postprocess/input.js:13` 的 `pageSpec` 与重封装路径中原样携带。canonical 变换（`relabel` / `restyle` / `heatmap`）不触碰 `assets`，各有往返保留用例。投影（`mermaid` / `explain` / `html`）的图片降级行为在实施时实测并写入文档——`html` 是自包含输出，data URI 理论上可直接嵌入；`mermaid` 无图片语义必然降级。实测结果决定文档措辞，不预先断言。

**多页拒绝。** `classifyDocumentSpec` / `normalizeDocumentSpec` 在 bundle（`schemaVersion: 1` + `pages`）中发现顶层或页内 `assets` 时抛 `MULTI_PAGE_INVALID`，字段路径指向 `assets` 或 `pages[i].assets`，消息说明 v1 只在扁平规范支持。参照 `document-spec.js:152` 现有的混用拒绝写法。

## 9. 体积护栏

用仓库既有三级诊断词汇。`spec-to-drawio.js:3049` 的 `strictFailures = options.strict ? allDiagnostics.filter(item => item.level !== 'info') : errors` 决定了：`warning` 在 strict 下即失败，`error` 始终失败，`info` 从不失败。

统计口径：**引用次数加权的源字节总和**（同一 asset 被引用两次计两次，因为 XML 中确实内联两份），在 base64 编码前统计。单位 MiB。

| 条件 | 级别 | 非 strict | strict |
| --- | --- | --- | --- |
| 单 asset > 2 MiB | `warning` | 通过并告警 | 失败 |
| 单 asset > 8 MiB | `error` | 失败 | 失败 |
| 引用加权总量 > 24 MiB | `error` | 失败 | 失败 |

边界用例取恰好阈值与阈值 +1 B 两侧，断言级别与退出码，不只断言消息文本。

论文场景实测代入：11 个唯一素材 15,045,957 B（14.349 MiB）；`烟囱.png` 2,287,044 B 二次引用后加权总量 17,333,001 B（16.530 MiB）；base64 后约 22.040 MiB。**加权总量低于 24 MiB，不触发总量 error。** 实际触发的是 `烟囱.png` 单图 2.181 MiB 超过 2 MiB 的 `warning`，在 strict 下失败。压缩的正当性来自 §11.1 的 2.7× 像素冗余，不来自总量超限。

既有 `collectFullPageImageErrors`（`:3507`）不改，asset 产出的单元同样经过 `validateXml`。

## 10. 分层：base 能力 vs overlay 审计门

- **Base**：`assets` 注册表、`node.image`、data URI 内联、往返、路径安全、体积护栏、审计字段类型校验。
- **Overlay**：`validateAcademicProfile` 中增加 `academic-paper` 门——每个被引用 asset 需有非空 `raster_reason`、`atomic_raster_unit === true`、`contains_reconstructable_content === false`。

门实现放在 base 的 `validateAcademicProfile` 内（与现有 academic 检查同址），overlay 侧只增文档与 eval，不复制运行时，符合 Overlay Resource Boundary。

## 11. 素材预处理契约

### 11.1 长边目标的推导规则

```text
节点渲染长边(px) = 节点画布长边(px) × (导出 DPI / 96)
素材长边目标(px) = 节点渲染长边(px) × 2        # 2× 超采样
```

论文场景代入：节点约 120×160 px，画布 1200×680，导出 300 dpi → 缩放 3.125× → 节点渲染约 375×500 px → 素材长边目标 **1000 px**。源图 1024×1536 缩到 667×1000，像素量降至 0.42×。

2× 超采样系数是工程惯例取值（`imageAspect=0;aspect=fixed` 会按节点框拉伸，论文按整页宽度还会再缩一次，需要余量）。「低于 1.5 会软边」是经验判断，**没有本轮测量证据支撑**，实施时按 §11.4 的人工判定环节实测后再决定是否写入文档。

### 11.2 质量约束

分两类，证据不混记。

可自动断言：

| 约束 | 断言方式 |
| --- | --- |
| 保留 alpha 通道 | 输出 `Image.mode == 'RGBA'` |
| 长边符合推导值 | `max(size) == LONG_EDGE`（或源图本就更小时不放大） |
| 字节下降 | `dst_bytes < src_bytes` |
| 审计双端完整 | `src_sha256` 与 `dst_sha256` 均非空 |
| 重采样算法 | 调用参数为 `Image.LANCZOS` |
| 无损保存 | 输出为 PNG 且 `optimize=True`；不产出 JPEG/WebP |

只能人工判定（单列记录，注明查看器、查看倍率、判定人，不计入自动断言分母）：

| 约束 | 判定方式 |
| --- | --- |
| 透明边缘无白边 | 在 300 dpi 导出 PNG 上按 100% 查看透明区边界 |
| 无可见锯齿与振铃 | 同上 |

### 11.3 配方（文档交付物）

工具为 Python + Pillow，由用户在 CLI 之外执行。**不使用 `convert`**：在 Windows 上 `convert` 解析到 `C:\WINDOWS\System32\convert`，是 FAT→NTFS 转换工具，不是 ImageMagick。

执行前先做可用性预检；Pillow 缺失时如实报告并停止，不静默安装、不伪报通过：

```bash
python -c "import PIL; print('Pillow', PIL.__version__)"
```

```python
from PIL import Image
import hashlib, pathlib

LONG_EDGE = 1000  # 按 11.1 推导

def sha256_of(p: pathlib.Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest().upper()

def compress(src: pathlib.Path, dst: pathlib.Path) -> dict:
    src_sha = sha256_of(src)
    src_bytes = src.stat().st_size
    with Image.open(src) as im:
        src_size = im.size
        im = im.convert('RGBA') if im.mode != 'RGBA' else im.copy()
    scale = LONG_EDGE / max(im.size)
    if scale < 1:
        im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    dst.parent.mkdir(parents=True, exist_ok=True)
    im.save(dst, 'PNG', optimize=True)
    return {
        'src_size': src_size, 'dst_size': im.size,
        'src_bytes': src_bytes, 'dst_bytes': dst.stat().st_size,
        'src_sha256': src_sha, 'dst_sha256': sha256_of(dst),
        'mode': im.mode,
    }
```

源目录只读打开，压缩产物写入独立目录（约定名 `materials-render/`），**不覆盖、不移动、不重命名源文件**，源目录作为归档保留。配方文档把这条写成硬要求而非建议。

本任务自身的冒烟产物写 `.drawio-tmp/asset-smoke/materials-render/`；`.drawio-tmp/` 已在 `.gitignore` 与打包 denylist 中。

### 11.4 审计闭环

每张图记录 before/after 的尺寸、字节、`sha256` 双端，写入任务 `research/`。压缩后的 `sha256` 填进 `assets.<id>.sha256`，由 §3 的渲染期比对守护。

§9 的超限错误信息带上本配方文档路径，形成「报错 → 配方 → 重跑」闭环。

## 12. 先例核验（窄范围只读）

核实对象是 draw.io 自身，不是技能目录检索：

- draw.io 对嵌入图片写出的原生样式键与 data URI 形态；
- `UserObject` 自定义属性在 draw.io 编辑保存后的保留行为——这是 §7.1 载体选择的前提；
- draw.io 对 data URI 形式 SVG 的处理模式与外部资源行为——用于验证或推翻 §5 的 SVG 推迟决定。

结论写入 `research/drawio-native-image-format.md`。未能核实项标注 `missing evidence`，不以推测替代。若核验推翻 `UserObject` 属性保留假设，回退方案是把六个字段编码进样式串的自定义键（draw.io 保留未知样式键），并在设计中记录该变更。

## 13. 文档、版本与测试触点

`SKILL.md` 措辞被四个根测试 pin 住，改动前先建断言映射（模板：`.trellis/tasks/archive/**/07-16-skill-audit-optimization/research/policy-assertion-map.md`）。`tests/drawio-academic-skill.test.js` 对 overlay `references/` 是 13 文件 `assert.deepEqual` 白名单——新增参考文档优先放 base `references/` 以避开该断言。frontmatter `description` 不改。

版本同步面（复核后完整清单）：

| 文件 | 由 `version-sync.js` 覆盖 |
| --- | --- |
| `package.json` | 是 |
| `package-lock.json`（root + `packages[""]`） | 是 |
| `skills/drawio/SKILL.md` frontmatter | 是 |
| `skills/drawio-academic-skills/SKILL.md` frontmatter | 是 |
| `skills/drawio/evals/evals.json` | 是 |
| `skills/drawio-academic-skills/evals/evals.json` | **否** — 其 `evals/README.md:3` 要求跟随 SKILL.md，需手工同步或扩展脚本 |

`justfile:176` 的 `ci: version-sync version-check lint test docs-build` 第一步是**写操作**。实施收尾运行 `just ci` 后 `git status --short` 不得出现规划外 diff。

eval 证据按 `skills/drawio/evals/README.md` 的合同：在 `evals.json` 新增具名 case（prompt + 逐条断言），运行后保存逐断言明细，再向 `darwin-results.tsv` 追加分数行。只追加分数行不构成证据。

## 14. 兼容性与回滚

- 不含 `assets` 的既有规范行为完全不变：所有新代码路径以 `node.image` 或顶层 `assets` 存在为前提。
- `references/examples/*.yaml` 不改，回归要求全部仍通过 `--validate`。
- 回滚粒度：新增文件可整体删除；对 `spec-to-drawio.js` / `drawio-to-spec.js` / `document-spec.js` / `postprocess/input.js` / `cli.js` 的改动均为新增分支，恢复到分支前状态即可，无数据迁移。
- 版本号走 minor，按 §13 的完整清单同步。skill 侧 `CHANGELOG.md` 的 `## 2.7.0 (2026-07-14)` 段落被 `tests/palette-skill-policy.test.js` pin 住，只增不改。
