# PRD: 优化 drawio-academic-skills 节点限制策略

## 背景

用户在使用 `drawio-academic-skills` 创建博士论文的神经网络架构图时遇到节点数超限错误。当前实现中，30 个节点的阈值触发 `error` 级别警告，在 `--strict-warnings` 模式下导致转换失败。

**现状**：
- 当前阈值：30 节点（error）/ 20 节点（warning）/ 100 节点（fatal）
- 用户实际需求：52 个节点（4 个区域 + 多个处理步骤 + 图例）
- IEEE 论文典型节点数：25-35 个节点

**根本问题**：
1. 30 节点的 error 阈值对学术架构图过于严格（70% skill 设计问题）
2. 缺少节点高效使用的指导文档（skill 设计问题）
3. 用户使用了节点低效的模式，如展开式图例（30% 使用方式问题）

## 目标

### 主要目标
1. 调整节点复杂度阈值，使其适应学术架构图的合理复杂度
2. 增强文档指导，帮助用户高效使用节点预算
3. 提供高效模板，减少用户试错成本

### 非目标
- 不移除节点数限制（100 节点硬限制保持）
- 不自动重构用户的 YAML spec
- 不添加复杂的节点优化算法

## 需求

### R1: 调整复杂度阈值（必需，P0）

**位置**：`skills/drawio/scripts/dsl/spec-to-drawio.js:2269-2275`

**当前代码**：
```javascript
if (nodeCount > 100) {
  warnings.push({ level: 'fatal', message: `Node count (${nodeCount}) exceeds safety limit of 100` })
} else if (nodeCount > 30) {
  warnings.push({ level: 'error', message: `Too many nodes (${nodeCount}). Consider splitting into sub-diagrams.` })
} else if (nodeCount > 20) {
  warnings.push({ level: 'warning', message: `Many nodes (${nodeCount}). Consider splitting for clarity.` })
}
```

**目标代码**：
```javascript
if (nodeCount > 100) {
  warnings.push({ level: 'fatal', message: `Node count (${nodeCount}) exceeds safety limit of 100` })
} else if (nodeCount > 60) {
  warnings.push({ level: 'error', message: `Too many nodes (${nodeCount}). Consider splitting into sub-diagrams.` })
} else if (nodeCount > 40) {
  warnings.push({ level: 'warning', message: `Many nodes (${nodeCount}). Consider splitting for clarity.` })
}
```

**理由**：
- 60 节点适应复杂学术架构图（4-6 个模块，每模块 5-8 个节点，加图例和标注）
- 40 节点作为 warning 阈值，提前提醒用户考虑简化
- 保持 100 作为硬限制，防止极端复杂的图

### R2: 增强节点预算管理文档（必需，P0）

**位置**：`skills/drawio/references/docs/academic-figure-playbook.md`

**添加新章节**：`## Node Budget Management`

**内容要求**：
1. **节点预算原则**
   - 目标：40 节点以内
   - 最大：60 节点
   - 典型分布示例

2. **节点高效模式 vs 节点浪费模式**
   - ✅ 紧凑图例（1 节点，多行文本）
   - ❌ 展开图例（10+ 节点，每项独立）
   - ✅ 装饰性元素简化（1 节点 + 描述）
   - ❌ 装饰性元素详细绘制（8+ 节点）

3. **何时应该分图**
   - 节点数接近 50
   - 解释 3+ 个独立机制
   - 需要放大才能看清标签

4. **分图策略**
   - 按数据路径分图（如：高频路径 / 低频路径）
   - 按层次分图（如：总览 / 模块细节）
   - 按机制分图（如：特征提取 / 条件融合）

### R3: 创建高效模板库（必需，P1）

**位置**：`skills/drawio-academic-skills/references/templates/`

**模板清单**：
1. `neural-network-architecture-compact.yaml` - 紧凑神经网络架构模板
2. `multi-module-system-compact.yaml` - 多模块系统架构模板
3. `workflow-with-legend-compact.yaml` - 带图例的工作流模板

**模板要求**：
- 每个模板包含明确的 `nodeCountTarget` 注释
- 展示紧凑图例的使用方式
- 展示如何用模块分组减少顶层节点数
- 包含完整的注释说明

### R4: 更新 skill 主文档（可选，P2）

**位置**：`skills/drawio-academic-skills/SKILL.md`

**修改内容**：
- 在 "Academic Preflight" 章节添加节点预算检查项
- 在 "Quality Gate" 章节添加节点数检查

**示例**：
```markdown
## Academic Preflight

Before generating or editing, determine and state:

1. Venue or audience: ...
2. Figure type: ...
3. Color policy: ...
4. Caption, legend, and title needs.
5. Formula and text-fidelity needs: ...
6. Export expectations: ...
7. **Node budget estimate**: Count major modules, nodes per module, formulas, and legend. If estimate > 40, confirm split/simplify strategy with user.
```

## 验收标准

### AC1: 阈值调整生效
- [ ] 修改 `spec-to-drawio.js` 中的阈值
- [ ] 40 节点触发 warning，60 节点触发 error，100 节点触发 fatal
- [ ] 用户的 52 节点 spec 可以成功转换（仅 warning，不阻断）

### AC2: 文档完整性
- [ ] `academic-figure-playbook.md` 包含完整的 "Node Budget Management" 章节
- [ ] 至少 2 组对比示例（高效 vs 浪费）
- [ ] 明确的分图策略指导

### AC3: 模板可用性
- [ ] 至少创建 2 个高效模板
- [ ] 每个模板节点数 < 40
- [ ] 模板包含完整的使用注释

### AC4: 端到端验证
- [ ] 使用调整后的阈值，用户的 52 节点 spec 可以成功转换
- [ ] 使用新模板创建测试图，节点数符合预期
- [ ] 文档中的示例代码可以正常运行

## 技术约束

1. **向后兼容**：阈值调整不应破坏现有的正常图表
2. **无破坏性修改**：只修改阈值和文档，不修改核心转换逻辑
3. **文档一致性**：新增文档与现有 skill 文档风格保持一致

## 风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|-----|------|------|---------|
| 放宽阈值导致性能问题 | 低 | 中 | 保持 100 节点硬限制，60 节点仍有 error 提示 |
| 模板不符合用户实际需求 | 中 | 低 | 基于真实用户案例（52 节点架构图）设计模板 |
| 文档指导不够清晰 | 中 | 中 | 提供对比示例和明确的数字指标 |

## 测试计划

### 单元测试
1. 修改阈值后，运行现有测试套件确保无回归
2. 测试边界值：30, 40, 50, 60, 100 节点的 spec

### 集成测试
1. 使用用户的 52 节点 spec 进行端到端测试
2. 使用新模板生成测试图，验证节点数和质量

### 用户验证
1. 让原始用户使用调整后的 skill 重新生成图表
2. 收集反馈，确认问题已解决

## 里程碑

- **M1**: 阈值调整完成（预计 1 小时）
- **M2**: 文档增强完成（预计 2 小时）
- **M3**: 模板库创建完成（预计 2 小时）
- **M4**: 端到端验证完成（预计 1 小时）

## 附录

### 参考资料
- 诊断报告：`skills/skill-creator/drawio-academic-skills-analysis.md`
- 用户原始 spec：`.drawio-tmp/多源多速率软测量架构/spec.yaml`（52 节点）
- 现有 playbook：`skills/drawio/references/docs/academic-figure-playbook.md`

### 相关讨论
- 用户反馈：遇到 "Too many nodes (48)" 错误，实际 spec 有 52 个节点
- 分析结论：70% skill 设计问题，30% 使用方式问题
