# Academic Figure Playbook

Use this playbook whenever `meta.profile = academic-paper` or the user asks for a paper, thesis, journal, IEEE, manuscript, or research figure.

## Step 1: Classify the Figure

Before drafting nodes, answer one question:

What is this figure mainly explaining?

- **Structure** -> `meta.figureType: architecture`
- **Progression** -> `meta.figureType: roadmap`
- **Execution** -> `meta.figureType: workflow`

If the answer is mixed, pick the dominant purpose. If the diagram tries to explain structure, progression, and branching control logic at the same time, split it into two figures.

## Figure Types

### Architecture

Use for:

- system composition
- module boundaries
- data movement between tiers
- runtime responsibilities
- model architectures such as CNN, YOLO, Transformer, encoder-decoder, feature fusion, or multi-head prediction

Quality cues:

- group subsystems clearly
- emphasize layers or boundaries
- avoid turning the diagram into a chronological pipeline
- use modules for stages and semantic node types for layers, tensors, operators, and outputs
- keep layer labels compact; move tensor sizes, assumptions, or metrics into callouts or legends when needed

### Roadmap

Use for:

- study phases
- milestone progression
- delivery stages
- stage outputs

Quality cues:

- make progression directional
- show only major stages
- surface the output or decision at the end of each stage

### Workflow

Use for:

- ordered steps
- decisions and branching
- loops and fallback paths
- procedural execution
- method pipelines, ablation studies, experiment procedures, and validation loops

Quality cues:

- keep the step order obvious
- label ambiguous decisions
- keep back-edges and loops sparse and readable

## Scientific Figure Patterns

### Model Architecture

Use this pattern for CNN, YOLO, Transformer, encoder-decoder, and feature-fusion figures.

- Set `meta.figureType: architecture`.
- Use 3-5 modules for major stages such as Input, Backbone, Fusion/Neck, Prediction Head, Loss, or Output.
- Prefer semantic types: `input`, `tensor3d`, `conv`, `pool`, `attention`, `feature`, `operator`, `loss`, and `output`.
- Keep tensors and operators visually small. Use a legend for repeated layer notation instead of repeating long descriptions in every box.
- Show only the architectural relationships needed for the paper argument; detailed implementation hyperparameters belong in the caption or body text.

### Operation Or Mechanism

Use this pattern for max pooling, attention scoring, gating, residual add, normalization, or algorithm-step illustrations.

- Pick `workflow` when the figure explains an ordered operation, and `architecture` when it explains a static mechanism inside a model.
- Use explicit `bounds` for small grids, matrices, formula boxes, callouts, and operator nodes.
- Use native rectangles/text cells for grids or matrices. Do not use a screenshot of the operation as the final draw.io page.
- Keep formulas short and use supported math delimiters from `math-typesetting.md`.
- Offset arrows and edge labels with `labelOffset` so labels do not sit on connector lines.

### Experiment Pipeline

Use this pattern for datasets, treatments, ablations, simulations, or evaluation workflows.

- Set `meta.figureType: workflow`.
- Separate setup/data, variants or methods, shared evaluation, metrics, and reporting.
- Draw ablation branches in parallel and converge them before validation or metrics.
- Label branches with short method names. Use the legend for line styles, color encodings, or metric abbreviations.

### Reference-Image Redraw

Use this pattern when a paper screenshot or existing figure must become editable.

- Use `meta.source: replicated`.
- Preserve captions, legends, formulas, callouts, section headers, and connector labels as first-class elements.
- Use `meta.canvas: WIDTHxHEIGHT` and top-left `bounds` when matching the source coordinate system matters.
- Rebuild the main diagram with native draw.io cells and verify the exported SVG or Desktop artifact before any browser screenshot.

## Visual Defaults

- prefer white or very light backgrounds
- use low-saturation colors unless the user explicitly wants a color paper figure
- keep one dominant reading direction
- align nodes to the grid instead of hand-placing them loosely
- shorten labels before shrinking fonts
- use consistent line weights, arrowheads, and corner radii

## Academic Delivery Matrix

Default output for paper-mode requests:

- `.drawio`
- `.svg`

Keep reproducibility sidecars in the work directory by default, not in the final delivery directory:

- `.spec.yaml`
- `.arch.json`

