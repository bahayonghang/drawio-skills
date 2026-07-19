# Integration Handoff - Offline AI Icon Catalog

## Public Runtime Contract

- Canonical identifiers are `lobe.<slug>` for all 309 catalog slugs.
- `ai.<slug>` resolves the same catalog record except the documented full-name compatibility identifier `ai.anthropic`, which remains Claude.
- `lobe.anthropic` is the exact Anthropic brand from the catalog.
- Existing `brand.openai`, bare `openai`, `lobe.chatgpt`, `ai.chatgpt`, and the `open-ai` / `open_ai` forms remain OpenAI-compatible.
- `search <query> --prefix lobe` and `--prefix ai` return canonical `icon: lobe.<slug>` syntax. Unknown `lobe.*` / `ai.*` validation uses the same deterministic ranking.
- Catalog corruption is a hard `AI icon catalog ...` error. An unknown valid slug returns `null` and may produce suggestions.

## Assets, License, and Trust

- Runtime asset: `skills/drawio/assets/catalog/ai-icons.json.gz`.
- Fixed source: `@lobehub/icons-static-svg@1.91.0`, MIT, with registry integrity pinned in the task PRD and catalog provenance.
- License text: `skills/drawio/assets/licenses/lobe-icons-MIT.txt`.
- Trust report: `research/catalog-trust-report.md` in this child.
- Trademark wording for later public docs: icon names and marks identify their respective products; inclusion does not imply endorsement by the trademark owner.
- The source package is a reviewed development-time input only. Do not add it to `package.json`, `package-lock.json`, or runtime installation instructions.

## File-Backed Cases

- `ai-icons-core-aliases.yaml`: canonical names plus OpenAI/Claude/Gemini/Anthropic compatibility.
- `ai-icons-gradients.yaml`: linear and radial gradients.
- `ai-icons-current-color.yaml`: base/currentColor rendering on a light high-contrast theme.
- `ai-icons-advanced-svg.yaml`: clipPath, mask, and filter preservation.
- `ai-icons-cjk-agent-rag.yaml`: dense CJK RAG/Agent labels and connected multi-brand flow.
- Manifest: `skills/drawio/evals/ai-icon-catalog-cases.json`.
- Desktop evidence: `skills/drawio/evals/evidence/ai-icon-catalog-desktop.json`.

## Evidence Boundary

- `recorded fixture`: present for all five cases.
- `command-executed`: validation and offline data-URI checks passed for all five cases.
- `Desktop-executed`: draw.io Desktop 30.3.14 produced five bounded, structurally valid, non-empty PNG previews.
- `model-executed`: `missing evidence`; no external visual model, browser, or MCP was approved.
- Preview PNGs and generated `.drawio` files remain under `.drawio-tmp/` and are not release assets.

## Later Integration Work

- Add one concise capability pointer to each relevant `SKILL.md`; do not paste the 309-name catalog or generator details into skill prose.
- Update interfaces and public docs with the identifier/search syntax, license/trademark wording, and offline behavior.
- Add these five cases to the cross-capability eval and global output scorecard while preserving `model-executed: missing evidence` until a real provider/model run exists.
- Confirm the packaged skill includes `assets/catalog/ai-icons.json.gz` and `assets/licenses/lobe-icons-MIT.txt`.
- No skill description change was required by this child. If a later integration changes descriptions, run the existing trigger regression and size budget checks.

## Residual Risk and Rollback

- Desktop structural and pixel checks do not prove each SVG feature renders identically across Desktop versions; gradients, masks, filters, and currentColor still need approved visual adjudication.
- Source upgrades require an explicit package/version/integrity change plus count, security, deterministic gzip, visual, license, and package-diff review.
- Rollback the catalog loader/search branch and restore the previous embedded OpenAI/Claude/Gemini constants. Redis, Lucide, ordinary stencils, and the academic overlay stay independent.
