# 设计：未知 stencil 校验闭环强化

> 2026-07-14 修订：吸收 Codex 审阅——error 聚合通道不存在，本设计定义新契约；aspect=fixed 改修生成路径。

## 0. 已验证事实

- `validateShapeReferences()`（`spec-to-drawio.js:2173`）返回 `string[]`；调用点（:2932）与其他九个 validate* 的结果合并进 `allValidationWarnings`，仅 console.warn + `--strict` 时统一抛错 + `returnWarnings` 时包装为 `{level:'warning', message}`。
- 生成样式实测：`aws.ec2` → `shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.ec2;html=1;…`，**无 `aspect=fixed`**（compound 分支 :1136-1141）。
- `style.shape` 不进入最终样式（Codex 探针），"手写透传"检查无输入路径。

## 1. 新校验契约

```
validateShapeReferences(spec, { catalog, suggest }) → { errors: string[], warnings: string[] }
```

- 其余九个 validate* 不改签名（仍返回 string[] 并入 warnings 通道）。
- 调用点改造（spec-to-drawio.js 主流程）：

```
const shapeResult = validateShapeReferences(spec)          // {errors, warnings}
const allValidationWarnings = [...其余九项, ...shapeResult.warnings]
const validationErrors = options.allowUnknownShapes
  ? []                                                     // 未知项降级并入 warnings
  : shapeResult.errors
// allowUnknownShapes 时把 shapeResult.errors 以 warning 文案回落进 allValidationWarnings
```

- **抛错顺序**：validationErrors 非空 → 无论 strict 与否，console.error（非 silent）后抛聚合 Error（在 buildXml 之前，保证"不产出文件"）；再走既有 strict-升级-warnings 逻辑。CLI 捕获后退出非 0（沿用既有异常路径，无需新机制）。
- **returnWarnings 兼容**：返回的 `warnings` 数组条目结构不变；error 条目以 `{level:'error', message}` 追加。注意：errors 会先抛出，所以 `returnWarnings` 拿到 error 条目仅发生在 `allowUnknownShapes` 降级……为使程序化调用方也能拿到结构化 errors，聚合 Error 对象上挂 `err.validationErrors = [...]`（既有 catch 方不受影响）。
- 错误文案（保留被测试断言的句式，一次列全）：

```
Spec validation failed: 2 unknown stencil reference(s) (would render as an empty box in draw.io Desktop):
  • Node "n1": "mxgraph.aws4.s3_bucket_magic" — did you mean: aws.s3, aws.s3_glacier, aws.s3_on_outposts?
  • Node "n4": "mxgraph.kubernetes.podd" — did you mean: k8s.pod, k8s.deploy, k8s.pv?
Run `node scripts/cli.js search <keyword>` to find real stencil names, or pass --allow-unknown-shapes to downgrade.
```

  建议名经 `icon-mappings.specSyntaxFor()` 反查为 spec 写法（用户应改 YAML 而非 mxgraph 名）。

## 2. 建议生成

- import `dsl/catalog-search.js`（依赖方向：spec-to-drawio → catalog-search → icon-mappings/shape-catalog，无环，见子任务 1 design §2）。
- 对未知名去前缀、按 `_`/`-` 切词干查 top-3；纯内存，无额外 IO。

## 3. aspect=fixed 修复（生成路径）

- :1136-1141 compound 分支：aws4ResourceIcon（及子任务 1 的 k8sParamIcon 分支）样式追加 `aspect=fixed`。
- 影响面：既有示例/快照中 aws4 图标的样式串变化——回归测试与 golden 输出需同步；SVG 离线渲染器若解析 aspect 需核对（预期只影响 Desktop 渲染行为，不影响 svg 近似）。
- 不新增任何"手写透传"warning。

## 4. CLI 面

- `cli.js` 增 `--allow-unknown-shapes` 布尔 flag → options 透传；帮助文本同步。退出码/不产出文件复用既有 validateSpec 抛错路径。

## 5. 测试设计

- 用例矩阵：默认拒绝（退出码/无输出/建议 spec 写法/多错聚合/err.validationErrors）× `--allow-unknown-shapes`（回落 warning + 产出 + returnWarnings 含 level:'error'? 否——降级后是 warning 条目，另测非降级程序化路径）× `--strict`（不回退）× 全示例零误杀基线。
- `aspect=fixed`：单测断言 `aws.ec2`/`k8s.pod` 样式；全示例重生成 diff 审查。
- 基线循环 `references/examples/*.yaml` + academic examples/templates 过默认 validate；过慢则抽样进 `node --test`、全量放 `just ci`。

## 6. 风险

| 风险 | 对策 |
|---|---|
| 目录盲区误杀 | 基线先行；误杀补目录/别名不放松校验；逃生门 `--allow-unknown-shapes` |
| 新契约破坏程序化调用方 | 其余 validate* 签名不动；returnWarnings 结构只增不改；grep 仓内所有 `validateShapeReferences(`/`returnWarnings` 调用点逐一核对 |
| aspect=fixed 改动扰动快照/示例 | 独立 commit；先跑全量基线，diff 只允许样式串追加 |
| 旧文案被根测试断言 | 实施第一步 grep，保句式改判级 |
