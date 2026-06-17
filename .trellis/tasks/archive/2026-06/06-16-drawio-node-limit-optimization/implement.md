# 实施计划：优化 drawio-academic-skills 节点限制策略

## 概览

本实施计划将优化工作分为 5 个里程碑，预计总耗时 6 小时。

## 执行顺序

```
M1: 阈值调整 (1h)
  ↓
M2: 文档增强 (2h)
  ↓
M3: 模板库创建 (2h)
  ↓
M4: Skill 主文档更新 (0.5h)
  ↓
M5: 端到端验证 (1h)
```

---

## M1: 阈值调整 (预计 1 小时)

### 步骤 1.1: 修改 spec-to-drawio.js

**文件**: `skills/drawio/scripts/dsl/spec-to-drawio.js`

**定位**: Line 2269-2275

**修改内容**:
```javascript
// 修改前
} else if (nodeCount > 30) {
  warnings.push({ level: 'error', message: `Too many nodes (${nodeCount}). Consider splitting into sub-diagrams.` })
} else if (nodeCount > 20) {
  warnings.push({ level: 'warning', message: `Many nodes (${nodeCount}). Consider splitting for clarity.` })
}

// 修改后
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
```

### 步骤 1.2: 快速验证

运行快速测试确认修改生效:

```bash
# 创建 40 节点测试 spec
cat > test-40-nodes.yaml << 'EOF'
meta:
  profile: academic-paper
  figureType: architecture
  theme: academic

nodes:
$(for i in {1..40}; do echo "  - id: node$i"; echo "    label: Node $i"; echo "    bounds: { x: $((i*30)), y: 100, width: 80, height: 40 }"; done)

edges: []
EOF

# 测试转换（应该无警告）
node skills/drawio/scripts/cli.js test-40-nodes.yaml test-40.drawio --strict-warnings

# 创建 61 节点测试 spec
# (修改上述 {1..40} 为 {1..61})

# 测试转换（应该有 error）
node skills/drawio/scripts/cli.js test-61-nodes.yaml test-61.drawio --strict-warnings
```

**验收标准**:
- [ ] 40 节点转换成功，无警告
- [ ] 61 节点转换失败（strict 模式），显示 error
- [ ] Error 消息包含 "For academic figures, aim for 40 nodes or fewer"

---

## M2: 文档增强 (预计 2 小时)

### 步骤 2.1: 添加 Node Budget Management 章节

**文件**: `skills/drawio/references/docs/academic-figure-playbook.md`

**插入位置**: Line 137 之后（在 "Final Quality Gate" 之前）

**内容章节**:
1. Budget Guidelines (表格：不同图类型的节点预算)
2. Node-Efficient Patterns (对比示例)
3. When to Split (分图信号)
4. Split Strategies (分图策略)

**验收标准**:
- [ ] 章节完整，包含 4 个子章节
- [ ] 至少 2 组对比示例（高效 vs 浪费）
- [ ] 明确的数字阈值（40/60）

### 步骤 2.2: 编写对比示例

**示例 1: 图例**
- ❌ 展开图例（12 个节点）
- ✅ 紧凑图例（1 个节点）

**示例 2: 装饰性元素**
- ❌ 柱状图（8 个矩形节点）
- ✅ 简化表示（1 个带描述的节点）

### 步骤 2.3: 添加分图策略指导

包含三种分图策略:
- 按数据路径分图
- 按层次分图
- 按机制分图

---

## M3: 模板库创建 (预计 2 小时)

### 步骤 3.1: 创建模板目录

```bash
mkdir -p skills/drawio-academic-skills/references/templates
```

### 步骤 3.2: 创建模板 1 - 神经网络架构

**文件**: `neural-network-architecture-compact.yaml`

**节点预算**: 35 节点
- 4 个模块容器
- 每模块 5-6 个节点
- 紧凑图例（1 节点）

**关键特性**:
- 展示模块分组
- 紧凑图例示例
- LaTeX 公式嵌入节点标签

### 步骤 3.3: 创建模板 2 - 多模块系统

**文件**: `multi-module-system-compact.yaml`

**节点预算**: 28 节点
- 5 个模块容器
- 每模块 3-4 个节点
- 紧凑图例（1 节点）

**关键特性**:
- 展示颜色编码
- 展示连接器样式区分

### 步骤 3.4: 创建模板 3 - 工作流（可选）

**文件**: `workflow-with-legend-compact.yaml`

**节点预算**: 25 节点

**验收标准**:
- [ ] 至少 2 个模板创建完成
- [ ] 每个模板节点数 < 40
- [ ] 模板包含完整的注释和使用说明

---

## M4: Skill 主文档更新 (预计 0.5 小时)

