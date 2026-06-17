# 技术设计：优化 drawio-academic-skills 节点限制策略

## 1. 架构概述

本次优化涉及三个层次的修改：

```
drawio-skills/
├── skills/drawio/
│   ├── scripts/dsl/spec-to-drawio.js          [修改] 阈值调整
│   └── references/docs/
│       └── academic-figure-playbook.md        [修改] 文档增强
└── skills/drawio-academic-skills/
    ├── SKILL.md                                [修改] 主文档更新
    └── references/templates/                   [新增] 模板库
        ├── neural-network-architecture-compact.yaml
        ├── multi-module-system-compact.yaml
        └── workflow-with-legend-compact.yaml
```

### 设计原则

1. **最小侵入**：只修改阈值常量和文档，不改变核心转换逻辑
2. **向后兼容**：现有合法的 spec 不受影响
3. **渐进式指导**：warning → error → fatal 三级提示
4. **实践驱动**：基于真实用户案例（52 节点架构图）设计

---

## 2. 阈值调整设计

### 2.1 当前实现分析

**文件**：`skills/drawio/scripts/dsl/spec-to-drawio.js`

**位置**：Line 2269-2275（complexity check 函数）

**当前逻辑**：
```javascript
function checkComplexity(spec) {
  const warnings = []
  const nodeCount = spec.nodes.length
  const edgeCount = spec.edges.length
  const moduleCount = spec.modules?.length || 0

  if (nodeCount > 100) {
    warnings.push({ level: 'fatal', message: `Node count (${nodeCount}) exceeds safety limit of 100` })
  } else if (nodeCount > 30) {
    warnings.push({ level: 'error', message: `Too many nodes (${nodeCount}). Consider splitting into sub-diagrams.` })
  } else if (nodeCount > 20) {
    warnings.push({ level: 'warning', message: `Many nodes (${nodeCount}). Consider splitting for clarity.` })
  }
  
  // ... edge and module checks
  
  return warnings
}
```

**问题**：
- 30 节点触发 `error`，在 `--strict-warnings` 模式下中止转换
- 与学术架构图的实际需求不匹配

### 2.2 新阈值设计

**目标阈值**：

| 节点数 | 警告级别 | 行为 | 设计理由 |
|--------|---------|------|---------|
| ≤ 40 | 无警告 | 正常转换 | 适应大部分学术架构图 |
| 41-60 | warning | 正常转换，提示简化 | 允许复杂场景，但提醒用户 |
| 61-100 | error | 在 strict 模式下中止 | 强烈建议分图 |
| > 100 | fatal | 强制中止 | 硬限制，防止性能问题 |

**修改后的代码**：
```javascript
function checkComplexity(spec) {
  const warnings = []
  const nodeCount = spec.nodes.length
  const edgeCount = spec.edges.length
  const moduleCount = spec.modules?.length || 0

  // Node count thresholds adjusted for academic figures
  if (nodeCount > 100) {
    warnings.push({ 
      level: 'fatal', 
      message: `Node count (${nodeCount}) exceeds safety limit of 100` 
    })
  } else if (nodeCount > 60) {
    warnings.push({ 
      level: 'error', 
      message: `Too many nodes (${nodeCount}). Consider splitting into sub-diagrams. For academic figures, aim for 40 nodes or fewer.` 
    })
  } else if (nodeCount > 40) {
    warnings.push({ 
      level: 'warning', 
      message: `Many nodes (${nodeCount}). Consider splitting for clarity or using compact patterns (e.g., single-node legends).` 
    })
  }
  
  // ... edge and module checks remain unchanged
  
  return warnings
}
```

**变更说明**：
1. 30 → 60（error 阈值）
2. 20 → 40（warning 阈值）
3. 优化提示消息，增加学术图指导
4. 保持 100 硬限制不变

### 2.3 影响分析

**现有图表影响**：

