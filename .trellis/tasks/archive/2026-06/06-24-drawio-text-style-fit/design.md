# Design — drawio 文字样式优化：透明底 + 内容定宽

## 1. 设计目标与边界

- 主修复手段是**补指导规则**（根因是手写场景的指导空缺），转换器改动是**护栏/兜底**，eval 是**回归验证**。
- 规则单一可信来源放 base 的 `tokens.md`；其余文档只放精简规则 + 指针，避免重复与漂移。
- 学术叠加层保持"薄层"：只加学术增量与指向 base 的指针，不复制 base 内容。
- 不动 `description` 触发词、不重构布局/主题、不碰非文字节点默认值。

## 2. 文档改动设计（R1/R2/R3）

### 2.1 规范单一来源：`skills/drawio/references/docs/design-system/tokens.md`

新增章节 `## Text & Label Styling`（置于 `Typography Tokens` 与 `Node Size Presets` 之间或其后），包含两条规则：

**规则 A — 透明底（解决问题 1）**

- 文字、标注、caption、callout、图例说明默认 `fillColor=none` 且 `labelBackgroundColor=none`。
- 解释 why：白色填充/白色标签底会在彩色图上形成不透明方块，遮挡连线与相邻元素，破坏视觉层次；读者要的是文字本身，不是它的白盒子。
- 例外（需有意识使用并在说明里记录理由）：仅当文字压在繁杂/深色背景上确需分隔时，使用克制的浅色或半透明底（如 `fillColor=#F8FAFC;opacity=70` 一类主题色浅调），**绝不**用硬 `#FFFFFF` 方块；优先改为给文字加深色描边/加粗或挪到空白处。

**规则 B — 内容定宽（解决问题 2）**

- 文字/标签框按内容定宽：宽度 ≈ 最长行宽 + 左右内边距，只比文字略宽；不要铺满父容器或源图区域。
- 解释 why：过宽文字框会与邻居重叠、产生大片不可见点击区，导致选中/移动/变换困难；按内容定宽让每个文字成为独立、可操作的小元素。
- 宽度估算启发式（供手写 `bounds`/`size` 时心算）：
  - 单行像素宽 ≈ Σ字符宽，其中 ASCII/Latin 字符 ≈ `0.6 × fontSize`，CJK 全角字符 ≈ `1.05 × fontSize`。
  - `width ≈ ceil(最长行宽) + 2 × 水平内边距`（内边距建议 8–12px），并设下限（如 48px）。
  - 多行取最长行；高度 ≈ `行数 × fontSize × 1.4 + 2 × 垂直内边距`。
- 提示：能交给转换器自动定宽就别手写死宽；需要精确复刻坐标时才用显式 `bounds`，且仍遵循"略宽于文字"。

### 2.2 各处指针/精简规则（覆盖手写路径，R3）

| 文件 | 改动 |
| --- | --- |
| `skills/drawio/SKILL.md` | `Default Operating Rules` 增加第 13 条：一句话陈述"文字/标注默认透明底、按内容定宽"，指向 `tokens.md#text--label-styling`。 |
| `skills/drawio/references/workflows/edit.md` | 在"改标签/样式"附近加 1–2 行规则 + 指针（编辑时不要给文字加白底、不要把文字框拉到与容器等宽）。 |
| `skills/drawio/references/workflows/replicate.md` | 在 Text Fidelity / `bounds` 段（约 41–51、75 行）加规则：复刻文字时用透明底、`bounds.width` 按内容定宽而非源区域整宽；指针到 `tokens.md`。 |
| `skills/drawio/references/docs/design-system/specification.md` | 在 `text` 类型行（约 226 行）后加一句样式约定 + 指针。 |
| `skills/drawio-academic-skills/references/docs/publication-overlay.md` | 在 `Formula/callout placement` 段加学术增量规则（caption/callout/legend 透明底、按内容定宽，论文图尤其忌白盒遮挡），指针到 base `tokens.md`，不复制内容。 |
| `skills/drawio-academic-skills/references/docs/academic-figure-playbook.md` | callout/legend 相关条目补一句"透明底、内容定宽"提示（如已被 overlay 覆盖可只留指针）。 |

> 文档语言：跟随各文件既有语言（base 英文为主、学术叠加层英文为主；中文 skill 文档保持中文）。规则文字遵循 [[drawio-skills-format-hook-conflicts]]：Markdown 不受 JS prettier 影响，可正常用 Edit/Write。

## 3. 转换器改动设计（R4）

文件：`skills/drawio/scripts/dsl/spec-to-drawio.js`（用 Bash 编辑以规避 prettier 改写非改动行，见 [[drawio-skills-format-hook-conflicts]]）。

### 3.1 text 节点补 `labelBackgroundColor=none`（问题 1 兜底）

