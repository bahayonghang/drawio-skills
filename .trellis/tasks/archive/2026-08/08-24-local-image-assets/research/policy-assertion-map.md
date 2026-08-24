# Policy assertion map (SKILL.md / CHANGELOG / overlay references)

Built before SKILL.md edits for local image assets. Contract phrases stay verbatim.

## tests/skill-metadata.test.js

| Assertion | Location | Contract |
| --- | --- | --- |
| frontmatter `version` equals `package.json` version | both SKILL.md | Do not desync version; bump via version-sync |
| `description` ≤ 1024 chars and ≤ 1024 UTF-8 bytes | both SKILL.md frontmatter | Do not change `description` (task constraint) |
| icon resolver has no `readFileSync` / CDN / `image=https?` | `icon-resolver.js` | Exporting `IMAGE_ICON_STYLE_PREFIX` is allowed |

## tests/visual-verification-policy.test.js

| Assertion | Location | Contract phrase (verbatim) |
| --- | --- | --- |
| exported-artifact first | base SKILL.md | `Perform visual self-checks on exported artifacts first` |
| no Playwright when export exists | base SKILL.md | `Do not create browser or Playwright screenshots when a CLI/Desktop export exists` |
| inspect PNG or fallback SVG | base SKILL.md | `inspect the exported PNG (or the fallback SVG when Desktop is unavailable) first` |
| visual-review pointer | base SKILL.md | `workflows/visual-review.md` |
| create workflow | `workflows/create.md` | `Exported-Artifact Verification`; `Do not create browser or Playwright screenshots when an exported SVG/PNG/PDF/JPG exists`; `visual-review.md` |
| edit / replicate workflows | those files | `visual-review.md`; replicate: `Export standalone SVG first`; `Use browser/live screenshots only as a last-resort review aid` |
| academic screenshots | academic SKILL.md | `Do not substitute browser or Playwright screenshots when an exported artifact exists` |
| academic visual-review path | academic SKILL.md | `../drawio/references/workflows/visual-review.md` |
| publication overlay | `publication-overlay.md` | `Use exported artifacts for paper-readability checks before any browser path`; `../../../drawio/references/workflows/visual-review.md` |
| export guide | `docs/guide/export.md` | `Use exported artifacts for visual checks before any browser screenshot` |
| visual-review fields | `visual-review.md` | `pageId`, `objectId`, `problem`, `severity`, `evidence`, `suggestedAction`, `source`, `edge-label-overlap`, `source-mismatch`, `canonical YAML`, `2 autonomous repair rounds`, `5 user feedback rounds` |
| deliverables split | base SKILL.md | `deliver \`<name>.drawio\` and a 300dpi \`<name>.png\``; `\`.drawio-tmp/<name>/\``; `--sidecar-dir .drawio-tmp/output`; scratch JS prohibition |
| academic deliverables | academic SKILL.md | `default academic final deliverables`; `\`.drawio-tmp/<name>/\``; `--sidecar-dir .drawio-tmp/figure`; scratch JS prohibition |
| structural regex | academic SKILL.md | `/Default deliverables:\s*\n\n([\s\S]*?)\n\nIntermediate work directory:/` capture must NOT contain `<name>.spec.yaml` or `<name>.arch.json` |

## tests/palette-skill-policy.test.js

| Assertion | Location | Contract |
| --- | --- | --- |
| AskUserQuestion near palette | base SKILL.md | `AskUserQuestion` within 500 chars of palette/colorblind/grayscale/black-and-white/multi-category |
| skip when specified | base SKILL.md | already/explicitly/specified within 250 chars of do not ask/skip |
| replicate preserve | base SKILL.md | replicat within 500 chars of preserve/source palette, then do not ask/skip |
| venue AskUserQuestion | academic SKILL.md | venue within 500 chars of AskUserQuestion |
| `(Recommended)` | academic SKILL.md | literal |
| `meta.palette` | academic SKILL.md | literal |
| safety words | academic SKILL.md | safety/colorblind/grayscale |
| completion report near palette | academic SKILL.md | `completion report` within 200 chars of `palette` |
| docs | color-guide, themes, specification, playbook, overlay | orthogonal theme/palette; `$paletteN-fill`; `~/.drawio-skill/palettes/`; named palettes; `PALETTE_PRINT_GATE` |
| versions | package.json, both evals.json | currently 2.7.0; this task bumps to 2.8.0 and must update this test |
| eval ids | both evals.json | `base-palette-selection`, `base-replicate-palette-preservation`, `academic-ieee-print-palette`, `academic-explicit-palette` |
| CHANGELOG 2.7.0 window | both skill CHANGELOGs | `## 2.7.0 (2026-07-14)` within 500 chars of `palette` — do not edit that heading or paragraph |
| README | root README.md | `Draw.io Skill` |

## tests/drawio-academic-skill.test.js

| Assertion | Location | Contract |
| --- | --- | --- |
| overlay has no copied runtime | overlay tree | no `scripts/cli.js`, themes, schema, official xml, create workflow, `.mcp.json` |
| sibling pointers | academic SKILL.md | `../drawio/scripts/cli.js`, `../drawio/assets/themes/`, `../drawio/styles/built-in/` |
| MCP exclusion | academic SKILL.md | `Never create, require, or route through \`.mcp.json\``; must NOT mention `mcp-tools.md` |
| three H2s | academic SKILL.md | `## Source Understanding`, `## Diagram Plan Gate`, `## Optional Image Preview` |
| preview sentence | academic SKILL.md | `external image-generation previews as optional concept previews only` |
| overlay docs | `publication-overlay.md` | `## Research Evidence Chain`, `## Optional Image Preview`, `Ask before sending unpublished papers`, `adjust the YAML spec and rerender once` |
| references whitelist (13 files, `assert.deepEqual`) | overlay `references/` | listed below — prefer new docs in base `references/` |
| no byte-identical overlay copy of a base file | overlay vs base | do not copy base files into overlay |
| eval ids | both evals.json | base mermaid/csv/import/live/desktop ids; academic-* prefix only on overlay |

### Overlay `references/` whitelist (do not add files here)

```
docs/academic-export-checklist.md
docs/academic-figure-playbook.md
docs/publication-overlay.md
examples/ablation-study-pipeline.yaml
examples/ieee-network-paper.yaml
examples/industrial-architecture-cn-paper.yaml
examples/max-pooling-operation-paper.yaml
examples/research-pipeline.yaml
examples/system-architecture-paper.yaml
examples/technical-roadmap-paper.yaml
examples/yolo-model-architecture-paper.yaml
templates/multi-module-system-compact.yaml
templates/neural-network-architecture-compact.yaml
```

## SKILL.md edit plan (this task)

- Keep every verbatim phrase above.
- Do not change frontmatter `description`.
- Add a local-image route and a short capability paragraph in the Draw.io Base Skill.
- Add academic raster-audit bullets in the Academic Overlay Quality Gate and a short policy paragraph in `publication-overlay.md` (existing whitelist file).
- Put the recipe document in base `references/docs/local-image-assets.md`.
- After each SKILL.md edit, run root `npm test`.