| 节点数范围 | 当前行为 | 修改后行为 | 影响 |
|-----------|---------|-----------|------|
| 0-20 | 无警告 | 无警告 | 无影响 |
| 21-30 | warning | 无警告 | 更宽容 ✅ |
| 31-40 | error | warning | 允许转换 ✅ |
| 41-60 | error | warning | 允许转换 ✅ |
| 61-100 | error | error | 无影响 |
| >100 | fatal | fatal | 无影响 |

**向后兼容性**：✅ 完全兼容
- 所有之前能转换的图表仍可转换
- 部分之前被阻断的图表现在可以转换（但会收到 warning）

---

## 3. 文档增强设计

### 3.1 新增章节结构

在 `academic-figure-playbook.md` 第 150 行之后添加：

```markdown
## Node Budget Management

Academic figures should be clear and focused. Keep node count under 40 for optimal readability.

### Budget Guidelines

**Recommended targets by figure type**:

| Figure Type | Target Nodes | Maximum Nodes | Typical Distribution |
|------------|--------------|---------------|---------------------|
| Architecture | 30-35 | 60 | 4-6 modules × 5-7 nodes + legend (1-2) |
| Workflow | 25-30 | 50 | 15-20 steps + 5-8 decisions + legend (1) |
| Roadmap | 15-20 | 40 | 10-15 stages + 3-5 outputs + legend (1) |

**System warnings**:
- 41-60 nodes: warning (conversion succeeds)
- 61-100 nodes: error (blocked in strict mode)
- >100 nodes: fatal (always blocked)

### Node-Efficient Patterns

... (详见 PRD R2)
```

### 3.2 文档插入位置

**当前结构**：
```
academic-figure-playbook.md
├── Step 1: Classify the Figure (L5-16)
├── Figure Types (L17-67)
├── Scientific Figure Patterns (L68-107)
├── Visual Defaults (L108-116)
├── Academic Delivery Matrix (L117-137)
└── Final Quality Gate (L138-150)
```

**插入位置**：在 "Final Quality Gate" 之前，即 L137 之后

**新结构**：
```
academic-figure-playbook.md
├── ...
├── Academic Delivery Matrix (L117-137)
├── Node Budget Management (L138-220) [新增]
└── Final Quality Gate (L221-233)
```

### 3.3 内容设计细节

#### 3.3.1 对比示例格式

```markdown
#### Example 1: Legend

**❌ Expanded Legend (wastes 12 nodes)**:
```yaml
- id: legend_container
  label: "Legend"
  bounds: { x: 1000, y: 400, width: 200, height: 160 }
  style: { shape: box, fillColor: '#FAFAFA' }

- id: legend_arrow_solid
  label: ""
  bounds: { x: 1010, y: 430, width: 40, height: 2 }
  style: { strokeColor: '#1E3A5F', strokeWidth: 2 }

- id: legend_arrow_label
  label: "Data flow"
  bounds: { x: 1060, y: 426, width: 120, height: 16 }
  style: { shape: text, fontSize: 11 }

# ... 10 more nodes for each legend item
```

**✅ Compact Legend (1 node)**:
```yaml
- id: legend
  label: |
    Legend
    
    → Data flow
    ⇢ Conditional flow
    ⊙ Hadamard product
    ∥ Concatenation
    
    ■ Zone A: Feature extraction
    ■ Zone B: Conditional embedding
  bounds: { x: 1000, y: 400, width: 280, height: 140 }
  style:
    shape: text
    align: left
    fontSize: 11
```

**Savings**: 12 nodes → 1 node (11 nodes saved)
```

---

## 4. 模板库设计

### 4.1 模板规范

**通用元数据**：
```yaml
meta:
  profile: academic-paper
  figureType: architecture  # or workflow, roadmap
  theme: academic-color
  title: "Template Title"
  description: "Template description and use case"
  nodeCountTarget: 35  # Explicit budget target
  nodeCountActual: 32  # Actual node count in this template
  
  # Template-specific metadata
  template:
    name: "neural-network-architecture-compact"
    version: "1.0"
    author: "drawio-academic-skills"
    useCases:
      - "Multi-module neural network architectures"
      - "CNN, Transformer, or encoder-decoder models"
      - "Feature fusion architectures"
```

