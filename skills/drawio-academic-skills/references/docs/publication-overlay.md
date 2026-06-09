# Academic Publication Overlay

This file contains overlay-only policy for `drawio-academic-skills`. Shared schemas, CLI commands, design-system references, official XML/style mirrors, examples, themes, and workflow guides live in the sibling base skill at `../drawio`.

## Overlay Responsibility

Use this overlay when the request is publication-facing:

- paper, thesis, journal, IEEE, manuscript, camera-ready, or publication-ready figure
- A4 or Word/LaTeX export expectations
- academic formula figure or paper diagram replication
- research workflow, system architecture paper figure, or scholarly roadmap

## Required Academic Decisions

Before rendering, decide:

1. Venue or audience.
2. `meta.figureType`: `architecture`, `roadmap`, or `workflow`.
3. Color policy: monochrome, grayscale-safe accent, or color PDF.
4. Caption and legend requirements.
5. Formula/text placement fidelity.
6. Requested exports and whether draw.io Desktop is required.

## Source Understanding

Use the source mode before drafting YAML:

- Document or paper: extract the research problem, gap, objective, theory or assumptions, data, method, mechanism, validation, metrics, findings, and contribution.
- Reference image: extract visible containers, swimlanes, section labels, nodes, arrows, captions, legends, formulas, colors, line styles, and ambiguous text.
- Text-only request: infer a compact academic figure plan and keep assumptions explicit.

For paper-derived figures, classify the source first:

| Source type | Figure pattern |
| --- | --- |
| Algorithm or optimization paper | inputs -> assumptions -> model stages -> execution -> feedback -> scenarios -> metrics |
| Empirical study | question -> hypotheses/constructs -> data/sample -> variables -> method -> checks -> findings |
| Mechanism study | antecedents -> mediators -> moderators/boundaries -> outcomes -> evidence |
| System architecture paper | data/sensing -> processing modules -> decision/control -> outputs -> evaluation |
| Experimental study | problem -> setup -> treatment/control -> measurement -> analysis -> findings |
| Review or policy paper | problem space -> classification -> evidence groups -> synthesis -> gaps/recommendations |
| Deep-learning model paper | input -> backbone/encoder -> fusion/attention -> head/decoder -> loss/output -> metrics |
| Algorithm mechanism figure | local inputs -> operation window -> formula/operator -> output -> interpretation |

Map the result to the existing `meta.figureType` contract:

- `architecture`: structure, layers, modules, systems, actors, or static relationships.
- `roadmap`: study stages, milestones, phases, or progressive deliverables.
- `workflow`: ordered execution, branching, iterative methods, experiments, or pipelines.

## Scientific Figure Planning

When the source is a research model, mechanism, or experiment, turn the evidence chain into one of these compact plans before drafting YAML:

| Intent | Use | YAML emphasis |
| --- | --- | --- |
| Model architecture | CNN, YOLO, Transformer, encoder-decoder, feature fusion, multi-head prediction | `meta.figureType: architecture`, modules for stages, semantic layer types, concise tensor labels |
| Operation/mechanism | max pooling, attention scoring, residual add, gating, normalization, algorithm block | explicit `bounds`, native grid/matrix cells, `formula` nodes, `operator` nodes, offset arrows |
| Experiment pipeline | datasets, variants, simulations, ablations, validation, metrics | `meta.figureType: workflow`, parallel branches, shared evaluation, metrics/reporting block |
| Scholarly framework redraw | uploaded research framework or paper figure screenshot | `meta.source: replicated`, `meta.canvas` when needed, source inventory, no full-page image embed |

Prefer an architecture figure for static relationships and a workflow figure for ordered operations. Do not invent a new `meta.figureType` when the existing three values can express the paper role.

## Research Evidence Chain

Extract a compact evidence chain before proposing the figure:

1. Research problem and gap.
2. Objective or research question.
3. Inputs, data sources, sample, variables, or operating conditions.
4. Theory, assumptions, hypotheses, constructs, or constraints.
5. Core method, model, algorithm, mechanism, or framework.
6. Actors, system components, scenarios, or process stages.
7. Outputs, experiments, validation methods, metrics, and results.
8. Main contribution, implications, limitations, or future-work hook.
9. Feedback loops, uncertainty, or boundary conditions when they affect interpretation.