### 步骤 4.1: 更新 Academic Preflight

**文件**: `skills/drawio-academic-skills/SKILL.md`

**位置**: Line 62-70

**添加**: 第 7 项 - 节点预算估算

### 步骤 4.2: 更新 Quality Gate

**位置**: Line 215-230

**添加检查项**:
- 节点数合理性检查
- 图例紧凑性检查

**验收标准**:
- [ ] Academic Preflight 包含节点预算项
- [ ] Quality Gate 包含节点数检查

---

## M5: 端到端验证 (预计 1 小时)

### 步骤 5.1: 用户案例验证

**测试用例**: 52 节点多源多速率软测量架构

```bash
cd "d:\Documents\LYH\200-Learning\00博士毕业\毕业论文\thesis"

# 使用修改后的阈值重新转换
node .claude/skills/drawio/scripts/cli.js \
  .drawio-tmp/多源多速率软测量架构/spec.yaml \
  drawio/chapter3/多源多速率软测量架构-v2.drawio \
  --validate --strict-warnings
```

**预期结果**: 
- 转换成功
- 收到 warning（52 节点在 41-60 范围）
- 无 error 阻断

### 步骤 5.2: 模板生成测试

```bash
# 测试模板 1
node skills/drawio/scripts/cli.js \
  skills/drawio-academic-skills/references/templates/neural-network-architecture-compact.yaml \
  test-output/template1.drawio

# 测试模板 2
node skills/drawio/scripts/cli.js \
  skills/drawio-academic-skills/references/templates/multi-module-system-compact.yaml \
  test-output/template2.drawio
```

**预期结果**:
- 模板转换成功
- 无 warning 或仅有 info 级别提示

### 步骤 5.3: 文档示例可运行性验证

运行 `academic-figure-playbook.md` 中的所有 YAML 示例:

```bash
# 提取文档中的 YAML 代码块
grep -A 50 "```yaml" skills/drawio/references/docs/academic-figure-playbook.md > doc-examples.txt

# 手动验证每个示例可以正常解析
```

### 步骤 5.4: 回归测试

```bash
# 测试现有示例库
for example in skills/drawio/references/examples/*.yaml; do
  echo "Testing: $example"
  node skills/drawio/scripts/cli.js "$example" "test-output/$(basename $example .yaml).drawio"
  if [ $? -ne 0 ]; then
    echo "FAILED: $example"
  fi
done
```

**验收标准**:
- [ ] 用户 52 节点 spec 成功转换
- [ ] 至少 2 个模板生成成功
- [ ] 文档示例可运行
- [ ] 现有示例库无回归

---

## 质量检查清单

### 代码质量
- [ ] 仅修改阈值常量，无逻辑变更
- [ ] 无硬编码路径
- [ ] 无平台相关代码

### 文档质量
- [ ] 新增文档符合现有风格
- [ ] 所有代码示例可运行
- [ ] 无拼写错误
- [ ] 链接有效

### 模板质量
- [ ] 包含完整的元数据
- [ ] 注释清晰完整
- [ ] YAML 语法正确
- [ ] 节点数符合预算

### 向后兼容性
- [ ] 现有图表无破坏
- [ ] 警告级别不应降低（只能提升）
- [ ] API 接口不变

---

## 回滚计划

如果验证失败，需要回滚:

```bash
# 备份原始文件
cp skills/drawio/scripts/dsl/spec-to-drawio.js \
   skills/drawio/scripts/dsl/spec-to-drawio.js.backup

# 如需回滚
cp skills/drawio/scripts/dsl/spec-to-drawio.js.backup \
   skills/drawio/scripts/dsl/spec-to-drawio.js
```

---

## 完成标准

所有以下条件满足即视为任务完成:

1. **M1-M4 所有验收标准通过**
2. **M5 端到端验证通过**
3. **质量检查清单全部勾选**
4. **用户确认问题已解决**

---

## 验证命令汇总

```bash
# 1. 阈值验证
node skills/drawio/scripts/cli.js test-40.yaml test-40.drawio --strict-warnings
node skills/drawio/scripts/cli.js test-61.yaml test-61.drawio --strict-warnings

# 2. 用户案例
cd thesis
node .claude/skills/drawio/scripts/cli.js \
  .drawio-tmp/多源多速率软测量架构/spec.yaml \
  drawio/chapter3/test.drawio --strict-warnings

# 3. 模板测试
node skills/drawio/scripts/cli.js \
  skills/drawio-academic-skills/references/templates/neural-network-architecture-compact.yaml \
  test.drawio

# 4. 回归测试
for f in skills/drawio/references/examples/*.yaml; do 
  node skills/drawio/scripts/cli.js "$f" "test-$(basename $f .yaml).drawio"
done
```
