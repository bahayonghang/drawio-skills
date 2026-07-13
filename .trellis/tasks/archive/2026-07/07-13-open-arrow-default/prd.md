# drawio 两 skill 默认箭头切换为 Open

## Goal

把 `drawio` 与 `drawio-academic-skills` 两个 skill 的**流向类**连线默认箭头，从实心块状 block（`endArrow=block;endFill=1`）改为开放式 Open（`endArrow=open;endFill=0`，即无填充、两条线构成的 "V" 形）。保留 UML/ER/菱形等语义标记不动；block 仅在明确要求时使用；同步更新记忆里的硬性偏好 #4。

## Background

- 当前 block 是默认箭头，写在三层：**代码**（`spec-to-drawio.js` 连接器主题表 + 兜底、`ah-to-drawio.js`）、**文档**（两个 skill 的 SKILL.md/references 约 8 处）、**测试**（`spec-to-drawio.test.js`）。
- 本任务**推翻**已记录的硬性偏好 #4「箭头头部用粗实心大三角 `endArrow=block;endFill=1;endSize=12`」。该偏好的初衷是"细箭头在 2px 粗连线上显得单薄"；用户已知悉并选择改用 Open（2026-07-13 确认）。
- 用户两项范围确认：① 只改流向类，保留语义标记；② 两 skill 全默认 Open，block 仅按需。

## Requirements

- **R1 流向类默认改 Open**：`primary` / `data` / `control` / `memory_read` / `memory_write` / `feedback` 六种连接器类型的默认头由 `block/fill` 改为 `open/no-fill`。（`optional`、`async` 本已是 open，不动。）
- **R2 兜底默认改 Open**：无类型、无显式 style 的边，兜底默认由 `block` 改为 `open`。
- **R3 保留语义标记**：`dependency`（diamond）、`bidirectional`（none）、UML 继承（`block;endFill=0` 空心三角）、UML 组合/聚合（菱形）、ER（鱼尾）等**形状即含义**的标记一律不动。做法上只改"默认值"，显式 `edge.style.endArrow` 永远优先，故语义模板不受影响。
- **R4 block 保留为按需能力**：显式要求 block/classic 时仍生成 block，且仍带加粗 `endSize=12`。不删除 block 能力。
- **R8 open 加粗头尺寸**：把 `endSize=12` 默认逻辑扩展到 `open`（提升 2px 线上的可见度）。副作用：现有 optional/async open 边也随之变 12（可接受，见 design.md）。
- **R5 文档同步**：两个 skill 中所有"默认箭头 = block"的表述改为"默认 = open"，并说明 block 为按需覆盖、语义标记不变。
- **R6 测试同步**：更新断言"默认边 = block"的用例为 open；显式 block 用例保留；导入/渲染类 block fixture 不动。
- **R7 记忆更新**：将 `drawio-diagram-user-preferences.md` 第 4 条改为 Open 默认（含 2026-07-13 推翻说明、保留语义标记的注解）。

## Constraints

- **外科手术式改动**：只改箭头"默认值"这一件事。不动路由、颜色、字体、线型、endSize 既有逻辑。
- **JS 改动走 Bash 编辑**：PostToolUse prettier hook 会把 JS 改成双引号、破坏单引号风格；`.js` 文件用 Bash（sed/patch）编辑以保持 surgical（见记忆 drawio-skills-format-hook-conflicts）。
- **不破坏 UML/ER/导入 fixture**：不得对 `.drawio`/测试里的显式 block 做全局 find-replace。

## Out of Scope

- 不改颜色 / dash / 路由 / 字体 / 图例规则。
- 不改 `optional`、`async`（已 open）。
- 不移除 block 能力，不改 UML/ER/菱形语义标记。

## Acceptance Criteria

- [ ] 生成 default / primary / data / control / memory_read / memory_write / feedback 边 → 样式含 `endArrow=open;endFill=0;endSize=12`。
- [ ] 生成 UML 继承边仍为 `endArrow=block;endFill=0`；组合/聚合 diamond、`dependency` diamond、`bidirectional` none 均不变。
- [ ] 显式请求 `endArrow=block` 仍得到 `endArrow=block;...;endSize=12`。
- [ ] `node --test` 通过：`spec-to-drawio.test.js`、`ah-to-drawio.test.js`、`drawio-to-svg.test.js`。
- [ ] 两个 skill 的 references/SKILL.md 中不再出现"默认 = block"的表述（grep 复核）。
- [ ] 记忆 #4 已更新为 Open 默认。
