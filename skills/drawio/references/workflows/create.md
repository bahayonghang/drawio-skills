# Workflow: /drawio create

Create diagrams from text, Mermaid, CSV, or explicit YAML spec using the Draw.io design system.

## Trigger

- **Command**: `/drawio create ...`
- **Keywords**: `create`, `generate`, `make`, `draw`, `生成`, `创建`

## Route Selection

Determine the route before asking questions:

1. **Fast Path**
   - Use when the request already specifies the diagram type and at least 3 of: audience/profile, theme, layout, complexity.
   - Use when the estimated graph is small (`<= 12` nodes) and not stencil-heavy.
2. **Full Path**
   - Use for ambiguous, large, academic, replication-like, or routing-sensitive diagrams.
3. **Academic Branch**
   - Force-enable when prompt contains `paper`, `academic`, `IEEE`, `journal`, `thesis`, `figure`, `manuscript`, `research`.
   - Default `meta.profile = academic-paper`.
4. **Stencil Branch**
   - Enable when the prompt mentions AWS, Azure, GCP, Cisco, Kubernetes, or vendor icons.

## Procedure

```text
Step 1: Identify Input Mode
├── Natural language
├── YAML spec
├── Mermaid (flowchart/sequence/class/state/ER/gantt)
└── CSV hierarchy/org chart

Step 2: Determine profile and theme defaults
├── academic-paper -> theme academic by default
├── academic-paper + explicit color request -> academic-color
├── engineering-review -> theme tech-blue by default
└── otherwise -> theme from request or tech-blue

Step 3: Decide Fast Path vs Full Path
├── Fast Path -> skip AskUserQuestion and skip ASCII confirmation
└── Full Path -> continue to Step 4

Step 4: Design Consultation (Full Path only)
├── Ask only unresolved questions:
│   • audience/profile
│   • theme
│   • layout
│   • expected complexity
└── Store decisions in designIntent and pre-fill YAML meta

Step 5: Academic / Stencil references
├── academic-paper -> load IEEE + export checklist + math typesetting
└── stencil-heavy -> load stencil guide + icon reference

Step 6: Build the YAML spec
├── Normalize Mermaid/CSV inputs to YAML spec
├── Ensure meta.theme, meta.layout, meta.profile are present
├── Use semantic node types and typed connectors
└── Add manual positions when branching or dense routing requires it

Step 7: ASCII Draft (Full Path only)
├── Render semantic ASCII draft
├── Include Design Summary:
│   • theme
│   • profile
│   • layout
│   • node/edge/module counts
│   • validation status
└── Pause for confirmation only when logic or structure is still ambiguous

Step 8: Validation
├── validateColorScheme()
├── validateLayoutConsistency()
├── validateConnectionPointPolicy()
├── validateEdgeQuality()
├── validateAcademicProfile() when profile=academic-paper
└── checkComplexity()

Step 9: Edge Audit
├── No corner connection points
├── No shared face slots on the same corridor
├── Last segment >= 30px
├── Labels offset from edge lines
├── No waypoint + explicit connection-point mixing
└── Prefer straight arrows when alignment allows it

Step 10: Render
├── node $SKILL_DIR/scripts/cli.js input --input-format <yaml|mermaid|csv> output.drawio --validate
└── For paper-quality diagrams prefer output.svg

Step 11: Preview
├── MCP available -> start_session / create_new_diagram
└── Otherwise open output in draw.io desktop or diagrams.net
```

## Academic Branch Rules

When `meta.profile = academic-paper`:

- `meta.title` is required for figure captioning.
- `meta.description` is recommended for figure context.
- `meta.legend` is required when icons are used or connector types are mixed.
- Prefer `academic` theme unless the request explicitly asks for a color paper figure.
- Prefer `.svg` export over `.drawio` for paper-ready output.
- Do not rely on color alone to distinguish semantics.

## Fast Path Examples

### Small explicit flowchart

```text
/drawio create a horizontal tech-blue login flow with 5 nodes
```

### Explicit academic pipeline

```text
/drawio create an academic-color research workflow figure with 8 nodes for a paper
```

## Full Path Examples

### Dense architecture diagram

```text
/drawio create a microservices architecture with shared infrastructure, event bus,
two data stores, and cross-service async flows
```

### IEEE figure

```text
/drawio create an IEEE-style campus network figure for a paper with core,
distribution, and access layers in grayscale
```

## Notes

- YAML remains the canonical intermediate representation.
- Mermaid and CSV inputs are convenience adapters, not separate rendering pipelines.
- If validation warnings affect correctness or publication quality, switch to `--strict`.
