# Draw.io Academic Overlay

Academic overlay for publication-ready draw.io figures: papers, theses, IEEE diagrams, manuscripts, journal figures, formula-heavy visuals, research workflows, roadmaps, and A4/Word/LaTeX deliverables.

This folder is intentionally thin. It depends on the sibling Draw.io Base Skill at `../drawio` instead of copying base runtime files.

## Required sibling base

Install or copy both folders side by side:

```text
skills/
├── drawio/
└── drawio-academic-skills/
```

The overlay uses these base paths:

- `../drawio/scripts/cli.js`
- `../drawio/scripts/runtime/diagrams-net-url.js`
- `../drawio/references/docs/`
- `../drawio/references/workflows/`
- `../drawio/references/examples/`
- `../drawio/assets/themes/`
- `../drawio/styles/built-in/`

If `../drawio` is missing, install the base skill next to this overlay. Do not vendor-copy base files into the overlay.

## Default workflow

```text
academic request -> preflight -> YAML spec -> sibling base CLI validation -> .drawio + .spec.yaml + .arch.json + .svg
```

PNG, PDF, JPG, and embedded `.drawio.svg` use draw.io Desktop through the sibling base CLI when Desktop is available.

## Academic preflight

Before rendering, decide:

- venue or audience: paper, thesis, IEEE, journal, manuscript, Word/A4, LaTeX, slides, or draft
- figure type: `architecture`, `roadmap`, or `workflow`
- monochrome vs color policy
- caption, legend, and title needs
- formula and text-position fidelity
- requested export formats and Desktop availability

## Quick export

From inside this overlay directory:

```bash
node ../drawio/scripts/cli.js ../drawio/references/examples/system-architecture-paper.yaml figure.svg --validate --write-sidecars --strict-warnings
node ../drawio/scripts/cli.js ../drawio/references/examples/system-architecture-paper.yaml figure.png --validate --use-desktop
```

From the repository root:

```bash
node skills/drawio/scripts/cli.js skills/drawio/references/examples/system-architecture-paper.yaml figure.svg --validate --write-sidecars --strict-warnings
```

If draw.io Desktop is unavailable, generate a diagrams.net browser URL from the `.drawio` artifact:

```bash
node ../drawio/scripts/runtime/diagrams-net-url.js figure.drawio
```

## MCP position

This overlay intentionally does not include `.mcp.json`. Academic create, edit, replicate, and export tasks stay local and repeatable. Live backend refinement belongs to the base skill only and is not part of the academic default path.

## Style presets

User presets live under:

```text
~/.drawio-academic-skills/styles/
```

Bundled presets live in the sibling base:

```text
../drawio/styles/built-in/
```

Never mutate bundled base presets. Copy a bundled preset into the user preset directory before making it default or editing it.

## Overlay-owned files

- `SKILL.md`: academic policy and sibling-base contract.
- `references/docs/publication-overlay.md`: overlay-only publication notes.
- `evals/`: academic evaluation set and prompt fixtures.

Shared CLI, schemas, themes, examples, workflows, official references, style-extraction guidance, and the vendored direct-XML reference all live in `../drawio`.
