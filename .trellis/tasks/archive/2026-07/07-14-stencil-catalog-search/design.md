# 设计：stencil 目录扩容与离线 search 查询命令

> 2026-07-14 修订：吸收 Codex 审阅（数据源无平铺增长 → 改参数化提取 + mscae 前缀拓宽；共享映射模块防循环依赖）。

## 0. 已验证事实（规划依据）

- shape-index 总 10,446 条、6459 个唯一 shape 名、40+ `mxgraph.*` 前缀。
- 平铺提取各前缀条数 = 现有目录（kubernetes 1 / azure 87 / gcp2 110 / cisco 291…），零增长。
- 参数化条目 365 条 `prIcon=`：`mxgraph.kubernetes.icon2`→39 值、`mxgraph.cisco19.rect`→149 值、`mxgraph.aws4.productIcon`→132 值；另 `grIcon=` 19 值。
- `mscae` 前缀 148 条（Azure 补充库）。
- 现 resolver bug：`k8s.pod`→`mxgraph.kubernetes.pod` 平铺名（不存在）；aws4 已有 compound 先例：`resolveShapeNameKind(iconShape)==='aws4ResourceIcon'` 时发射 `shape=mxgraph.aws4.resourceIcon;resIcon=<name>`（`spec-to-drawio.js:1138-1141`）。
- `ICON_PREFIXES`（:892）/`ICON_ALIASES`（:902）为 `spec-to-drawio.js` 模块级常量；`resolveIconShape`（:1023）已 export。

## 1. 数据流

```
ref/drawio-ai-kit/data/shape-index.json.gz   (Apache-2.0; 一次性复制，勿改 ref/)
        ▼
skills/drawio/assets/catalog/shape-index.json.gz          [新增，源数据，提交]
        │  node skills/drawio/scripts/tools/build-shape-catalog.js
        ▼
skills/drawio/assets/catalog/shape-catalog.json.gz        [v2 产物，提交]
        │  loadShapeCatalog() (shape-catalog.js，扩展)
        ├─► resolveShapeNameKind() / validateShapeReferences()（既有消费方）
        └─► dsl/catalog-search.js（新增） ◄── cli.js `search`
                    │ 反查 spec 写法
                    ▼
        dsl/icon-mappings.js（新增共享模块）
```

## 2. 模块依赖图（防循环，Codex 发现 2）

```
icon-mappings.js      ←  spec-to-drawio.js（import + re-export 兼容）
   ▲     ▲            ←  catalog-search.js
   │     └─────────── ←  icon-resolver.js（如需）
shape-catalog.js      ←  spec-to-drawio.js / catalog-search.js
catalog-search.js     ←  cli.js（search 子命令）；子任务 2 中 spec-to-drawio.js 也将 import 它做建议
```

`icon-mappings.js` 内容：`ICON_PREFIXES`、`ICON_ALIASES`、`resolveIconShape()`、`specSyntaxFor(mxName)`（反向映射：`mxgraph.aws4.s3`→`aws.s3`、参数化家族 `kubernetes.icon2+prIcon=pod`→`k8s.pod`；无映射前缀返回 null 并提示 raw passthrough 写法）。**零依赖其他 dsl 模块**（叶子模块），循环不可能成环。`spec-to-drawio.js` 删除本地定义改 import，并 `export { resolveIconShape } from './icon-mappings.js'` 保持既有外部导入不破坏。

## 3. Catalog 格式 v2

```json
{
  "version": 2,
  "generatedFrom": "shape-index.json.gz (jgraph/drawio-mcp, Apache-2.0)",
  "entries": [
    { "n": "mxgraph.aws4.s3", "t": "Simple Storage Service (S3)", "k": "aws4Resource", "g": ["storage"] }
  ],
  "families": [
    { "base": "mxgraph.kubernetes.icon2", "param": "prIcon", "k": "k8sParamIcon",
      "values": [ { "v": "pod", "t": "Pod", "g": ["workload"] } ] },
    { "base": "mxgraph.cisco19.rect", "param": "prIcon", "k": "cisco19ParamIcon", "values": ["…"] },
    { "base": "mxgraph.aws4.productIcon", "param": "resIcon", "k": "aws4ProductIcon", "values": ["…"] },
    { "base": "mxgraph.aws4.group", "param": "grIcon", "k": "aws4GroupIcon", "values": ["…"] }
  ]
}
```

