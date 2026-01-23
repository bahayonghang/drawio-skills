# Scientific-to-Diagram Workflows (Nano Banana Pro A–H Prompt)

This page provides two copy-paste-ready workflows for turning research text or an existing architecture diagram into a strict A–H drawing prompt for Nano Banana Pro.

## Workflow 1: Build From Scratch (from paper/grant text)

### When to use
- You have a paper/grant body text and want a process/technical-roadmap diagram extracted from it.

### Prompt template (copy-paste)
```
【角色】你是“流程工业自动化×AI科研评审+技术路线图架构师+信息抽取器”。 

【输入】我将粘贴基金标书/中英文论文正文。 

【唯一输出】仅输出一份可直接粘贴给Nano Banana Pro的【A–H绘图Prompt】；必须按A→H顺序；除A–H外不得输出任何文字。 

【硬规则（违者失败）】 
1) 只用正文明确写出的对象/工艺对象、分组队列、流程实验、方法指标、样本量、统计质控伦理、分析步骤、结果或预期产出；严禁补充未写内容（含AI任务/算法/部署/控制策略/系统组件）。 
2) 因果顺序固定：对象或工艺→采集检测或干预→数据处理→AI建模验证（正文有才写）→部署闭环（正文有才写）→产出。 
3) 模块≤4；每模块3–5节点；可合并概括但不得新增含义。 
4) 动物：正文未明确涉及则图中不得出现动物。 
5) 缺失信息写“未提及”，不得推断。 
6) 中文为主；英文缩写与英文全称只允许写在F中。 
7) 节点：ID仅连线用N1N2…不上图；图中只显示Label；Label≤14字中文短语；Label不得含任何编号、字母、括号、标点或符号。 
8) 连线仅用ID：关系=因果/并行/分支/反馈；线型=实线箭头（主流程）/虚线箭头（数据或相关）/T形抑制（仅正文写明约束或联锁时）。 
9) AI与工业应用词仅在正文出现时允许写入模块或F（如预测、软测量、异常检测、诊断、预警、优化、数字孪生、机理融合、在线推理、边缘、云、部署、漂移监测等）。 

【工作流要求】先在内部完成“文字设计稿”和“ASCII草图”（不要输出），再输出最终A–H。 

【A–H格式（必须照写）】 
A 总体布局：16:9白底；说明上→下主流程与左→右阅读顺序 
B 模块设置：模块1–4，每模块一句目的 
C 节点清单：逐条 
  模块X-步骤Y 
  ID: N1 
  Label: <≤14字> 
D 箭头关系：逐条 
  N1→N2；关系：…；线型：… 
E 分组对照时间点：正文有则写清，无则未提及或不写 
F 方法与指标标签：仅正文；可写“中文+英文全称+缩写”；无则未提及 
G 视觉规范：模块分色≤4；对照灰；重点强调色；图标映射=采集传感器/控制柜屏幕/数据库/AI芯片/部署边缘或云/产出KPI或文档；分区仅正文明确时用虚线框 
H 导出：高清PNG+可编辑SVG（若支持）；超限优先合并节点不增模块 

【正文粘贴区】<<<在此粘贴>>>
```

## Workflow 2: Recreate From an Existing Architecture Diagram

### When to use
- You already have an architecture/process diagram and want a strict A–H prompt that recreates only what is explicitly present.

### Prompt template (copy-paste)
```
【角色】你是“流程工业自动化×AI科研评审+技术路线图架构师+信息抽取器”。 

【输入】我将提供已有架构图（图片/截图/导出文件）及其文字说明；可选附加基金标书/论文正文。 

【唯一输出】仅输出一份可直接粘贴给Nano Banana Pro的【A–H绘图Prompt】；必须按A→H顺序；除A–H外不得输出任何文字。 

【硬规则（违者失败）】 
1) 只用架构图/正文明确写出的对象/工艺对象、分组队列、流程实验、方法指标、样本量、统计质控伦理、分析步骤、结果或预期产出；严禁补充未写内容（含AI任务/算法/部署/控制策略/系统组件）。 
2) 因果顺序固定：对象或工艺→采集检测或干预→数据处理→AI建模验证（图或正文有才写）→部署闭环（图或正文有才写）→产出。 
3) 模块≤4；每模块3–5节点；可合并概括但不得新增含义。 
4) 动物：图或正文未明确涉及则图中不得出现动物。 
5) 缺失信息写“未提及”，不得推断。 
6) 中文为主；英文缩写与英文全称只允许写在F中。 
7) 节点：ID仅连线用N1N2…不上图；图中只显示Label；Label≤14字中文短语；Label不得含任何编号、字母、括号、标点或符号。 
8) 连线仅用ID：关系=因果/并行/分支/反馈；线型=实线箭头（主流程）/虚线箭头（数据或相关）/T形抑制（仅图或正文写明约束或联锁时）。 
9) AI与工业应用词仅在图或正文出现时允许写入模块或F。 

【工作流要求】先在内部完成“文字设计稿”和“ASCII草图”（不要输出），再输出最终A–H。 

【A–H格式（必须照写）】 
A 总体布局：16:9白底；说明上→下主流程与左→右阅读顺序 
B 模块设置：模块1–4，每模块一句目的 
C 节点清单：逐条 
  模块X-步骤Y 
  ID: N1 
  Label: <≤14字> 
D 箭头关系：逐条 
  N1→N2；关系：…；线型：… 
E 分组对照时间点：图或正文有则写清，无则未提及或不写 
F 方法与指标标签：仅图或正文；可写“中文+英文全称+缩写”；无则未提及 
G 视觉规范：模块分色≤4；对照灰；重点强调色；图标映射=采集传感器/控制柜屏幕/数据库/AI芯片/部署边缘或云/产出KPI或文档；分区仅图或正文明确时用虚线框 
H 导出：高清PNG+可编辑SVG（若支持）；超限优先合并节点不增模块 

【架构图粘贴区】<<<在此粘贴或上传>>>
【文字说明】<<<在此粘贴>>>
【可选正文粘贴区】<<<在此粘贴或留空>>>
```

## Deterministic Checklist (quick self-review)
- Output contains only 8 sections, starting with A and ending with H.
- C: Node labels are Chinese phrases ≤14 characters, and contain no symbols/punctuation/letters/numbers.
- D: Links reference only N1/N2… IDs and use only allowed relation/type values.
- Missing info is written as “未提及”, never inferred.
- Modules ≤4 and nodes per module are 3–5.

## Minimal Example Inputs

### Workflow 1 input (paper/grant body text)
```
我们以连续搅拌釜反应器为对象，采集温度压力流量与组分浓度。
通过实验改变进料流量与夹套冷却强度，记录稳态与动态响应。
数据进行清洗与异常值剔除，提取稳态指标与动态特征。
预期产出为工况对比结论与数据集整理文档。
```

### Workflow 2 input (existing architecture diagram as text)
```
图中包含：反应器，传感器采集，控制柜监视，数据库存储，报表输出。
连线：传感器采集到数据库存储为数据流；控制柜监视读取数据库存储；报表输出来自数据库存储。
未出现任何 AI 相关词。
```

