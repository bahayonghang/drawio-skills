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

Quality cues:

- group subsystems clearly
- emphasize layers or boundaries
- avoid turning the diagram into a chronological pipeline

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

Quality cues:

- keep the step order obvious
- label ambiguous decisions
- keep back-edges and loops sparse and readable

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
- `.spec.yaml`
- `.arch.json`
- `.svg`

Add `.png` only when one of these is true:

- the request is thesis or A4 focused
- the figure is for Word or another raster-first workflow
- the task is a screenshot or image rebuild that needs a matching raster companion
- the user explicitly asks for PNG

If draw.io Desktop export is unavailable, keep the offline bundle plus SVG as the completed baseline and note that PNG is optional follow-up.

## Final Quality Gate

Do not consider the figure complete until all of these are true:

- `meta.figureType` is set correctly
- the diagram reads clearly at normal A4 page zoom
- colors are not the only carrier of meaning
- labels are concise and readable
- connector routing is clean enough that the reading order is obvious
- the offline bundle and SVG are aligned
- any requested PNG companion matches the final diagram state
