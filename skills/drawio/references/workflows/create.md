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
   - Classify the figure as `architecture`, `roadmap`, or `workflow` before final layout and set `meta.figureType`.
4. **Scientific Diagram Branch**
   - Enable when the prompt mentions model architecture, CNN, YOLO, Transformer, encoder-decoder, attention, feature fusion, algorithm mechanism, ablation, experiment pipeline, or research framework.
   - Keep this branch in the base skill unless the request is publication-facing; route paper/thesis/journal/manuscript requests through the Academic Branch.
   - Classify the drawing intent before YAML:
     - model or system architecture -> modules, semantic node types, compact layer labels;
     - method workflow or experiment pipeline -> ordered steps, branches, feedback, validation;
     - operation or mechanism figure -> explicit `bounds`, small native cells, formulas, callouts, and off-line edge labels;
     - reference redraw -> use `/drawio replicate` inventory rules and `meta.source: replicated`.
   - For complex figures, write a short diagram plan before rendering: figure purpose, major sections/modules, key arrows, formula/callout placement, and verification artifact.
5. **Math / Formula Branch**
   - Enable when the prompt mentions `formula`, `equation`, `LaTeX`, `AsciiMath`, `MathJax`, `loss function`, `derivation`, `symbol legend`, `公式`, `行内公式`, or `行间公式`.
   - Load `references/docs/math-typesetting.md` as the syntax source of truth.
   - Load `references/docs/design-system/formulas.md` for formula-node placement and sizing.
6. **Stencil Branch**
   - Enable when the prompt mentions AWS, Azure, GCP, Cisco, Kubernetes, or vendor icons.
   - Use `references/docs/stencil-library-guide.md` to decide whether `search_shape_catalog` would help or whether semantic/icon fallbacks are sufficient.

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

Step 3: Classify academic figure intent when profile=academic-paper
├── structure / modules / runtime interaction -> meta.figureType=architecture
├── stage progression / milestones / study phases -> meta.figureType=roadmap
└── ordered execution / branching / fallback / loop -> meta.figureType=workflow

Step 4: Classify scientific diagram intent when relevant
├── model architecture -> modules for stages, semantic types for layers/operators
├── method workflow / experiment pipeline -> ordered steps, decisions, loops
├── system architecture paper figure -> tier/layer grouping and compact responsibilities
├── mechanism / operation figure -> native cells, formulas, callouts, explicit bounds
└── reference-image redraw -> switch to replicate inventory rules

Step 5: Decide Fast Path vs Full Path
├── Fast Path -> skip AskUserQuestion and skip ASCII confirmation
└── Full Path -> continue to Step 6

Step 6: Design Consultation (Full Path only)
├── Ask only unresolved questions:
│   • audience/profile
│   • theme
│   • layout
│   • figureType when academic intent is still ambiguous
│   • scientific drawing intent when model/workflow/operation intent is ambiguous
│   • expected complexity
└── Store decisions in designIntent and pre-fill YAML meta

Step 7: Academic / Math / Stencil references
├── math/formula request -> load math typesetting + formula integration guide
├── academic-paper -> load academic figure playbook + export checklist + IEEE + math typesetting
├── scientific model/operation request -> consult academic figure playbook patterns even when profile is non-academic
└── stencil-heavy -> decide whether shape search is needed
    ├── if `search_shape_catalog` exists, use it for exact vendor/device lookup
    └── otherwise use design-system icons or semantic fallbacks

Step 8: Build the YAML spec
├── Normalize Mermaid/CSV inputs to YAML spec
├── Ensure meta.theme, meta.layout, meta.profile are present
├── Ensure meta.figureType is present when profile=academic-paper
├── For model architectures, prefer `modules` plus semantic types such as `input`, `conv`, `pool`, `attention`, `feature`, `tensor3d`, `operator`, `loss`, and `output`
├── For operation figures, use explicit `bounds` for grids/formulas/callouts instead of relying only on auto layout
├── Use semantic node types and typed connectors
└── Add manual positions when branching or dense routing requires it

Step 9: ASCII Draft (Full Path only)
├── Render semantic ASCII draft
├── Include Design Summary:
│   • theme
│   • profile
│   • figureType
│   • layout
│   • node/edge/module counts
│   • validation status
│   • scientific diagram intent when applicable
└── Pause for confirmation only when logic or structure is still ambiguous

Step 10: Validation
├── validateColorScheme()
├── validateLayoutConsistency()
├── validateConnectionPointPolicy()
├── validateEdgeQuality()
├── validateAcademicProfile() when profile=academic-paper
└── checkComplexity()