### 4.2 模板清单

#### 4.2.1 Neural Network Architecture (Compact)

**文件名**：`neural-network-architecture-compact.yaml`

**节点预算**：35 节点
- 4 个模块容器：4 节点
- 每模块 5-6 个核心节点：22 节点
- 数据流标注（公式）：6 节点
- 运算符节点：2 节点
- 图例（紧凑）：1 节点

**特点**：
- 展示模块分组减少顶层节点
- 使用紧凑图例
- 公式放在节点内，不用独立标注节点
- 展示典型的四模块架构（Input → Feature → Fusion → Output）

#### 4.2.2 Multi-Module System (Compact)

**文件名**：`multi-module-system-compact.yaml`

**节点预算**：28 节点
- 5 个模块容器：5 节点
- 每模块 3-4 个核心节点：18 节点
- 连接器标注：4 节点
- 图例（紧凑）：1 节点

**特点**：
- 展示如何用颜色区分模块类型
- 展示如何用连接器样式表达不同关系
- 适合微服务架构、系统设计图

#### 4.2.3 Workflow with Legend (Compact)

**文件名**：`workflow-with-legend-compact.yaml`

**节点预算**：25 节点
- 主流程步骤：15 节点
- 决策节点：5 节点
- 数据节点：4 节点
- 图例（紧凑）：1 节点

**特点**：
- 展示如何在工作流中使用紧凑图例
- 展示决策节点和循环的高效表示
- 适合实验流程、数据处理管道

### 4.3 模板注释规范

每个模板包含三层注释：

1. **文件头注释**（YAML 注释）：
```yaml
# Template: Neural Network Architecture (Compact)
# Version: 1.0
# Node Budget: 35 nodes (target < 40)
#
# This template demonstrates node-efficient patterns for academic neural network figures:
# - Compact legend (1 node with multi-line text)
# - Formulas embedded in node labels
# - Module grouping to reduce top-level nodes
#
# Usage:
#   1. Copy this file to your work directory
#   2. Modify meta.title and meta.description
#   3. Adjust module bounds and node positions
#   4. Keep node count < 40 for readability
```

2. **章节注释**（分隔不同部分）：
```yaml
# ============================================================================
# MODULES: 4 major stages (Input, Feature Extraction, Fusion, Output)
# ============================================================================

# ============================================================================
# NODES: Core processing nodes (grouped by module)
# ============================================================================

# ============================================================================
# LEGEND: Single-node compact legend
# ============================================================================
```

3. **内联注释**（解释关键设计决策）：
```yaml
- id: legend
  label: |
    Legend
    → Data flow  |  ⇢ Conditional flow    # Use | to separate items horizontally
    ⊙ Product  |  ∥ Concat
  bounds: { x: 1000, y: 400, width: 280, height: 100 }
  style:
    shape: text
    align: left
    fontSize: 10  # Smaller font OK for legend
    # fillColor omitted → transparent background
```

---

## 5. Skill 主文档更新设计

### 5.1 Academic Preflight 章节修改

**位置**：`skills/drawio-academic-skills/SKILL.md` L62-70

**当前内容**：
```markdown
## Academic Preflight

Before generating or editing, determine and state:

1. Venue or audience: paper, thesis, IEEE, journal, manuscript, Word/A4, LaTeX, slides, or review draft.
2. Figure type: exactly one of `architecture`, `roadmap`, or `workflow`.
3. Color policy: strict monochrome, grayscale-safe with one accent, or color digital/PDF.
4. Caption, legend, and title needs.
5. Formula and text-fidelity needs: delimiters, font family, standalone text boxes, edge labels, and callouts.
6. Export expectations: default final `.drawio` and `.svg`, the intermediate work directory, plus any requested PNG/PDF/JPG; whether Desktop is required.
```

