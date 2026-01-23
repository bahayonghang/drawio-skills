# Change: Add two scientific-to-drawio “skills workflows” (Nano Banana Pro prompt)

## Why
当前仓库提供 draw.io 生成/编辑能力与参考资料，但缺少面向“基金标书/论文正文 → 工艺流程/技术路线图”的严格工作流模板。科研评审/路线图场景要求：
- 只抽取正文明确出现的信息，避免臆测与“补全”
- 输出结构必须稳定、可被下游工具（Nano Banana Pro）直接消费
- 对缺失信息与边界情况有一致处理

## What Changes
- 新增 2 个工作流（仅定义与文档化，不改变 MCP server 功能）
  - **工作流 1：从零开始构建 drawio 工作流**（输入：正文；输出：A–H 绘图 Prompt）
  - **工作流 2：根据已有架构图进行复刻**（输入：架构图/导出文件/文字说明 + 可选正文；输出：A–H 绘图 Prompt）
- 为两个工作流引入“先文字设计稿 + ASCII 草图，再生成最终 A–H Prompt”的流程化约束（设计稿/草图用于提高结构一致性；最终对外输出仍保持 A–H 单一输出）
- 引入与工作流配套的“输出契约与 guardrails”约束（格式校验、只允许正文信息、缺失信息统一写法、拒绝越权扩写）

## Best-Practice References (for this proposal)
- 以 **guardrails** 方式做输入/输出边界控制：输出结构校验与拒答/修复闭环（例如 schema/格式验证）[Datadog guardrails best practices](https://www.datadoghq.com/blog/llm-guardrails-best-practices/)
- 将“guardrail 先行/并行”的思想用于防止跑题与强制结构化输出，并在失败时走“修复或拒绝”的路径 [OpenAI Cookbook: guardrails](https://cookbook.openai.com/examples/how_to_use_guardrails)

## Impact
- Affected specs (new capability):
  - `drawio-skills-workflows`
- Affected docs / skill references (planned in tasks):
  - `skills/drawio/references/`
  - `docs/` 与 `docs/zh/`（将工作流写入用户文档）

## Non-Goals
- 不修改 `@next-ai-drawio/mcp-server` 的工具集合与协议
- 不新增“正文未出现”的 AI/工业术语、系统组件或控制策略（工作流输出将被硬规则约束）

