# Draw.io Academic Skill

Academic-first draw.io skill for paper figures, IEEE-style architecture diagrams, research workflows, roadmaps, formula-heavy figures, and publication-ready exports.

This folder intentionally merges:

- `ref/drawio-skill`: pure SKILL.md generation, Desktop export, self-check, style presets, diagrams.net URL fallback.
- `skills/drawio`: YAML DSL, CLI validation, offline sidecars, academic figure checks, and math handling.

## Default workflow

```text
request -> YAML spec -> CLI validation -> .drawio + .spec.yaml + .arch.json + .svg
```

PNG, PDF, JPG, and embedded `.drawio.svg` use draw.io Desktop through the copied CLI.

## Quick export

```bash
node skills/drawio-academic-skills/scripts/cli.js input.yaml figure.svg --validate --write-sidecars
node skills/drawio-academic-skills/scripts/cli.js input.yaml figure.png --validate --use-desktop
```

If draw.io Desktop is unavailable, generate a diagrams.net browser URL:

```bash
node skills/drawio-academic-skills/scripts/runtime/diagrams-net-url.js figure.drawio
```

## MCP position

This skill intentionally does not include `.mcp.json`. Normal create, edit, replicate, and export tasks stay offline-first.

## Style presets

User presets live under:

```text
~/.drawio-academic-skills/styles/
```

Bundled upstream presets remain in `styles/built-in/`.

## Important references

- `SKILL.md`: main fused workflow.
- `references/docs/upstream-pure-drawio-skill.md`: preserved upstream pure SKILL.md workflow.
- `references/docs/academic-figure-playbook.md`: academic figure typing and delivery rules.
- `references/docs/academic-export-checklist.md`: publication-ready checklist.
- `references/docs/math-typesetting.md`: formula rules.
- `references/examples/`: reusable YAML examples.