**修改后**：
```markdown
## Academic Preflight

Before generating or editing, determine and state:

1. Venue or audience: paper, thesis, IEEE, journal, manuscript, Word/A4, LaTeX, slides, or review draft.
2. Figure type: exactly one of `architecture`, `roadmap`, or `workflow`.
3. Color policy: strict monochrome, grayscale-safe with one accent, or color digital/PDF.
4. Caption, legend, and title needs.
5. Formula and text-fidelity needs: delimiters, font family, standalone text boxes, edge labels, and callouts.
6. Export expectations: default final `.drawio` and `.svg`, the intermediate work directory, plus any requested PNG/PDF/JPG; whether Desktop is required.
7. **Node budget estimate**: Count major modules (4-6), nodes per module (5-8), formulas, and legend. If estimate > 40, confirm split/simplify strategy with user before generating. Use compact patterns from `references/templates/` or `academic-figure-playbook.md § Node Budget Management`.
```

### 5.2 Quality Gate 章节修改

**位置**：`skills/drawio-academic-skills/SKILL.md` L215-230

**添加检查项**：
```markdown
## Quality Gate

Do not claim completion until:

- final `.drawio` and `.svg` are aligned with work-dir `.spec.yaml` and `.arch.json`
- `meta.profile` is `academic-paper`
- `meta.figureType` is one of `architecture`, `roadmap`, or `workflow`
- **node count is reasonable**: < 40 nodes ideal, < 60 nodes acceptable with justification, > 60 nodes must split or simplify
- labels are readable at paper/A4 scale
- formulas use official delimiters: `$$...$$`, `\(...\)`, or AsciiMath backticks
- captions, legends, callouts, formulas, and edge labels are not clipped or placed on connector lines
- **legends use compact form**: single text node with multi-line content, not 10+ separate nodes
- colors are not the only carrier of meaning
- ...
```

---

## 6. 实施顺序与依赖

```
M1: 阈值调整
  ├─ 修改 spec-to-drawio.js
  └─ 边界测试（30, 40, 60, 100 节点）
      ↓
M2: 文档增强
  ├─ 添加 Node Budget Management 章节
  ├─ 编写对比示例
  └─ 添加分图策略指导
      ↓
M3: 模板库创建
  ├─ 创建 templates/ 目录
  ├─ 编写 neural-network-architecture-compact.yaml
  ├─ 编写 multi-module-system-compact.yaml
  └─ 编写 workflow-with-legend-compact.yaml
      ↓
M4: Skill 主文档更新
  ├─ 修改 Academic Preflight
  └─ 修改 Quality Gate
      ↓
M5: 端到端验证
  ├─ 测试用户 52 节点 spec
  ├─ 测试新模板生成
  └─ 文档示例可运行性检查
```

**依赖关系**：
- M2 依赖 M1（文档需引用新阈值）
- M3 独立于 M1/M2（可并行）
- M4 依赖 M2（引用新文档章节）
- M5 依赖 M1/M2/M3/M4（全部完成后验证）

---

## 7. 测试策略

### 7.1 单元测试

**测试用例**：

| 用例ID | 节点数 | 预期警告级别 | 预期转换结果 |
|--------|--------|-------------|-------------|
| T1 | 20 | 无 | 成功 |
| T2 | 40 | 无 | 成功 |
| T3 | 41 | warning | 成功 |
| T4 | 50 | warning | 成功 |
| T5 | 60 | warning | 成功 |
| T6 | 61 | error | 失败（strict 模式） |
| T7 | 80 | error | 失败（strict 模式） |
| T8 | 100 | error | 失败（strict 模式） |
| T9 | 101 | fatal | 失败（所有模式） |

**测试方法**：
```bash
# 生成不同节点数的测试 spec
node scripts/test/generate-test-spec.js --nodes 40 > test-40.yaml
node scripts/test/generate-test-spec.js --nodes 61 > test-61.yaml

# 运行 CLI 测试
node skills/drawio/scripts/cli.js test-40.yaml test-40.drawio --strict-warnings
node skills/drawio/scripts/cli.js test-61.yaml test-61.drawio --strict-warnings
```

