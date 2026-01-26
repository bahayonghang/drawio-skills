# A-H Format Reference

A structured diagram specification format for deterministic, reproducible diagram generation.

## Overview

The A-H format is an 8-section specification that transforms text or images into standardized diagrams:

```
Input (Text/Image) → A-H Spec → Draw.io XML → Rendered Diagram
```

| Section | Purpose |
|---------|---------|
| **A** | Layout: canvas ratio, flow direction |
| **B** | Modules: 1-4 logical groupings |
| **C** | Nodes: ID and label for each node |
| **D** | Edges: connections with relation types |
| **E** | Groupings: phases or timelines |
| **F** | Methods: tools, metrics, techniques |
| **G** | Visual: colors, icons, emphasis |
| **H** | Export: format recommendations |

---

## Prompt Template

```
【角色】你是"结构化流程图架构师+信息抽取专家"。

【领域】<<<指定领域：如 软件架构/商业流程/工业流程/教学设计/项目管理/通用 >>>

【输入类型】<<<选择：文本 / 图片 / 图片+文本 >>>

【输入内容】
<<<在此粘贴文本或上传图片>>>

【语言】<<<指定：中文 / English / 自动检测 >>>

【唯一输出】仅输出一份【A–H绘图规格】；必须按A→H顺序；除A–H外不得输出任何文字。

【硬规则（违者失败）】
1) 只用输入内容明确包含的实体、步骤、流程、方法、指标、产出；严禁补充未写内容。
2) 流程顺序从输入内容推断，遵循领域通用逻辑（如有歧义则按阅读顺序）。
3) 模块≤4；每模块3–5节点；可合并概括但不得新增含义。
4) 缺失信息标注"未提及"，不得推断或臆测。
5) 节点Label使用指定语言的短语（≤14字符/单词）；Label不得含编号、括号或特殊符号。
6) 节点ID仅用于连线（N1, N2...），不显示在图中。
7) 连线关系限定：因果/并行/分支/反馈/依赖。
8) 线型限定：实线箭头（主流程）/虚线箭头（数据流或弱关联）/T形线（约束或阻断，仅输入明确时用）。

【工作流要求】先在内部完成"结构分析"和"草图设计"（不输出），再输出最终A–H。

【A–H格式】
A 总体布局：画布比例（如16:9）；主流程方向（上→下/左→右）；阅读顺序说明
B 模块设置：模块1–4，每模块一句话描述其目的
C 节点清单：逐条列出
   模块X-步骤Y
   ID: N1
   Label: <短语>
D 连线关系：逐条列出
   N1→N2；关系：…；线型：…
E 分组与阶段：如有分组/阶段/时间线则写明，无则写"未提及"
F 方法与标签：技术方法、工具、指标等补充标签；无则写"未提及"
G 视觉规范：模块配色方案；重点强调色；图标建议（根据领域适配）
H 导出建议：推荐格式（PNG/SVG/drawio）；超限时的简化策略
```

---

## Domain Configurations

### 软件架构 (Software Architecture)
```
【领域】软件架构
【风格】专业
【图标建议】服务器/数据库/API/客户端/消息队列/缓存/负载均衡
【典型流程】用户请求→网关→服务→数据层→响应
```

### 商业流程 (Business Process)
```
【领域】商业流程
【图标建议】用户/表单/审批/通知/存储/报表
【典型流程】输入→处理→决策→输出→归档
```

### 工业流程 (Industrial Process)
```
【领域】工业流程
【图标建议】传感器/控制器/执行器/数据库/监控屏/报警
【典型流程】对象→采集→处理→控制→产出
```

### 科研流程 (Research Workflow)
```
【领域】科研流程
【图标建议】样本/实验/数据/分析/模型/产出
【典型流程】对象→采集→处理→分析/建模→产出
【特殊规则】样本量、统计方法、伦理声明如有则标注
```

### 项目管理 (Project Management)
```
【领域】项目管理
【图标建议】里程碑/任务/团队/交付物/风险/决策点
【典型流程】启动→规划→执行→监控→收尾
```

### 教学设计 (Teaching Design)
```
【领域】教学设计
【图标建议】学习目标/内容/活动/评估/反馈
【典型流程】目标→内容→活动→评估→改进
```

### IEEE网络架构 (IEEE Network)
```
【领域】网络架构
【风格】IEEE标准
【图标建议】路由器(R)/交换机(SW)/防火墙(FW)/云/服务器
【典型流程】核心层→汇聚层→接入层
【特殊规则】使用正交连线；区分实线(物理)/虚线(逻辑)；黑白友好高对比度
```

---

## Quality Gates

### Output Contract

| Rule | Valid | Invalid |
|------|-------|---------|
| Section count | Exactly 8 (A–H) | Missing or extra sections |
| Section order | A → B → C → D → E → F → G → H | Any other order |
| Extra text | None | Preface like "好的，以下是..." or trailing notes |

