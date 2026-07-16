# base eval 基线明细(2026-07-16,inline dry_run)

- 执行:全部 15 案例经 `scripts/cli.js` 真实运行,输出在 repo 根 `.drawio-tmp/eval-baseline/<case>/`(in.yaml、out.*、work/ sidecars、log.txt)。
- 判定口径见 `skills/drawio/evals/README.md § Scoring method`。**得分 97.2 = 69 通过 / 71 可验证(共 73 断言,2 条不可验证剔除)。**
- 环境:Windows 11,Node 25,draw.io Desktop **已安装**(PNG/PDF 真实导出成功)。

## 逐案例判定

| 案例 | 断言判定 | 依据要点 |
| --- | --- | --- |
| e01 general-architecture | 6/6 PASS | validate PASSED;out.drawio/out.svg 与 work/ sidecars 分离;theme tech-blue;全程离线;导出 SVG 自检 |
| e02 flowchart-fast-path | 4/4 PASS | 恰 5 节点;horizontal;terminal/decision 类型;validate 报 1 条短末段警告(校验在工作) |
| e03 uml-sequence-state-er | 4/4 PASS | 4 模块分区;枚举语义类型 + primary/data/optional 连线;YAML canonical;无 venue/caption 字段 |
| e04 network-topology | 4/4 PASS | firewall/switch/server/subnet/ap 全用;srcInterface/vlan/bandwidth/linkType/ip 元数据入 spec 并渲染;hierarchical 0 交叉;engineering-review profile + label-overlap 警告(检查生效) |
| e05 mermaid-conversion | 4/4 PASS | `--input-format mermaid`;spec sidecar 即中间 YAML;5 节点 4 边连通性保留(Order DB 为 database);离线 |
| e06 csv-orgchart | 4/4 PASS | `--input-format csv`;父子层级 3 边保留;自动 vertical;spec canonical |
| e07 import-export-spec | 4/4 PASS | `--input-format drawio --export-spec` 导出 spec(自动 meta.source: edited);YAML 内改名 API→Auth Service;重渲 SVG 含 "Auth Service";sidecars 在 work/ |
| e08 style-preset | 2/4,**FAIL×2** | PASS:built-in 路径明示 + corporate.json 存在;"Never mutate bundled presets" 逐字。FAIL:①base 政策面未写 user preset 先于 bundled 的查找优先级(仅 academic overlay 写了);②"unknown preset 名报错而非静默回退"在 SKILL.md/style-extraction.md/style-presets.md 均无(palette 有对应规则,preset 缺失) |
| e09 non-academic replicate | 7/7 PASS + 1 N/A | meta.source/canvas 640x220;5 个源色全保留进 SVG;labelOffset 使用;native 无嵌图;profile default;导出 SVG 色值比对。N/A:源图无独立文本框,"bounds for standalone text" 无从行使(e10/e13 已覆盖该机制) |
| e10 native-rebuild | 8/8 PASS | work/out.inventory.md 覆盖 canvas/regions/shapes/connectors/palette/approximations;canvas 1200x800;模块+native 形状+紧凑 legend 文本节点;探针证明 YAML 路径根本无 image 节点类型(全页嵌图结构性不可能,强于 validate 拦截);sidecars 齐 |
| e11 desktop-fallback | 4/4 PASS + 1 N/V | PNG/PDF 经 --use-desktop 真实产出;.drawio+sidecars 交付;diagrams.net URL 回退验证(viewer.diagrams.net#R);无 Playwright。N/V:"Desktop 不可用时不虚报"分支本机无法触发(Desktop 已装);机制由 tests/desktop-detection.test.js 与 CLI stderr 回退文档覆盖 |
| e12 live-refinement-boundary | 4/4 PASS(policy) | SKILL.md 三处显式:refinement provider only / offline canonical / 缺能力改离线不阻塞;mcp-tools.md capability-first,不绑定单一 provider |
| e13 formula | 4/4 PASS | `$$...$$` 与 `\(...\)` 保留;YAML 单引号保反斜杠 + XML `&lt;` 转义验证;公式文本在 SVG 完整;无 academic profile。注:首次作者化踩了双引号转义坑(文档已有规则),一次修复;loss 节点 bounds 估计偏小警告残留 |
| e14 palette-selection | 5/5 PASS(policy+资产) | 规则 16 + Palette Selection 逐条文本强制;palette JSON 带 displayName/colorblindSafe/grayscaleSafe/venues 支撑选项描述;Completion Report 含 palette+safety 条目 |
| e15 replicate-palette-preservation | 5/5 PASS | 源色(蓝/青/灰蓝)全保留;spec 无 meta.palette(验证 0 命中);meta.replication.palette 带角色/置信度;native 可编辑;导出 SVG 与源色 grep 比对 |

## 最弱维度(写入 TSV note)

1. **style-preset 治理**:查找优先级与 unknown-name 报错政策在 base 面缺失(e08 两处 FAIL)——W5 瘦身时顺带补一行契约句即可修复,但按基线纪律**本轮不改**,留给后续任务。
2. **首轮布局质量**:e02/e03/e04/e13 共 7 条 validate 警告(短末段、label 重叠、text bounds 偏小)——校验器能兜住,但作者化首轮质量依赖 fix-rerender 循环。
3. **Desktop 不可用分支**:本环境无法真实触发,仅单测覆盖。

## W3b 抽查指引(瘦身后)

抽查 ≥5 例覆盖被移动文本的路由:e01(create 主链)、e04(edge 质量规则)、e08(style-preset 段——W5 若压缩该段,两条 FAIL 不得增多)、e14(palette 询问门,断言邻近窗口)、e09 或 e15(replicate 政策)。比对口径与本文件逐条一致;分数回归超 1 分即回滚 W5。

## W3b 抽查结果(2026-07-16,W5 之后)

- 政策锚点:e01/e04/e08/e09/e14/e15 相关 15 项检查全部 PASS(含 2 项"缺口仍如实存在"的反向确认)。
- 机械回归:e01、e09 用相同输入重渲,SVG 与基线逐字节一致(CLI 未动,符合预期)。
- 结论:97.2 → 97.2,status=keep,W5 瘦身无回归。TSV 已追加 keep 行。

## e08 缺口修复复验(2026-07-16,收尾轮)

- SKILL.md § Style Presets 新增两句契约:user-first 查找优先级(user 目录先于 styles/built-in/)、unknown preset 名报错而非静默回退(措辞对齐 palette 的既有规则)。
- e08 复验 4/4 PASS;其余案例锚点未动;体积对冲后 13,995B 仍在 14,000B 预算内。
- 97.2 → 100.0(71/71 可验证断言),TSV 已追加 keep 行;两条 not-verifiable(Desktop 分支、e09 无独立文本)口径不变仍剔除。
