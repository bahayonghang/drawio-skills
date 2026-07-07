# Implement: drawio 复刻质量优化

> 平台注意（来自项目记忆）：本仓库 PostToolUse prettier 钩子会把 `.js` 重排成与已提交单引号风格冲突的样式——**修改 `.js` 一律经由 Bash（如 `node -e` / `sed` / heredoc）落盘，不用 Edit/Write 工具直接改 .js**；`.md`/`.yaml` 不受影响。

## 阶段 0：回归基线（先红后绿）

- [x] 0.1 依据 research/original.png 建模 `industrial-architecture` 回归 YAML（宽顶箱+4 垂直边、双向平行边、两个圆柱、虚线模块、竖排中文标签「可视化数据/上位操作指令」、透明文本标注），存 `skills/drawio/evals/fixtures/industrial-architecture.yaml`
      → 验证：`node skills/drawio/scripts/cli.js <fixture>.yaml /tmp/base.drawio --validate` 可跑通；导出 SVG 目视记录折弯基线（截图入 research/）。
- [x] 0.2 在 research/ 记录基线 warning 清单与折弯边列表（后续对照）。

## 阶段 1：共享坐标路由（design §2.1）

- [x] 1.1 spec-to-drawio.js `buildRoutedEdges`：实现共享绝对坐标解析（候选=窄面中心、clamp 公共区间 m=8、无公共区间回退旧槽位）；多边按共享坐标排序扩散（≥30px，双端同移）；双向平行边 ±15px 分离
      → 验证：`cd skills/drawio/scripts && node --test dsl/spec-to-drawio.test.js`
- [x] 1.2 新增单测：①不同宽度两箱垂直边 exit/entry 绝对 X 相等；②宽箱一面 4 条边各对齐对端中心且间距 ≥30px；③无公共区间回退；④显式 exitX 用户值不被覆盖；⑤双向平行边两条直线
      → 验证：`node --test` 全绿。
- [x] 1.3 重跑 fixture：折弯消失（SVG 目视 + 脚本断言共线）
      → 【review gate】对比 research/original.png 确认视觉等级；回滚点：revert 阶段 1 提交。

## 阶段 2：校验层（design §2.2–2.4）

- [x] 2.0 箭头默认风格（design §2.7）：`generateConnectorStyle` 为 block/classic 补 `endSize=12`（style > theme > 默认），startArrow 对称补 `startSize` + 单测（默认存在、可覆盖）

- [x] 2.1 `validateEdgeQuality` 直线度审计（存在公共区间却不共线 → warning，`--strict` 失败）+ 单测
- [x] 2.2 文本透明强制：`generateNodeStyleWithSpec` isTextNode 分支忽略 fill/stroke 并 warning + 单测（YAML 白底 → 输出仍 none）
- [x] 2.3 `validateXml()`：`text;` vertex 白底扫描、浮动边（缺 source/target）、箭头形状冒充连线 + 各 1 单测
- [x] 2.4 标签碰撞 lint（edge label×edge label、label×他边、文本框×连线）+ 单测
      → 验证：`node --test` 全绿；fixture `--strict` 零告警；构造违规 .drawio 逐条报出（AC3/AC4）。

## 阶段 3：竖排标签与文本尺寸（design §2.5、§2.8）

- [x] 3.0 标签换行保真：buildXml 非数学标签 `\n`→`&lt;br&gt;`（节点/模块/边标签）+ 单测（多行转 br、数学标签不转，AC9）

- [x] 3.1 文本节点去 `overflow=hidden`；bounds 缺省按内容估算（CJK≈fontSize/字，Latin≈0.6×），超出 >20% warning + 单测
- [x] 3.2 确认 label `\n`→`<br>` 渲染路径；fixture 竖排标签一字一行无断行/截断（AC5）
      → 验证：`node --test`；SVG 目视。

## 阶段 4：文档与同步（design §2.6）

- [x] 4.1 edge-quality-rules.md：新增 Blocking Rule 8「共线优先」；Default Face Policy 改为对端投影回退制
- [x] 4.2 replicate.md：Text Fidelity Pass 强制透明措辞、Step 8 校验清单补直线度/浮动边/白底文本项
- [x] 4.3 tokens.md（Text & Label Styling）+ SKILL.md：透明文本框、原生绑定边、竖排标签模式
- [x] 4.4 drawio-academic-skills 引用处同步措辞（publication-overlay.md 等，仅措辞）
      → 【review gate】文档交叉引用一致性通读。

## 阶段 5：收尾验证

- [x] 5.1 `references/examples/*.yaml` 全量重跑 CLI `--validate`，受影响示例修正达标；`skills/drawio/evals/` 基线提示词补「复刻直线度」条目
- [x] 5.2 全套测试：`cd skills/drawio/scripts && node --test`（含 adapters/svg/math）
- [x] 5.3 AC1–AC7 逐条核对，SVG 对照图存 research/
- [x] 5.4 提交按层拆分（代码/回归、规则文档、2.5.0 元数据），便于单层回滚。

## 验证命令速查

```bash
cd skills/drawio/scripts && node --test                          # 全套单测
node skills/drawio/scripts/cli.js <in>.yaml <out>.drawio --strict # 严格构建
node skills/drawio/scripts/cli.js <in>.yaml <out>.svg            # SVG 导出目视
```
