# Agent And Memory Diagrams

The base skill includes semantic vocabulary and layout recipes for LLM agents, RAG pipelines, memory subsystems, multi-agent orchestration, tool-calling loops, mind maps, and compact timelines.

## Core Vocabulary

| Concept | Node type |
|---|---|
| LLM or foundation model | `llm` |
| agent or orchestrator | `agent` |
| vector or embedding store | `vector_store` |
| working or short-term memory | `memory` |
| persistent store | `database` |
| tool or function | `tool` |
| API gateway | `gateway` |

Use `arch-dark` as the default for product and engineering diagrams. Use the Academic Overlay for paper-facing agent architectures.

## Flow Semantics

| Meaning | Edge type |
|---|---|
| main request or response | `primary` |
| secondary data flow | `data` |
| trigger or control signal | `control` |
| read from memory | `memory_read` |
| write to memory | `memory_write` |
| non-blocking work | `async` |
| iterative reasoning loop | `feedback` |

Memory read and write share a color family but differ by line style, so the distinction remains visible in grayscale.

## Common Patterns

### Agent Architecture

Arrange input, agent core, memory, tools, and output in a clear primary direction. Use `control` for tool invocation and `feedback` for tool results or replanning.

### Memory Architecture

Separate write and read paths. Connect the memory manager to stores with `memory_write`, and stores to retrieval/ranking with `memory_read`. Use `memory` for volatile tiers and `vector_store` or `database` for persistent tiers.

### Mind Map And Timeline

Use `layout: star` for a single-level radial map. For deeper hierarchies, use `hierarchical` or explicit positions. Timelines are composed from horizontal nodes, modules, milestones, and dependency edges; there is no dedicated timeline engine.

## Example Sources

Ready-to-render YAML lives under `skills/drawio/references/examples/`, including:

- `rag-pipeline.yaml`
- `agentic-rag.yaml`
- `mem0-memory-layer.yaml`
- `multi-agent-orchestration.yaml`
- `tool-call-loop.yaml`

Add a compact legend whenever two or more edge semantics appear.

## Self-Check

- validation reports no node crossings or label-clearance warnings
- feedback and return edges do not pass through intermediate nodes
- memory reads and writes remain visually distinct
- every edge is bound to node ids
- standalone text nodes are transparent and content-sized

## Related

- [Design System](./design-system.md)
- [Themes and Style Presets](./themes-presets.md)
- [Connectors and Edge Quality](./connectors.md)