Do not force every item into the figure. Include the items that explain the paper's argument and distinguish the proposed approach.

## Diagram Plan Gate

For complex paper-derived figures, ambiguous diagrams, or academic image-improvement work, confirm a diagram plan before rendering. Use this template:

```text
Source type:
Figure type:
Primary research chain:
Major sections:
Supporting nodes:
Key arrows and feedback:
Formula/callout placement:
Validation and contribution:
Preview path:
Terms needing confirmation:
```

Skip this gate only for simple academic diagrams where the user already gave the figure type, labels, layout, and export expectations clearly.

## Content Compression

Academic figures should not copy paragraphs into boxes. Compress source text into:

- noun phrases for modules,
- verb phrases for arrows,
- short method labels for algorithm or experiment steps,
- short result labels for validation or findings,
- one-line notes for assumptions, constraints, or limitations.

Prefer 4-8 major modules and 2-5 supporting nodes per major section. Use one dominant reading path and only 1-2 feedback loops unless the source genuinely requires more.

For model-architecture and mechanism figures, compress repeated layers into stage labels such as `CSP block x3`, `Feature fusion`, or `Detect head` instead of drawing every internal layer. Use a legend or caption to explain notation that repeats across the figure.

## Optional Image Preview

Use external image-generation preview by default for:

- complex paper-derived figures with non-obvious layout or hierarchy,
- reference-image redraws where the user wants academic improvement rather than literal replication,
- proposal/thesis/manuscript figures where visual composition needs approval before YAML work.

Skip external image-generation preview for simple, straightforward academic diagrams and proceed directly to YAML/SVG.

Privacy rules:

- Ask before sending unpublished papers, confidential reports, proprietary data, or sensitive research content to an external model.
- Prefer sending the confirmed diagram plan, short labels, layout intent, and visual style constraints instead of raw source documents.
- If the user declines external processing, no image tool is available, or generation fails, fall back to local YAML/SVG preview.

Prompt constraints:

- Request academic diagram style, not a poster or marketing graphic.
- Use white or very light background, restrained colors, thin borders, clear hierarchy, and short labels.
- Ask for boxes, containers, swimlanes, callouts, feedback loops, and orthogonal arrows only when supported by the plan.
- Avoid decorative gradients, stock imagery, icons used as decoration, heavy shadows, and diagonal connector arrows.
- Treat generated text as approximate. Correct exact labels, formulas, and captions in YAML.

## Bundle Contract

Default academic final delivery is:

- `.drawio`
- `.svg`

Work-dir sidecars are still part of the reproducible bundle, but should live in a project-local work directory by default:

- `.spec.yaml`
- `.arch.json`

PNG/PDF/JPG are optional Desktop-enhanced exports. If Desktop is unavailable, report the missing export and provide the editable `.drawio`, SVG, work-dir sidecars, and fallback command or URL.

## Visual Verification

Use exported artifacts for paper-readability checks before any browser path:

1. Inspect the generated SVG when the current environment can view it.
2. If a raster or final-fidelity check is needed and draw.io Desktop is available, inspect the Desktop-exported PNG/PDF/JPG or embedded `.drawio.svg`.
3. Do not substitute browser or Playwright screenshots when an exported artifact exists.
4. Use live/browser screenshots only as a last-resort review aid when the user explicitly requested live review and no exported artifact can be inspected.

For the first exported artifact, check:

- overlap between modules, labels, captions, legends, or formula blocks;
- clipped text or formula rendering issues;
- connector labels sitting on top of lines;
- arrows crossing text or node interiors;
- missing modules, wrong grouping, or visual mismatch from the confirmed plan/source;
- colors being the only carrier of meaning.

If a visible defect is found, adjust the YAML spec and rerender once. After that correction pass, report the result instead of starting an open-ended polish loop.

## Base References

Load the sibling base references for detailed rules:

- `../drawio/references/docs/academic-figure-playbook.md`
- `../drawio/references/docs/academic-export-checklist.md`
- `../drawio/references/docs/math-typesetting.md`
- `../drawio/references/docs/design-system/specification.md`
- `../drawio/references/workflows/create.md`
- `../drawio/references/workflows/edit.md`
- `../drawio/references/workflows/replicate.md`
