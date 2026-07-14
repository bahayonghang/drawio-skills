# Agent 与记忆图

Base Skill 为 LLM Agent、RAG pipeline、记忆子系统、多 Agent 编排、工具调用循环、思维导图和精简时间线提供语义词汇与布局配方。

## 核心词汇

| 概念 | 节点类型 |
|---|---|
| LLM 或基础模型 | `llm` |
| Agent 或 orchestrator | `agent` |
| 向量或 embedding store | `vector_store` |
| 工作记忆或短期记忆 | `memory` |
| 持久化存储 | `database` |
| 工具或函数 | `tool` |
| API gateway | `gateway` |

产品和工程图默认使用 `arch-dark`；论文中的 Agent 架构应使用 Academic Overlay。

## 流语义

| 含义 | 边类型 |
|---|---|
| 主要请求或响应 | `primary` |
| 次要数据流 | `data` |
| 触发或控制信号 | `control` |
| 从记忆读取 | `memory_read` |
| 写入记忆 | `memory_write` |
| 非阻塞工作 | `async` |
| 迭代推理回路 | `feedback` |

记忆读取与写入使用同一色系、不同线型，因此在灰度环境下仍能区分。

## 常见模式

### Agent 架构

按清晰的主方向排列输入、Agent core、记忆、工具和输出。工具调用使用 `control`，工具结果或重新规划使用 `feedback`。

### 记忆架构

分离写路径和读路径。Memory manager 到各存储使用 `memory_write`，存储到检索与排序步骤使用 `memory_read`。易失层使用 `memory`，持久层使用 `vector_store` 或 `database`。

### 思维导图与时间线

单层放射图使用 `layout: star`。多层层级使用 `hierarchical` 或显式位置。时间线由横向节点、modules、milestones 和 dependency edges 组合，没有单独的 timeline engine。

## 示例来源

可直接渲染的 YAML 位于 `skills/drawio/references/examples/`，包括：

- `rag-pipeline.yaml`
- `agentic-rag.yaml`
- `mem0-memory-layer.yaml`
- `multi-agent-orchestration.yaml`
- `tool-call-loop.yaml`

使用两种以上边语义时，应增加紧凑图例。

## 自检

- 校验没有 node crossing 或 label-clearance 警告
- feedback 和 return edge 不穿过中间节点
- memory read 与 write 能明显区分
- 每条边都绑定节点 id
- 独立 text 节点透明且尺寸匹配内容

## 相关内容

- [设计系统](./design-system.md)
- [主题与样式预设](./themes-presets.md)
- [连接线与边质量](./connectors.md)
