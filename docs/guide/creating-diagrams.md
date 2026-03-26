# Creating Diagrams (`/drawio create`)

Use `/drawio create` when you need a new diagram from text, YAML, Mermaid, or CSV.

## Quick Examples

```text
/drawio create a horizontal tech-blue login flow with 6 nodes
```

```text
/drawio create an academic-color research workflow figure with 8 nodes for a paper
```

```text
/drawio create a cloud architecture using AWS icons with an event bus and two data stores
```

## Input Modes

### Natural language

Best for simple flows and architecture sketches.

### YAML spec

Best for version-controlled authoring and exact control.

### Mermaid

Best when you already have a Mermaid flowchart, sequence, class, state, ER, or gantt definition.

### CSV

Best for hierarchy-heavy or org-chart style inputs.

All non-YAML inputs are normalized into the canonical YAML spec before rendering.

## Fast Path vs Full Path

### Fast Path

The skill can generate directly when the request already states:

- diagram type
- theme or audience
- layout
- expected complexity

Fast path is best for small diagrams, usually around 12 nodes or fewer.

### Full Path

The skill will consult and draft more carefully when the request is:

- ambiguous
- academically publication-sensitive
- stencil-heavy
- routing-sensitive
- large or branching

## Theme and Profile Defaults

| Situation | Default profile | Default theme |
|-----------|-----------------|---------------|
| standard diagrams | `default` | `tech-blue` |
| academic papers | `academic-paper` | `academic` |
| academic papers with explicit color request | `academic-paper` | `academic-color` |
| dense engineering review | `engineering-review` | `tech-blue` |

## Special Branches

### Academic branch

Triggered by terms like `paper`, `IEEE`, `thesis`, `journal`, or `research`.

Expected extras:

- `meta.title`
- recommended `meta.description`
- `meta.legend` when icons or mixed connector types are used
- SVG export preference

### Math / formula branch

Triggered by `formula`, `equation`, `LaTeX`, `AsciiMath`, `MathJax`, `loss function`, or similar terms.

Allowed output delimiters only:

- `$$...$$` for standalone formulas
- `\(...\)` for inline formulas
- `` `...` `` for AsciiMath

Do **not** emit bare LaTeX, `$...$`, or `\[...\]`.

### Stencil-heavy branch

Triggered by AWS, GCP, Azure, Kubernetes, Cisco, or vendor-icon requests.

Prefer semantic shapes first, then add provider icons only when the diagram benefits from them.

## Recommended Workflow

1. Define type, theme, layout, and complexity in the prompt when possible.
2. Let the skill normalize the request into YAML.
3. Validate before claiming the output is ready.
4. Keep the sidecars if the diagram will evolve later.

## Validation Commands

Generate a `.drawio` bundle:

```bash
node skills/drawio/scripts/cli.js input.yaml output.drawio --validate --write-sidecars
```

Generate a standalone SVG:

```bash
node skills/drawio/scripts/cli.js input.yaml output.svg --validate --write-sidecars
```

Use strict mode for publication or review:

```bash
node skills/drawio/scripts/cli.js input.yaml output.svg --validate --write-sidecars --strict-warnings
```

## Good Prompt Patterns

### Engineering diagram

```text
/drawio create a horizontal tech-blue microservices architecture for engineering review with 10 nodes, an event bus, and two databases
```

### Academic figure

```text
/drawio create an IEEE-style campus network figure in grayscale for a paper, with core, distribution, and access layers plus a short legend
```

### Formula-bearing diagram

```text
/drawio create a model pipeline with labels "Input: \(x \in \mathbb{R}^d\)" and a dedicated loss node "$$\mathcal{L} = -\sum_i y_i \log(\hat{y}_i)$$"
```

## Next Steps

- [Workflows](./workflows.md)
- [Replicating Diagrams](./scientific-workflows.md)
- [Editing Diagrams](./editing-diagrams.md)
- [Math Typesetting](./math-typesetting.md)
- [Specification Format](./specification.md)