Add `.png` only when one of these is true:

- the request is thesis or A4 focused
- the figure is for Word or another raster-first workflow
- the task is a screenshot or image rebuild that needs a matching raster companion
- the user explicitly asks for PNG

If draw.io Desktop export is unavailable, keep the offline bundle plus SVG as the completed baseline and note that PNG is optional follow-up.

## Node Budget Management

Academic figures should be clear and focused. Keep node count under 40 for optimal readability.

### Budget Guidelines

**Recommended targets by figure type**:

| Figure Type  | Target Nodes | Maximum Nodes | Typical Distribution                     |
| ------------ | ------------ | ------------- | ---------------------------------------- |
| Architecture | 30-35        | 60            | 4-6 modules × 5-7 nodes + legend (1-2)   |
| Workflow     | 25-30        | 50            | 15-20 steps + 5-8 decisions + legend (1) |
| Roadmap      | 15-20        | 40            | 10-15 stages + 3-5 outputs + legend (1)  |

**System warnings**:

- 0-40 nodes: no warning (ideal range)
- 41-60 nodes: warning (conversion succeeds, but consider simplification)
- 61-100 nodes: error (blocked in strict mode, split strongly recommended)
- > 100 nodes: fatal (always blocked, hard limit)

### Node-Efficient Patterns

#### Example 1: Legend

**❌ Expanded Legend (wastes 12 nodes)**:

```yaml
- id: legend_container
  label: "Legend"
  bounds: { x: 1000, y: 400, width: 200, height: 160 }
  style: { shape: box, fillColor: "#FAFAFA" }

- id: legend_arrow_solid
  label: ""
  bounds: { x: 1010, y: 430, width: 40, height: 2 }
  style: { strokeColor: "#1E3A5F", strokeWidth: 2 }

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

#### Example 2: Decorative Elements

**❌ Detailed Bar Chart (wastes 8 nodes)**:

```yaml
- id: bar_1
  label: ""
  bounds: { x: 100, y: 512, width: 18, height: 36 }
  style: { shape: box, fillColor: "#22C55E" }

- id: bar_2
  label: ""
  bounds: { x: 122, y: 524, width: 18, height: 24 }
  style: { shape: box, fillColor: "#4ADE80" }
# ... 6 more bars
```

**✅ Simplified Representation (1 node)**:

```yaml
- id: attention_weights
  label: "ωₜ weight visualization (bar chart, t=1..L)"
  bounds: { x: 100, y: 512, width: 180, height: 40 }
  style:
    shape: box
    fillColor: "#E8F5E9"
    strokeColor: "#16A34A"
    fontSize: 9
```

**Savings**: 8 nodes → 1 node (7 nodes saved)

### When to Split

Split into multiple figures when:

- Node count approaches 50 and simplification is not practical
- The diagram explains 3+ distinct mechanisms or stages
- Readers would need to zoom in to read labels at normal page size
- The figure serves multiple purposes (e.g., architecture + training procedure)

### Split Strategies

**By data path** (for multi-input or multi-branch systems):

- Figure 3a: High-frequency processing path
- Figure 3b: Low-frequency conditioning path
- Both figures share the same fusion/output stage context in captions

**By hierarchy level** (for deep architectures):

- Figure 3a: System overview (4-6 major modules)
- Figure 3b: Detailed view of the fusion module
- Figure 3c: Attention mechanism internals

**By mechanism** (for multi-stage methods):

- Figure 3a: Feature extraction stage
- Figure 3b: Conditional fusion mechanism
- Figure 3c: Temporal attention and regression

**Real-world example from IEEE papers**:

- Typical neural network figures: 25-35 nodes
- Complex architectures often split into 2-3 sub-figures
- Main figure shows 4-6 modules; detail figures zoom into 1-2 modules

## Final Quality Gate

Do not consider the figure complete until all of these are true:

- `meta.figureType` is set correctly
- the diagram reads clearly at normal A4 page zoom
- colors are not the only carrier of meaning
- labels are concise and readable
- connector routing is clean enough that the reading order is obvious
- the offline bundle and SVG are aligned
- any visual self-check used the exported SVG or Desktop-exported final artifact before any browser/live screenshot
- any requested PNG companion matches the final diagram state