### Structure Constraints

| Constraint | Limit | Failure Condition |
|------------|-------|-------------------|
| Module count | ≤ 4 | More than 4 modules |
| Nodes per module | 3–5 | Fewer than 3 or more than 5 |
| Missing info | "未提及" / "Not specified" | Inferred or guessed content |

### Node Label Rules (Section C)

| Rule | Valid Example | Invalid Example |
|------|---------------|-----------------|
| Language | 用户认证 / User Auth | Mixed without reason |
| Length | ≤14 chars/words | 这是一个非常长的节点标签名称 |
| No numbers | 数据处理 | N1 数据处理 |
| No brackets | 数据清洗 | 数据清洗(ETL) |
| No punctuation | 异常检测 | 数据清洗-去噪 |
| No special symbols | 用户验证 | AI模型★ |

### Edge Rules (Section D)

| Rule | Valid | Invalid |
|------|-------|---------|
| Reference format | N1→N2 | 数据采集→数据处理 |
| Relation values | 因果 / 并行 / 分支 / 反馈 / 依赖 | 连接 / 关联 / 其他 |
| Line types | 实线箭头 / 虚线箭头 / T形线 | 双向箭头 / 波浪线 |

---

## Regression Examples

### ✅ PASS: Minimal Input

**Input:**
```
【领域】通用
【输入内容】
收集用户反馈，整理分类后提交给产品团队，最终形成改进报告。
```

**Expected:**
- 3 modules maximum (收集 → 处理 → 产出)
- Simple labels: 反馈收集, 分类整理, 报告生成

### ❌ FAIL: Extra Text

**Invalid:**
```
好的，我来帮你生成A-H格式的图表规格：

A 总体布局：...
...
H 导出建议：...

希望这个规格对你有帮助！
```

**Reason:** Contains preface and trailing text.

### ❌ FAIL: Labels with Prohibited Characters

**Invalid:**
```
C 节点清单：
  ID: N1
  Label: N1-数据采集(传感器)
```

**Violations:** ID prefix "N1-" and brackets "(传感器)"

**Correct:**
```
  Label: 数据采集
```

### ❌ FAIL: Edges with Labels Instead of IDs

**Invalid:**
```
D 连线关系：
  数据采集→数据清洗；关系：因果
```

**Correct:**
```
D 连线关系：
  N1→N2；关系：因果；线型：实线箭头
```

---

## A-H to XML Conversion

### Implementation

The converter is located at `src/dsl/ah-to-drawio.js`:

```javascript
import { ahToDrawioXml, parseAh } from './src/dsl/ah-to-drawio.js'

// Parse A-H text to structured data
const parsed = parseAh(ahText)
// { sections, modules, nodes, edges }

// Convert directly to XML
const xml = ahToDrawioXml(ahText, { page: { width: 1280, height: 720 } })
```

### What It Does

- Parses sections A–H from plain text
- Reads nodes from section C (`ID: N1`, `Label: ...`)
- Reads edges from section D (`N1→N2 ...`)
- Applies dashed style for `虚线` line type
- Generates layout with module containers and stacked nodes
- Validates and XML-escapes labels via `src/math` helpers
- Emits numeric `mxCell id="..."` for draw.io compatibility

### Limitations (By Design)

- Layout is deterministic, not auto-optimized
- Only uses IDs in edges; ignores labels in section D
- Treats `T形线` as normal edge style
- Logical IDs stored in `data-id` attribute

### Example A-H Input

```
A 总体布局：16:9；左→右
B 模块设置：
模块1：计算
模块2：评估
C 节点清单：
模块1-步骤1
ID: N1
Label: 线性模型 \(y=Wx+b\)
模块2-步骤1
ID: N2
Label: $$\mathcal{L}=\sum_i (y_i-\hat y_i)^2$$
D 连线关系：
N1→N2；关系：因果；线型：实线箭头
E 分组与阶段：未提及
F 方法与标签：未提及
G 视觉规范：未提及
H 导出建议：drawio
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│  A–H Format Quick Validation                            │
├─────────────────────────────────────────────────────────┤
│  ✓ Exactly 8 sections (A→H order)                       │
│  ✓ No text outside sections                             │
│  ✓ Modules ≤ 4                                          │
│  ✓ Nodes per module: 3–5                                │
│  ✓ Labels: ≤14 chars, no symbols/numbers/brackets       │
│  ✓ Edges: N1→N2 format only                             │
│  ✓ Relations: 因果/并行/分支/反馈/依赖                    │
│  ✓ Lines: 实线箭头/虚线箭头/T形线                        │
│  ✓ Missing info: "未提及" (never infer)                  │
│  ✓ All content from input only                          │
└─────────────────────────────────────────────────────────┘
```
