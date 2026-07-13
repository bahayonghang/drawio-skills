# Design — 默认箭头 block → open

## 核心不变量

**只改"默认值"，不改优先级链。** `spec-to-drawio.js` 的解析优先级是
`edge.style.endArrow > connectorTheme.endArrow > 兜底字面量`。所有 UML/ER/菱形语义标记
都是通过**显式 `edge.style`** 或专用模板产生的，位于优先级链最高层，因此只要不动优先级、
只改中间层（主题表）和最底层（兜底），语义标记自动不受影响。→ 满足 R3，且无需任何
find-replace。

## 改动点（代码，source of truth）

### 1. `skills/drawio/scripts/dsl/spec-to-drawio.js` — 连接器主题表（约 L89–126）

六个流向类：`endArrow: 'block' → 'open'`，`endFill: true → false`：

| 类型 | 现在 | 改为 |
| --- | --- | --- |
| `primary` (L89) | `block / true` | `open / false` |
| `data` (L95–96) | `block / true` | `open / false` |
| `control` (L108) | `block / true` | `open / false` |
| `memory_read` (L109) | `block / true` | `open / false` |
| `memory_write` (L115–116) | `block / true` | `open / false` |
| `feedback` (L126) | `block / true` | `open / false` |

**不动**：`optional`(L103–104 已 open)、`async`(已 open)、`dependency`(L106 diamond)、
`bidirectional`(L107 none)。

### 2. `spec-to-drawio.js` — 兜底默认（L1189–1190）

```
const endArrow = edge.style?.endArrow || connectorTheme.endArrow || 'block'   // → 'open'
const endFill  = edge.style?.endFill  ?? connectorTheme.endFill  ?? true      // → false
```

### 3. `spec-to-drawio.js` — endSize 逻辑（L1206–1211）**改：open 也加 endSize**

现逻辑：只有 `block`/`classic` 才加 `endSize=12`（复用常量 `DEFAULT_ARROW_HEAD_SIZE`）。
**决策（2026-07-13 用户确认提升可见度）：把条件扩展到 `open`**，即
`endArrow === 'block' || endArrow === 'classic' || endArrow === 'open'` 都加 `endSize=12`
（start 侧同理 L1220）。理由：旧 #4「细头在 2px 粗线上像 afterthought」对 V 形同样成立。
- **已知副作用**：现有 `optional`/`async` 本就是 open，会一并变为 `endSize=12`（原为自然尺寸）。
  判断：可接受，反而让全图箭头视觉权重一致；其"弱连线"语义由 dash + 细 stroke + 灰色承载，不靠头小。
  若用户想保留 optional/async 的轻量，改为"仅六个流向类 + 兜底"加 size（需按类型判断，代码更重）。
- **尺寸取值**：沿用 12。open V 在 12 比实心 block 视觉更"宽"，若显宽可下调到 10（单点常量，易调）。
→ R4 仍满足（block 按需时保留 endSize=12）。

### 4. `spec-to-drawio.js` — 校验提示串（L3456）

`'Connect modules with a native bound edge (endArrow=block;endFill=1) ...'` → 改成中性表述
（`endArrow=open`），避免提示与新默认冲突。

### 5. `skills/drawio/scripts/dsl/ah-to-drawio.js`（L165–166）

两条 `edgeStyle=...;endArrow=block;endFill=1;...` → `endArrow=open;endFill=0`。

### 6. `skills/drawio/scripts/svg/drawio-to-svg.js`（L766）**可选**

渲染兜底 `style.get('endArrow') || 'classic'` → `'open'`，让无 endArrow 的手写边渲染为 open。
仅影响渲染兜底，非生成默认；改动小、可选，纳入以保持一致。

## 改动点（文档）

`drawio` skill：
- `SKILL.md` L96 规则 14 —「block arrows default to `endFill=1;endSize=12`」→ 流向连线默认 open 头；block/classic 按需时保留 `endSize=12`；语义标记不变。
- `references/docs/edge-quality-rules.md` L37 — 默认头描述改 open。
- `references/docs/design-system/connectors.md` — primary/data 表(L13–54)、agentic 表(L138–148)、Arrow Types 表(L172–179) 中流向类由 "Filled block" 改 "Open"；保留 dependency=diamond、optional/async=open。
- `references/docs/agent-diagrams.md` L43–49 — 流向类 "block head" → "open head"。
- `references/docs/architecture-diagrams.md` L104 — "filled block head" → open。
- `references/workflows/replicate.md` L208/212 — "Block/classic heads default..." → open 默认。
- `CHANGELOG.md` — 追加一条变更记录（不动历史行）。

`drawio-academic-skills` skill：
- `references/docs/publication-overlay.md` L113 — "bold `endSize=12` block heads" → open 默认。
- `CHANGELOG.md` — 追加一条。

## 改动点（测试）

`skills/drawio/scripts/dsl/spec-to-drawio.test.js`：
- L294–301 测试内主题表副本 → 同步改 open（若被断言引用）。
- L317 `assert ... endArrow=block`（默认 primary 边）→ open。
- L331 `endFill=0` 断言 — 确认其上下文，若已是 open/optional 边则不变。
- L1811–1812 `{primary: endArrow=block}` / `{data: endArrow=block}` → open。
- L2762–2765 "adds bold endSize to block arrows" — 让 fixture **显式**传 `endArrow=block`，断言保留（验证 R4）。

**不动**：`drawio-to-svg.test.js` 的 block fixture（测渲染，非默认）、`evals/fixtures/import-simple.drawio`（测导入既有 block 边）。

## 记忆更新

`C:\Users\lyh\.claude\projects\...\memory\drawio-diagram-user-preferences.md` 第 4 条重写为
Open 默认：`endArrow=open;endFill=0`（V 形无填充），注明 2026-07-13 推翻旧 block 偏好、
流向类适用、语义标记(UML/ER/菱形)保留、block 仅按需。description 行同步。

## Tradeoffs / Rollback

- **视觉权重**：open 比实心 block 轻，2px 粗线上更"细"。用户已确认接受；block 仍可按需。
- **Rollback**：改动集中、无数据迁移，单次 commit 反向 revert 即可恢复 block 默认。

## 实施补记 (2026-07-13)

两处规划期遗漏，实现时经 `.trellis/spec/drawio-skill/semantic-types.md` 与端到端验证发现并处理：

1. **主题 JSON 也带箭头 token（原设计漏）**：`assets/themes/*.json` 每个都有完整 `connector.*`
   段，其 `endArrow/endFill` **覆盖** base map。只改 `spec-to-drawio.js` 会被主题覆盖回 block。
   → 已对 11 个主题各改 6（academic-color 为 5）个流向类 block→open/false，共 65 处；`dependency`
   的 `diamond+true` 用成对正则严格避开，逐文件校验仍为合法 JSON 且 diamond 保留。
2. **endFill 改为随箭头类型约定（修 explicit-block 回归）**：原计划的 `endFill ?? false` 兜底会让
   显式 `endArrow=block`（无 endFill）继承到 false → 空心块（回归）。改为
   `defaultArrowFill(arrow)`：open/none→不填充，block/classic/diamond→填充；仅当箭头非显式覆盖时
   才取 `connectorTheme.endFill`。端到端确认：explicit block=filled、UML 继承=hollow、default=open。