### 7.2 集成测试

**测试场景**：

1. **用户真实案例**：
   - 输入：52 节点 spec（多源多速率软测量架构）
   - 预期：转换成功，收到 warning（41-60 节点范围）

2. **模板生成测试**：
   - 使用 3 个新模板生成图表
   - 验证节点数 < 40
   - 验证输出质量

3. **文档示例测试**：
   - 运行文档中的所有代码示例
   - 验证示例可以正常转换

### 7.3 回归测试

**范围**：现有示例库

```bash
# 测试所有现有示例
for example in skills/drawio/references/examples/*.yaml; do
  echo "Testing: $example"
  node skills/drawio/scripts/cli.js "$example" "test-output/$(basename $example .yaml).drawio"
done
```

**预期**：所有现有示例转换成功，警告级别不应提升

---

## 8. 风险与缓解

### 8.1 性能风险

**风险**：放宽阈值可能导致复杂图表渲染慢

**缓解**：
- 保持 100 节点硬限制
- 60 节点仍触发 error，在 strict 模式下阻断
- 文档明确建议 40 节点为目标

### 8.2 用户体验风险

**风险**：用户不看文档，直接生成超大图

**缓解**：
- 在 warning 消息中直接给出建议（"use compact patterns"）
- 在 error 消息中引用文档章节
- 提供现成模板降低学习成本

### 8.3 维护风险

**风险**：模板过时或与 skill 更新不同步

**缓解**：
- 模板使用标准 YAML spec 格式
- 在模板头注释中标注版本号
- 每次 skill 重大更新时检查模板兼容性

---

## 9. 推出计划

### 9.1 Alpha 阶段（内部验证）

**时间**：实施完成后立即开始

**验证内容**：
1. 用户 52 节点 spec 可以成功转换
2. 新模板可以正常使用
3. 文档示例可运行

**参与者**：开发团队

### 9.2 Beta 阶段（小范围试用）

**时间**：Alpha 验证通过后

**验证内容**：
1. 邀请原始用户测试
2. 收集使用反馈
3. 调整文档和模板

**参与者**：3-5 名早期用户

### 9.3 GA 阶段（正式发布）

**时间**：Beta 反馈处理完成后

**发布内容**：
1. 更新 skill 版本号
2. 添加 CHANGELOG 条目
3. 更新 README

---

## 10. 度量指标

### 10.1 成功指标

| 指标 | 目标 | 测量方式 |
|-----|------|---------|
| 用户案例通过率 | 100% | 52 节点 spec 成功转换 |
| 模板节点数 | < 40 | 实际统计 |
| 文档完整性 | 100% | 所有示例可运行 |
| 回归测试通过率 | 100% | 现有示例无破坏 |

### 10.2 质量指标

| 指标 | 目标 | 测量方式 |
|-----|------|---------|
| 代码修改行数 | < 20 行 | Git diff |
| 文档新增内容 | 100-150 行 | Markdown 行数 |
| 模板数量 | ≥ 2 个 | 文件计数 |

---

## 附录

### A. 相关文件清单

**需要修改的文件**：
1. `skills/drawio/scripts/dsl/spec-to-drawio.js` - 阈值调整
2. `skills/drawio/references/docs/academic-figure-playbook.md` - 文档增强
3. `skills/drawio-academic-skills/SKILL.md` - 主文档更新

**需要创建的文件**：
1. `skills/drawio-academic-skills/references/templates/neural-network-architecture-compact.yaml`
2. `skills/drawio-academic-skills/references/templates/multi-module-system-compact.yaml`
3. `skills/drawio-academic-skills/references/templates/workflow-with-legend-compact.yaml`

### B. 代码审查清单

- [ ] 阈值修改仅涉及常量，无逻辑变更
- [ ] 新增文档符合现有风格
- [ ] 模板包含完整注释
- [ ] 所有示例代码可运行
- [ ] 无硬编码路径或平台相关代码
- [ ] 向后兼容性验证通过