Step 11: Edge Audit
├── No corner connection points
├── No shared face slots on the same corridor
├── Last segment >= 30px
├── Labels offset from edge lines
├── No waypoint + explicit connection-point mixing
└── Prefer straight arrows when alignment allows it

Step 12: Render
├── node <skill-dir>/scripts/cli.js input --input-format <yaml|mermaid|csv> output.drawio --validate --write-sidecars --sidecar-dir .drawio-tmp/output
├── For paper-quality diagrams prefer output.svg --validate --write-sidecars --sidecar-dir .drawio-tmp/output
├── For thesis / A4 / Word / PNG requests, add a matching PNG only when draw.io Desktop export is available
├── Note: standalone SVG (without --use-desktop) is preview-quality (straight-line edges).
│   For publication-grade vector output, add --use-desktop or export to .drawio and refine in draw.io.
└── When embedded export matters and draw.io Desktop exists, add --use-desktop for SVG or export to PNG/PDF/JPG

Step 13: Exported-Artifact Verification / Optional Live Handoff
├── Inspect the exported SVG first when it is available and readable by the current environment
├── If a raster/final-fidelity check is needed and draw.io Desktop is available -> export PNG/PDF/JPG or embedded SVG through the CLI
├── Do not create browser or Playwright screenshots when an exported SVG/PNG/PDF/JPG exists
├── live backend has `replace_diagram_xml` + user wants browser or inline refinement
│   └── use the provider-specific tool mapping from `references/docs/mcp-tools.md`
├── browser/live screenshots are a last-resort review aid only when the user explicitly requested live review and no exported artifact can be inspected
└── otherwise present .drawio + standalone SVG and report any remaining manual visual check
```

## Academic Branch Rules

When `meta.profile = academic-paper`:

- `meta.figureType` is required and must be exactly `architecture`, `roadmap`, or `workflow`.
- `meta.title` is required for figure captioning.
- `meta.description` is recommended for figure context.
- `meta.legend` is required when icons are used or connector types are mixed.
- Prefer `academic` theme unless the request explicitly asks for a color paper figure.
- Default final deliverables are `.drawio` and `.svg`; keep `.spec.yaml` and `.arch.json` in a project-local work directory unless a sidecar bundle is explicitly requested.
- Add `.png` only for thesis, A4, Word, raster-first, screenshot rebuild, or explicit PNG requests.
- Do not rely on color alone to distinguish semantics.
- Treat A4 readability and grayscale print safety as final review gates, not optional polish.

## Scientific Diagram Rules

- Use native draw.io primitives for the main figure: modules, shapes, text/formula nodes, connectors, waypoints, and `labelOffset`.
- Model architectures should use modules for stages such as Input, Backbone, Fusion/Neck, Head, Loss, or Output. Do not flatten every layer into identical generic boxes when semantic layer types are available.
- Operation/mechanism figures should keep the visual grammar small and explicit: one operation window, one output, one formula/callout, and arrows with labels offset away from connector lines.
- Experiment pipelines should separate data/setup, method, variants, validation, and metrics. Keep ablation branches visually parallel and converge them before evaluation.
- Reference-image scientific redraws should follow `/drawio replicate`: inventory first, `meta.source: replicated`, explicit `meta.canvas` when coordinate fidelity matters, and no full-page embedded reference image.
- Keep labels short enough for paper or slide use. Prefer a caption/legend or nearby `text` node over long prose inside architecture blocks.

## Math / Formula Branch Rules

When the request includes formulas, equations, or math-heavy labels:

- Use `$$...$$` only for standalone equations or labels that are entirely formula content.
- Use `\(...\)` for sentence-level inline math inside a longer label.
- Use `` `...` `` only when the user explicitly prefers AsciiMath or when the notation is simple.
- Do not generate bare LaTeX, `$...$`, or `\[...\]` in final YAML/XML output.
- Tell the user to enable `Extras > Mathematical Typesetting` when raw formulas may be edited in draw.io.
- For PDF exports where selectable math matters, recommend `math-output=html`.

## Notes

- YAML remains the canonical intermediate representation.
- `.drawio` is the editable final artifact; `.spec.yaml` and `.arch.json` remain the canonical offline sidecars in the work directory unless the user explicitly requests a beside-output bundle.
- Mermaid and CSV inputs are convenience adapters, not separate rendering pipelines.
- For formula-bearing labels, use only the three supported syntaxes: `$$...$$`, `\(...\)`, and `` `...` ``.
- Stencil-heavy requests may use shape search when available, but the create flow must still succeed without it.
- Academic figures should not blend structure, progression, and control flow into one ambiguous visual grammar.
