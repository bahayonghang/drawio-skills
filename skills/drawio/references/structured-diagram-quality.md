# Structured Diagram Quality Gates

This reference defines deterministic validation rules and regression examples for the A–H format structured diagram prompts.

---

## Validation Checklist

### 1. Output Contract

| Rule | Valid | Invalid |
|------|-------|---------|
| Section count | Exactly 8 (A–H) | Missing or extra sections |
| Section order | A → B → C → D → E → F → G → H | Any other order |
| Extra text | None | Preface like "好的，以下是..." or trailing notes |

### 2. Structure Constraints

| Constraint | Limit | Failure Condition |
|------------|-------|-------------------|
| Module count | ≤ 4 | More than 4 modules |
| Nodes per module | 3–5 | Fewer than 3 or more than 5 |
| Missing info | "未提及" / "Not specified" | Inferred or guessed content |

### 3. Node Label Rules (Section C)

| Rule | Valid Example | Invalid Example |
|------|---------------|-----------------|
| Language | 用户认证 / User Auth | Mixed without reason |
| Length | ≤14 chars/words | 这是一个非常长的节点标签名称 |
| No numbers | 数据处理 | N1 数据处理 |
| No brackets | 数据清洗 | 数据清洗(ETL) |
| No punctuation | 异常检测 | 数据清洗-去噪 |
| No special symbols | 用户验证 | AI模型★ |

### 4. Edge Rules (Section D)

| Rule | Valid | Invalid |
|------|-------|---------|
| Reference format | N1→N2 | 数据采集→数据处理 |
| Relation values | 因果 / 并行 / 分支 / 反馈 / 依赖 | 连接 / 关联 / 其他 |
| Line types | 实线箭头 / 虚线箭头 / T形线 | 双向箭头 / 波浪线 |
| T-line usage | Only when input explicitly states constraint | Assumed constraints |

### 5. Content Integrity

| Rule | Description |
|------|-------------|
| Source fidelity | All entities/processes must exist in input |
| No hallucination | Never add content not in source |
| No inference | If unsure, mark "未提及" |
| Domain alignment | Icons/flow match specified domain |

### 6. Aesthetic Quality (Post-Generation Checklist)

Use this checklist after the diagram is rendered (browser preview) to ensure the output is publication-ready:

- Alignment: nodes within the same layer aligned; consistent widths/heights
- Spacing: even distribution; enough whitespace around containers and labels
- Palette: 3–4 semantic colors maximum; high contrast; B&W-friendly where needed
- Connectors: prefer orthogonal routing; avoid crossings; dashed only for “虚线箭头” semantics
- Labels: short and readable; left-aligned for formulas; no clipping or overflow
- Legend: include a small legend when using multiple line types / zones
- Export: enable crop; prefer SVG/PDF for papers; verify no extra whitespace around formulas

---

## Regression Examples

### ✅ PASS 1: Minimal Input (No Domain Terms)

**Input:**
```
【领域】通用
【输入内容】
收集用户反馈，整理分类后提交给产品团队，最终形成改进报告。
```

**Expected Output Characteristics:**
- 3 modules maximum (收集 → 处理 → 产出)
- No AI/ML/industrial terms added
- Simple labels: 反馈收集, 分类整理, 报告生成

---

### ✅ PASS 2: Domain-Specific Terms Present

**Input:**
```
【领域】软件架构
【输入内容】
用户请求通过API网关，经过负载均衡分发到微服务集群。
服务调用Redis缓存和MySQL数据库，结果通过Kafka消息队列异步返回。
```

**Expected Output Characteristics:**
- May include: API网关, 负载均衡, 微服务, 缓存, 数据库, 消息队列
- Icons suggested: 服务器, 数据库, 消息队列, 缓存
- Flow follows input order

---

### ✅ PASS 3: Image + Text Input

**Input:**
```
【输入类型】图片+文本
【输入内容】
[Existing flowchart with 5 boxes]
这是我们当前的审批流程，请按A-H格式重新整理。
```

**Expected Output Characteristics:**
- Structure matches original image
- Labels derived from image text
- No additions beyond what's visible

---

### ❌ FAIL 1: Extra Text Outside A–H

**Invalid Output:**
```
好的，我来帮你生成A-H格式的图表规格：

A 总体布局：...
...
H 导出建议：...

希望这个规格对你有帮助！
```

**Reason:** Contains preface and trailing text.

---

### ❌ FAIL 2: Labels Contain Prohibited Characters

**Invalid Labels:**
```
C 节点清单：
  模块1-步骤1
  ID: N1
  Label: N1-数据采集(传感器)
```

**Violations:**
- Contains "N1-" (ID prefix)
- Contains "(传感器)" (brackets)

**Correct:**
```
  Label: 数据采集
```

---

### ❌ FAIL 3: Edges Reference Labels Instead of IDs

**Invalid D Section:**
```
D 连线关系：
  数据采集→数据清洗；关系：因果；线型：实线箭头
```

**Correct:**
```
D 连线关系：
  N1→N2；关系：因果；线型：实线箭头
```

---

### ❌ FAIL 4: Content Not in Source

**Input:**
```
【输入内容】
采集温度数据，生成报告。
```

**Invalid Output:**
```
B 模块设置：
  模块1：数据采集层
  模块2：AI预测分析层  ← 未在输入中出现
  模块3：报告生成层
```

**Reason:** "AI预测分析" was not mentioned in input.

---

### ❌ FAIL 5: Modules Exceed Limit

**Invalid B Section:**
```
B 模块设置：
  模块1：输入层
  模块2：预处理层
  模块3：核心处理层
  模块4：后处理层
  模块5：输出层  ← 超过4个模块
```

**Solution:** Merge modules to stay within ≤4 limit.

---

### ❌ FAIL 6: Invalid Relation Type

**Invalid D Section:**
```
D 连线关系：
  N1→N2；关系：连接；线型：实线箭头
```

**Reason:** "连接" is not a valid relation type.

**Valid Relations:** 因果 / 并行 / 分支 / 反馈 / 依赖

---

## Automated Validation Pseudocode

```python
def validate_ah_output(output: str) -> list[str]:
    errors = []

    # Check section structure
    sections = parse_sections(output)
    if set(sections.keys()) != {'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'}:
        errors.append("Missing or extra sections")

    # Check no extra text
    if has_text_outside_sections(output):
        errors.append("Extra text outside A–H")

    # Check module count
    modules = parse_modules(sections['B'])
    if len(modules) > 4:
        errors.append(f"Module count {len(modules)} exceeds limit 4")

    # Check node labels
    for node in parse_nodes(sections['C']):
        if len(node.label) > 14:
            errors.append(f"Label too long: {node.label}")
        if has_prohibited_chars(node.label):
            errors.append(f"Label has prohibited chars: {node.label}")

    # Check edge references
    for edge in parse_edges(sections['D']):
        if not edge.uses_ids():
            errors.append(f"Edge uses labels instead of IDs: {edge}")
        if edge.relation not in VALID_RELATIONS:
            errors.append(f"Invalid relation: {edge.relation}")
        if edge.line_type not in VALID_LINE_TYPES:
            errors.append(f"Invalid line type: {edge.line_type}")

    return errors

VALID_RELATIONS = {'因果', '并行', '分支', '反馈', '依赖'}
VALID_LINE_TYPES = {'实线箭头', '虚线箭头', 'T形线'}
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
