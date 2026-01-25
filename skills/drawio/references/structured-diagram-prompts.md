# Structured Diagram Prompts (A–H Format)

This reference provides a universal, copy-paste prompt template for extracting structured process/flowchart diagrams from text or existing images. The A–H format ensures deterministic, consistent output suitable for diagram generation tools.

## Overview

| Input Type | Use Case |
|------------|----------|
| **Text** | Extract diagram from documents (proposals, specs, plans, manuals) |
| **Image** | Recreate/standardize existing diagrams with optional reference text |

---

## Universal Prompt Template

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

## Domain-Specific Configurations

### Software Architecture
```
【领域】软件架构
【风格】专业
【图标建议】服务器/数据库/API/客户端/消息队列/缓存/负载均衡
【典型流程】用户请求→网关→服务→数据层→响应
```

### IEEE Network Diagram
```
【领域】网络架构
【风格】IEEE标准
【图标建议】路由器(R)/交换机(SW)/防火墙(FW)/云/服务器
【典型流程】核心层→汇聚层→接入层
【特殊规则】使用正交连线；区分实线(物理)/虚线(逻辑)；黑白友好高对比度
```

### Business Process
```
【领域】商业流程
【图标建议】用户/表单/审批/通知/存储/报表
【典型流程】输入→处理→决策→输出→归档
```

### Industrial Process
```
【领域】工业流程
【图标建议】传感器/控制器/执行器/数据库/监控屏/报警
【典型流程】对象→采集→处理→控制→产出
```

### Project Management
```
【领域】项目管理
【图标建议】里程碑/任务/团队/交付物/风险/决策点
【典型流程】启动→规划→执行→监控→收尾
```

### Teaching & Learning
```
【领域】教学设计
【图标建议】学习目标/内容/活动/评估/反馈
【典型流程】目标→内容→活动→评估→改进
```

### Research Workflow
```
【领域】科研流程
【图标建议】样本/实验/数据/分析/模型/产出
【典型流程】对象→采集→处理→分析/建模→产出
【特殊规则】样本量、统计方法、伦理声明如有则标注
```

---

## Quick-Start Examples

### Example 1: From Text (Software)

**Input:**
```
【领域】软件架构
【输入类型】文本
【语言】中文

【输入内容】
用户通过移动端发起支付请求，经过API网关路由到支付服务。
支付服务调用风控服务进行交易验证，验证通过后调用第三方支付渠道。
支付结果通过消息队列异步通知订单服务更新状态，并推送给用户。
```

### Example 2: From Image (Business)

**Input:**
```
【领域】商业流程
【输入类型】图片+文本
【语言】English

【输入内容】
[Upload existing flowchart image]
This is our current expense approval workflow. Please recreate it in A–H format.
```

### Example 3: From Text (Industrial)

**Input:**
```
【领域】工业流程
【输入类型】文本
【语言】中文

【输入内容】
以连续搅拌釜反应器为对象，采集温度、压力、流量与组分浓度。
进行数据清洗与异常值剔除，基于模型进行异常检测与预警。
产出为预警记录与评估报告。
```

---

## Deterministic Checklist

Before finalizing output, verify:

- [ ] Output contains exactly 8 sections: A, B, C, D, E, F, G, H (in order)
- [ ] No extra text outside A–H sections
- [ ] Modules ≤ 4; Nodes per module: 3–5
- [ ] Labels are short phrases without symbols/numbers/brackets
- [ ] Edges use only IDs (N1, N2...) with valid relation and line types
- [ ] Missing info marked as "未提及" / "Not specified" (never inferred)
- [ ] All content derived from input only (no additions)

---

## Migration from Legacy Format

If you have prompts using the old `scientific-workflows.md` format:

| Old | New |
|-----|-----|
| 【角色】流程工业自动化×AI科研评审... | 【角色】结构化流程图架构师... + 【领域】指定 |
| 【输入】基金标书/论文 | 【输入类型】+ 【输入内容】分离 |
| 固定因果顺序 | 从输入推断 + 领域配置 |
| 中文强制 | 【语言】参数化 |
| Workflow 1 / Workflow 2 分离 | 【输入类型】参数统一 |