- 字段压缩（n/t/k/g/v）控 gzip 体积；**不存 style 串**（样式由 resolver 拼装，与 kit 的 verbatim 下发策略不同——目录只负责"名字真实 + 可检索"）。体积估算：entries ~1.3k 条 + mscae 148 + families ~340 值，gzip 预估 < 200 KB；实测记录，>300 KB 则裁剪 tags。
- v1→v2 兼容：`shape-catalog.js` 加载器在内存重建 v1 等价的 byKind Set；`resolveShapeNameKind()` 对外语义不变，新增 kind：`k8sParamIcon`/`cisco19ParamIcon`/`aws4ProductIcon`/`aws4GroupIcon`/`mscae`。

## 4. 生成脚本 `scripts/tools/build-shape-catalog.js`

- 纯 Node（node:zlib/fs）。提取器两条路径：
  1. 平铺：唯一 `shape=<name>` / `resIcon=<name>`，前缀 ∈ {aws4, gcp2, azure, mscae, kubernetes, cisco, cisco19, networks} + builtin 清单。
  2. 参数化：对 `shape=<base>;…(prIcon|resIcon|grIcon)=<value>` 聚合为 families（base 白名单：kubernetes.icon2 / cisco19.rect / aws4.productIcon / aws4.group）。
- 确定性排序（entries 按 n、families.values 按 v）→ 重跑逐字节一致。
- 覆盖前缀清单从 `shape-catalog.js` 导出常量（单一来源）。stdout 打印覆盖统计；"本期不进目录"的前缀（office 447/rack 289/veeam 289/alibaba_cloud 284/…）打印计数，记入 prd 后续清单。

## 5. k8s 参数化发射（R3）

- `generateNodeStyleWithSpec` 的 iconShape 分支（:1136-1141）比照 aws4ResourceIcon 增加：kind 为 `k8sParamIcon` → `shape=mxgraph.kubernetes.icon2;prIcon=<value>`。
- `resolveIconShape('k8s.pod')` 仍返回归一化标识（如 `mxgraph.kubernetes.icon2:prIcon=pod` 或保持 `mxgraph.kubernetes.pod` 并由 kind 判定改写——实施时选实现噪音最小者，写入记录区）；`resolveShapeNameKind` 据 families 判 kind。
- aws4.productIcon / cisco19.rect 的 spec 发射为可选加分项：目录可搜可校验即可，search 对这两族输出 raw style 提示。

## 6. search 子命令与打分器

- `cli.js` 参数解析头部拦截 `search` 动词：`search <query> [--prefix p] [--limit N] [--json]`。
- `dsl/catalog-search.js`：`norm()`（小写、去 `-_./`、NFKD）；打分 name 精确=100 / name token 全含=60 / 子串=40 / title token +25 / tags +10；families 的 value 与"前缀短名"（`pod`、`k8s.pod`）均参与索引。逗号分段独立查询。top `--limit`（默认 8）。
- 输出行：`mxgraph.kubernetes.icon2;prIcon=pod | Pod | spec: k8s.pod`；无 spec 写法者提示 raw 透传。退出码：有结果 0 / 无结果 1（附近似建议）。

## 7. 测试

- `tools/build-shape-catalog.test.js`：fixture index → 平铺+参数化提取、排序确定性、v2 结构。
- `dsl/icon-mappings.test.js`：正向/别名/反向、k8s 参数化、passthrough 安全正则（原 spec-to-drawio 相关用例迁移或复制）。
- `dsl/catalog-search.test.js`：精确/部分/批量/prefix/无结果建议/家族值检索。
- `dsl/shape-catalog.test.js`：v2 加载、新 kind、`resolveShapeNameKind` 旧语义回归。
- 端到端：`k8s.pod` YAML → XML 断言 compound 样式；既有示例无回退。根 `npm test` + `just ci` 收尾。

## 8. 风险与权衡

| 风险 | 对策 |
|---|---|
| catalog gzip 体积膨胀 | 不存 style、字段压缩、实测；>300 KB 裁 tags |
| 抽模块动到 3548 行大文件 | 只**移动**常量与函数不改逻辑，re-export 兜底；先跑既有测试基线 |
| k8s icon2 的 prIcon 值命名与直觉不符（如 `c_c_m`） | search 的 title/tags 检索兜底；ICON_ALIASES 补常用别名（pod/deployment/svc…） |
| mscae 与 azure 前缀语义重叠 | search 输出两者并列，文档子任务说明选用规则 |
| prettier hook 重排 .js | 全部经 Bash 写入 |

## 9. 本期不做（记录）

- office/rack/veeam/alibaba_cloud/electrical/… 等 30+ 前缀进目录（无用户需求，体积不划算）；
- kit 式 base64 图标包（azure 626/gcp 216 官方彩色图标）——若日后需要"官方新版图标"再立项，涉及许可与体积权衡。
