# Agent & Memory Diagram Layouts

YAML-first layout recipes for AI/agent system diagrams: agent architectures,
memory architectures, mind maps, and timelines. These build on the semantic
node and connector types documented in `design-system/shapes.md` (§Agentic /
LLM System Vocabulary) and `design-system/connectors.md` (§Agentic / LLM Flow
Semantics). Everything here is expressed as spec YAML — nodes, edges, modules,
layout, and positions. There are no SVG coordinates, viewBox, or pixel drawing
instructions; the converter owns rendering.

## When to use

The user is describing an LLM agent, a RAG pipeline, a memory subsystem
(Mem0 / MemGPT style), a multi-agent system, or a tool-calling loop, and wants
a diagram of how the pieces reason, retrieve, remember, and act. Triggers:
"agent 架构图", "RAG 图", "记忆架构", "memory architecture", "multi-agent",
"工具调用循环", "agentic".

## Theme note

Use `theme: arch-dark` as the default for these diagrams. The agentic
connector palette (`control`, `memory_read`, `memory_write`, `async`,
`feedback`) is defined in every bundled theme: color-coded in `arch-dark`,
`tech-blue`, `nature`, and `dark`; monochrome with dash-pattern distinctions in
`academic` and `high-contrast` (color is never the only carrier of meaning
there). Per-edge `style.strokeColor` / `style.dashed` still overrides the theme
when a one-off deviation is needed.

## Node & edge vocabulary

| Concept                | Node `type`    | Notes                                    |
| ---------------------- | -------------- | ---------------------------------------- |
| LLM / foundation model | `llm`          | rounded rect                             |
| Agent / orchestrator   | `agent`        | hexagon — signals an active controller   |
| Vector / embedding DB  | `vector_store` | cylinder                                 |
| Short-term / working   | `memory`       | dashed rounded rect (dashed = ephemeral) |
| Long-term store        | `database`     | solid cylinder (persistent)              |
| Tool / function        | `tool`         | rounded rect                             |
| API gateway / ingress  | `gateway`      | hexagon                                  |

| Flow                     | Edge `type`    | Rendering (arch-dark)          |
| ------------------------ | -------------- | ------------------------------ |
| Main request/response    | `primary`      | solid gray, open head          |
| Secondary/async data     | `data`         | dashed gray, open head         |
| Trigger / control signal | `control`      | solid orange, open head        |
| Read from store/memory   | `memory_read`  | solid green, open head         |
| Write to store/memory    | `memory_write` | dashed green, open head        |
| Async / non-blocking     | `async`        | dashed gray, open head         |
| Iterative feedback loop  | `feedback`     | solid violet, open head        |

Read and write to the same store share a hue and differ by dash — this is why
memory diagrams read clearly even in grayscale. Always add a legend when two or
more edge semantics appear (see below).

## 1. Agent Architecture

Model the agent as five conceptual layers, top-to-bottom or left-to-right:

1. **Input** — user, query, trigger (`user`).
2. **Agent core** — the reasoning loop / planner (`agent`).
3. **Memory** — short-term context (`memory`, dashed) vs. long-term stores
   (`database` / `vector_store`, solid). Keep the ephemeral/persistent contrast
   visible by type, not by hand-set fills.
4. **Tool** — tool calls, APIs, code execution, search (`tool`).
5. **Output** — response, action, side effect (`user`).

Express the layers with `layout: horizontal` (or `vertical`) and optionally a
`module` per layer to draw a boundary. Route the main path with `primary`;
trigger a tool or a retrieval with `control`; return a tool result or a
re-plan signal with `feedback` to close the reasoning loop. A `feedback` edge
back into the agent is the iterative-reasoning cue — the fireworks source drew
this as a curved loop arc; here the typed `feedback` connector carries the same
meaning. Antiparallel pairs (`agent → tool` control, `tool → agent` feedback)
are auto-offset by the converter, so they stay legible.