`generateNodeStyleWithSpec` 的 `isTextNode` 分支（约 877–894 行）`parts` 数组追加 `'labelBackgroundColor=none'`。text 已是 `fillColor=none`，此项确保即便其它来源也不产生文字白色光晕。其余 shape 分支 draw.io 默认 labelBackgroundColor 即为 none，不强加，保持最小改动。

### 3.2 text 节点内容定宽（问题 2 兜底）

- 扩展 `getNodeSize(size, nodeType, label)`：新增可选第三参 `label`。
  - 当传入显式 `size` 预设 → 原样返回（不变）。
  - 当 `nodeType === 'text'` 且**无**显式 `size` 且 `label` 存在 → 返回按内容估算的 `{ width, height }`，替代固定 `medium`。
  - 其余情况 → 维持原 `TYPE_DEFAULT_SIZES` / `medium` 回退（向后兼容：不传 label 的旧调用行为不变，既有单测不受影响）。
- 新增内部 helper `estimateTextSize(label, fontSize = 13)`：
  - 按 `\n` 与 `<br>`/`<br/>` 拆行；每行宽按 §2.1 启发式（ASCII≈0.6×fs、CJK≈1.05×fs）累加。
  - `width = clamp(ceil(maxLineWidth) + 2×10, 48, 上限)`；上限设一个合理值（如 320）避免异常超长 label 撑爆，超限则交回 `whiteSpace=wrap` 折行。
  - `height = max(ceil(lines × fontSize × 1.4) + 2×6, 24)`，并 `snapToGrid`。
- 在布局调用点把 `node.label` 作为第三参传入 `getNodeSize`：约 483、495、508、551、582、643 等处（统一改为 `getNodeSize(node.size, semanticType, node.label)`）。显式 `bounds`（`normalizeNodeBounds`）与 `position+size` 路径仍优先，不被覆盖。

### 3.3 兼容性

- 非 text 节点：第三参对它们无效果，行为完全不变。
- 显式 `bounds`/`size` 的 text：仍走显式值，复刻精度不受影响。
- 风险点：仅"无显式尺寸的 text 节点"默认宽高变化。既有布局测试用的是 `bounds`，预计不受影响；执行阶段以 `npm test` 实测为准，若有断言因更合理的尺寸而变化，则有意更新并补新断言。

## 4. Eval 设计（R5）

遵循 skill-creator"改进现有 skill"流程：编辑前 `cp -r` 快照旧 skill 作 baseline，新版为 with-skill。

- 快照：`<workspace>/skill-snapshot/`（base 与 academic 各一份或按需）。
- 工作区：`skills/drawio/<skill>-workspace/iteration-1/eval-<id>/{with_skill,old_skill}/outputs/`。
- 新增 eval 用例（写入 `skills/drawio/evals/evals.json`，academic 视需要加 `skills/drawio-academic-skills/evals/`）：
  1. **callout-over-color**：提示在一张含彩色方块的图上添加指向某元素的文字标注（复现"有效频带"场景）。断言：标注/文字 cell 不含 `fillColor=#FFFFFF` 且不含 `labelBackgroundColor=#FFFFFF`/`labelBackgroundColor=#fff`；文字框宽度 ≤ 内容估算宽 × 1.6（即非容器整宽）。
  2. **multiline-node-and-text**：提示创建含多行标题/说明的节点与若干独立文字说明。断言：独立文字 cell 透明底；其 `width` 与内容估算的偏差在阈值内，而非等于容器宽。
- 断言可脚本化：解析输出 `.drawio` XML，对 `style` 做正则（`fillColor=#FFFFFF`、`labelBackgroundColor`），并按 cell 文本长度核算期望宽度区间。
- 评测产出：`benchmark.json` + eval viewer（`generate_review.py`，Windows 用 `--static` 产出独立 HTML 供人工查看）。
- Windows 注意：本任务**不跑** `run_loop`/`run_eval`（description 触发优化），规避 [[skill-creator-windows-trigger-harness]] 的 select-on-pipe 假阴性；输出 eval 经 Agent 子代理产出 + 脚本评分，不受该缺陷影响。

## 5. 验证策略

1. 单测：`npm test`（或 package.json 等价命令）全绿，含新增 text 透明底/内容定宽断言。
2. 渲染自检：用新版对一个含 text + callout 的 YAML 渲染 `.drawio` + `.svg`，确认无白底、文字框贴合内容。
3. Eval 对比：with-skill vs old_skill，量化两问题改善。
4. 可追溯：diff 每行对应 R1–R5。

## 6. 备选与取舍

- **仅文档（被否）**：风险最低但缺兜底，模型偶发仍会犯；用户已选最全范围。
- **转换器 `getNodeSize` 不加参，改在调用点包装**：调用点多、易遗漏，反而更分散；加可选第三参集中且向后兼容，更优。
- **height 也按内容**：纳入（content-fit 才自洽），但以 `npm test` 守住回归；若引入过多断言变更，可退化为"仅 width 内容定宽、height 维持类型默认"。
