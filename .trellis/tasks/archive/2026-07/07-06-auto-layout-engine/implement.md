# Implement — 离线自动布局引擎与边路由升级

> .js 经 Write 工具写 .py 补丁脚本再 Bash 执行（反斜杠折半问题）；无反斜杠的小补丁可直接 heredoc。
> 单块 Bash 命令 ≤8KB。新文件（vendor/auto-layout.js/示例/测试）用 Write 工具直写。

## Checklist

1. [x] Vendor elkjs：`npm pack elkjs@0.11.1` → 提取 `lib/elk.bundled.js` 落
       `scripts/vendor/elkjs/elk.bundled.cjs` + `LICENSE`(EPL-2.0) + `README.md`（版本/来源/再生成）。
   - 验证：`createRequire` 加载 + 3 节点 2 边 smoke layout 输出坐标。
2. [x] R3 挂点修复：`buildRoutedEdges` 两个分配循环改 `group.length === 1 ? 0.5 : getSlot(index)`；
       更新 `edge-quality-rules.md` 措辞与受影响断言。
   - 验证：mod-test.yaml 单边 exit/entry=0.5；两条同面边 0.25/0.75；npm test 全绿。
3. [x] 新模块 `scripts/dsl/auto-layout.js`：`loadElk`（懒加载+失败 null）、`buildElkGraph`（复合图映射）、
       `applyAutoLayout`（闸门→elk→坐标换算→bounds/waypoints 注入→降级回退）+ auto-layout.test.js。
   - 验证：单测全绿（映射/换算/闸门/降级）。
4. [x] CLI 接线：hierarchical 且全节点无显式位置时 `await applyAutoLayout(spec)`；
       同步路径 hierarchical 未注入时 warning 提示。
   - 验证：12 节点无 bounds workflow 经 CLI 输出无重叠、无边质量告警。
5. [x] `layout: tiered`：calculateLayout 新分支（ROLE_TIERS/TYPE_TIERS 定序、行布局、显式节点不动）+ 单测。
   - 验证：internet→…→server 分行呈现；显式节点坐标不变。
6. [x] R7 度量：`computeLayoutQualityMetrics` + CLI `--validate` info 行 + 单测（穿框/交叉构造用例、
       两个既有示例指标 pin）。
   - 验证：新 workflow 示例 edgeNodeCrossings=0。
7. [x] 示例 ×2（auto-layout-workflow.yaml / tiered-network-topology.yaml）+ 文档
       （specification.md layout 枚举、SKILL.md 布局表；PRD 勘误：无 spec.schema.json）。
   - 验证：两示例 `--validate --strict-warnings` 通过。
8. [x] 全量回归：npm test + 全示例渲染 + 既有示例（horizontal/vertical/star/mesh/全显式 bounds）
       输出坐标不变抽查。

## 回滚点

- 步骤 2 独立可交付（先行小步）；其后每步依赖 vendor(1)。
- 布局异常：elk 闸门降级即旧行为；单分支单提交，revert 即整体回滚。