Keep a return edge from passing straight through an intermediate node: if the
context return would cross a stacked node in the same column, route it from the
nearest node in the sub-flow (for example `retriever → agent`) rather than from
the deepest one (`store → agent`). See `examples/agentic-rag.yaml`.

## 2. Memory Architecture (Mem0 / MemGPT style)

The defining move is **separating the write path from the read path**:

- Write path: `memory_write` (dashed green) from the memory manager into each
  store — `store()` / `consolidate()` operations.
- Read path: `memory_read` (solid green) from the stores into a
  retrieve-and-rank step — `retrieve()` / `recall()` operations.

Use operation names as edge labels (`store`, `recall`, `retrieve`,
`consolidate`). Lay memory **tiers** as a vertical or left-to-right
progression — Working → Short-term → Long-term → External — using `memory`
(dashed, volatile) for the near tiers and `vector_store` / `database` (solid,
persistent) for the far tiers. See `examples/mem0-memory-layer.yaml`.

## 3. Mind Map / Concept Map

Use `layout: star` for a single-level radial map: one hub node plus spokes.
The engine places spokes in a ring around the central device, so it fits
hub-and-spoke concept maps well.

Limits: `star` is single-level. It does not lay out second-level branches — for
a two-tier mind map either place the second-level nodes with explicit
`position` bounds, or switch to `layout: hierarchical` / `vertical` and draw an
ordinary tree. When the concept map is really a hierarchy (more than one level
of nesting, ordered children), prefer a hierarchical layout over `star`.

## 4. Timeline / Gantt

There is no dedicated timeline engine; build one as a recipe from existing
primitives:

- Lay phases/tasks left-to-right with `layout: horizontal` (or explicit
  `position` for exact columns), one node per phase/bar.
- Encode categories with per-node `style.fillColor` (a color band per
  category), or group related bars under a `module` swimlane.
- Mark milestones with a `decision` node (diamond) or a `text` node placed at
  the milestone's x position, labeled above the axis.
- Connect sequential phases with `primary`; show a dependency with
  `dependency`.

This is a composition recipe, not a new layout mode — keep it to a handful of
bars and lean on modules/colors for the category structure.

## Pattern quick reference

Ready-to-render specs live in `references/examples/`:

| Pattern            | Example file                       | Key types                              |
| ------------------ | ---------------------------------- | -------------------------------------- |
| RAG Pipeline       | `rag-pipeline.yaml`                | `vector_store`, `memory_read`, `data`  |
| Agentic RAG        | `agentic-rag.yaml`                 | `agent`, `tool`, `control`, `feedback` |
| Mem0 Memory Layer  | `mem0-memory-layer.yaml`           | `memory_write`, `memory_read`, tiers   |
| Multi-Agent        | `multi-agent-orchestration.yaml`   | `agent`, `control`, `async`            |
| Tool Call Loop     | `tool-call-loop.yaml`              | `llm`, `tool`, `control`, `feedback`   |

## Legend

When two or more edge semantics appear, add a compact single `text` node that
names each color/dash used, placed below the diagram with clearance:

```yaml
nodes:
  - id: legend
    label: "Legend:  gray = primary   orange = control   green = memory read   violet = feedback loop"
    type: text
    position: { x: 530, y: 620 }
```

`text` nodes render transparent (no fill, no border) with theme-appropriate
font color, so the legend stays readable on the dark canvas.

## Self-check

Before delivering:

1. `node scripts/cli.js <spec>.yaml <out>.svg --validate` reports no errors and
   no overlap/label-clearance warnings.
2. `node-crossings` and `edge-crossings` are 0 — a return/feedback edge must not
   pass through an intermediate node body.
3. Read and write connectors are visibly distinct (solid vs. dashed green).
4. A legend is present whenever two or more edge semantics are used.
5. Every edge is bound to node ids (no floating arrows); text nodes are
   transparent and content-sized.
