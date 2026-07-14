# 实施计划：stencil 目录扩容与离线 search 查询命令

> 2026-07-14 修订：参数化提取 + 共享映射模块 + k8s 发射修复纳入 checklist。

前置：任务 `task.py start` 之后才动手。所有 `.js` 编辑经 Bash 写入（prettier hook 规避）。

## Checklist

1. [ ] 复制数据源：`ref/drawio-ai-kit/data/shape-index.json.gz` → `skills/drawio/assets/catalog/shape-index.json.gz`；解压统计：平铺前缀条数、参数化家族（prIcon/resIcon/grIcon）值数。
   - 验证：统计与 design.md §0 数字吻合（k8s icon2≈39、cisco19.rect≈149、aws4.productIcon≈132、mscae≈148）；记入记录区。
2. [ ] 抽共享模块 `dsl/icon-mappings.js`：移动 `ICON_PREFIXES`/`ICON_ALIASES`/`resolveIconShape`（连同安全正则），加 `specSyntaxFor()` 反向映射；`spec-to-drawio.js` 改 import + re-export。
   - 验证：先跑既有全量 `node --test`（基线）→ 移动后再跑，零回退；新模块测试绿。
3. [ ] 写 `scripts/tools/build-shape-catalog.js`（平铺+参数化两路提取、确定性排序、覆盖统计 stdout）。
   - 验证：连跑两次产物逐字节一致；kubernetes families 值 ≥30。
4. [ ] `dsl/shape-catalog.js`：v2 加载器（entries+families→内存 byKind/家族查找表）、新 kind；`resolveShapeNameKind` 旧语义回归测试先行。
   - 验证：`node --test .../shape-catalog.test.js` 绿。
5. [ ] 重建并提交 `shape-catalog.json.gz`（v2）；记录 gzip 体积（>300 KB 触发裁剪评审）。
   - 验证：既有示例 `--validate` 行为无回退。
6. [ ] k8s 参数化发射：`generateNodeStyleWithSpec` 增加 `k8sParamIcon` compound 分支；`ICON_ALIASES` 补 k8s 常用别名。
   - 验证：`k8s.pod` YAML → XML 含 `shape=mxgraph.kubernetes.icon2;prIcon=pod`；Desktop 或 SVG 渲染非空白。
7. [ ] `dsl/catalog-search.js`（打分器 + families 索引 + specSyntaxFor 反查）+ 测试。
8. [ ] `cli.js` 接入 `search` 子命令（动词拦截、--prefix/--limit/--json、退出码）。
   - 验证：`search pod --prefix kubernetes` 有结果且给 `k8s.pod`；`search zzz_not_exist` 退出码 1 带建议。
9. [ ] `assets/licenses/` 增补 Apache-2.0 attribution（jgraph/drawio-mcp shape index）。
10. [ ] 全量检查：根 `npm test`（node scripts/run-tests.js）→ `just ci`。

## 回滚点

- 步骤 2（抽模块）独立成 commit——纯移动，可单独回滚。
- 步骤 4-6（v2 目录+加载器+发射）原子成组：catalog 产物、加载器、发射分支必须同 commit。
- 步骤 7-8（search）独立成 commit。

## 记录区（实施时填写）

- shape-index 平铺/家族统计：TBD
- v2 catalog gzip 体积：TBD
- resolveIconShape 对 k8s 的归一化表示选型：TBD
- 无法反查 spec 写法的前缀清单：TBD
