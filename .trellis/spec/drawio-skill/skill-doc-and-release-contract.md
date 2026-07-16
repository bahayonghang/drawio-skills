# Skill Doc & Release Contract

Executable contracts for editing the two SKILL.md entrypoints, their references, and the release packaging. Established during 07-16-skill-audit-optimization (yao-meta audit → W1–W6).

## Convention: SKILL.md wording is test-pinned — map assertions before editing

**What**: Four root tests read the SKILL.md files and assert on their literal text:

- `tests/skill-metadata.test.js` — frontmatter `version` == package.json; `description` ≤ 1024 chars/bytes.
- `tests/visual-verification-policy.test.js` — verbatim sentences (e.g. `Perform visual self-checks on exported artifacts first`, `` deliver `<name>.drawio` and a 300dpi `<name>.png` ``) and a **structural regex** on the academic file: `/Default deliverables:\s*\n\n([\s\S]*?)\n\nIntermediate work directory:/` whose captured block must NOT contain `<name>.spec.yaml` / `<name>.arch.json`.
- `tests/palette-skill-policy.test.js` — **proximity windows**: e.g. base `AskUserQuestion` within 500 chars of a palette keyword; academic `completion report` within 200 chars of `palette`. Also pins CHANGELOG `## 2.7.0 (2026-07-14)` sections.
- `tests/drawio-academic-skill.test.js` — academic must contain three H2 headings (`## Source Understanding`, `## Diagram Plan Gate`, `## Optional Image Preview`), must NOT mention `mcp-tools.md`, and its `references/` tree is an **exact whitelist** (`assert.deepEqual`, 13 files) — adding/removing any file there breaks the suite. Overlay files must not be byte-identical to any base file.

**Why**: A slim/reword pass that ignores these breaks CI in non-obvious ways (proximity windows fail even when every phrase survives).

**How**: Before rewording either SKILL.md, build/refresh an assertion map (template: `.trellis/tasks/archive/**/07-16-skill-audit-optimization/research/policy-assertion-map.md`), keep contract phrases verbatim, then run root `npm test` after every file. Frontmatter (incl. `description`) changes additionally require the 26-probe trigger regression (see `07-09-skill-desc-slim` research).

**Wrong**: Move rule text into a reference and delete the SKILL.md sentence carrying an asserted literal.
**Correct**: Keep a one-line contract sentence with the asserted literal + a pointer to the authoritative reference.

## Convention: release zip content == `git ls-files`

**What**: The `justfile` `zip` recipe builds each skill archive from `git ls-files -- skills/<name>` (not directory scans) into `archive/`, and fails (`SystemExit`) when: the listing is empty / missing `SKILL.md`; any tracked path hits the denylist (`.drawio-tmp`, `.playwright-mcp`, `logs`, `.DS_Store`, `.last_update`, `docs/superpowers`); or the zip namelist diverges from the listing.

**Why**: `shutil.make_archive` previously packaged the whole directory, so gitignored local scratch (e.g. `skills/drawio/.drawio-tmp/`) leaked into release zips; gitignore does not protect archive builds.

**Validation**: `just zip` then compare namelist ↔ `git ls-files`; `just clean-zip` to clean. Anything that must ship must be committed first.

## Convention: eval evidence is per-assertion, never fabricated

**What**: `skills/*/evals/darwin-results.tsv` is the score log (9 tab-separated columns: `timestamp commit skill old_score new_score status dimension note eval_mode`). Score = 100 × passed / verifiable assertions; assertions the environment cannot exercise (e.g. Desktop-unavailable branch on a machine with Desktop installed) are excluded from both numerator and denominator and named in `note`. Run prompts through the offline CLI with outputs in repo-root `.drawio-tmp/…`, never inside `skills/`.

**Why**: Keeps the two skills' quality claims reproducible and comparable across rounds (baseline → keep/revert per change), and forbids invented verdicts.

**Related**: `skills/drawio/evals/README.md § Scoring method`; per-case detail pattern in the task archive (`research/eval-baseline-drawio.md`).
