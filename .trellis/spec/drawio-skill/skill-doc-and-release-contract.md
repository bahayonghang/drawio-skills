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

## Scenario: mandatory runtime self-containment at the skill install boundary

### 1. Scope / Trigger

- Apply this contract when adding or changing a mandatory runtime import,
  vendored runtime file, package dependency, or CLI startup module under
  `skills/drawio`.
- Explicitly lazy optional parser routes may still depend on root
  `optionalDependencies` when absence maps to the documented
  `OPTIONAL_DEPENDENCY_MISSING` error. They must not become CLI startup
  requirements.

### 2. Signatures

- Installed package root: `<skills-dir>/drawio/` copied without the repository
  root or root `node_modules`.
- Mandatory smoke command:
  `node <skills-dir>/drawio/scripts/cli.js input.yaml output.drawio --validate`.
- Package command: `just zip`; new required files participate only after they
  are visible to `git ls-files`.

### 3. Contracts

- Mandatory runtime imports resolve through relative files shipped inside
  `skills/drawio` or through `node:` built-ins. They do not resolve through a
  repository-root or user-home package.
- Installed execution does not require `NODE_PATH`, a post-copy package-manager
  command, an installer hook, or runtime network access.
- Each vendored third-party runtime includes an exact version, upstream license,
  source/provenance note, and reproducible refresh instructions.
- Success returns status 0 and writes Draw.io XML that passes the CLI validator.

### 4. Validation & Error Matrix

| Condition | Required result |
| --- | --- |
| Full checkout succeeds but a skill-only copy cannot resolve a mandatory package | Packaging defect; do not ship |
| A nearer ancestor poison package changes startup behavior | Ambient dependency defect; do not ship |
| A required vendor file is absent from `drawio.zip` | Package gate failure |
| A documented optional parser is absent on its selected route | Return `OPTIONAL_DEPENDENCY_MISSING`; unrelated routes still load |
| Unsafe YAML tag reaches the mandatory parser | Reject through existing YAML security tests |

### 5. Good / Base / Bad Cases

- Good: a skill-only copy runs from a temporary cwd with `NODE_PATH` removed and
  an incompatible nearer package present, yet still writes valid Draw.io XML.
- Base: running the in-repository CLI after `npm install` is useful behavioral
  coverage but is not installation-boundary evidence.
- Bad: production uses `import yaml from 'js-yaml'` while only the root manifest
  declares that package; local tests pass by ancestor resolution and copied
  installs fail or load an incompatible package.

### 6. Tests Required

- Copy only `skills/drawio` to a temporary installation and run the installed
  CLI from outside the repository root.
- Remove every case variant of `NODE_PATH` from the child environment.
- Put a deliberately incompatible package with the same bare name in the nearer
  temporary ancestor so user-home packages cannot create a false pass.
- Assert exit status 0, output-file presence, and a closed `mxGraphModel`.
- Scan production scripts for mandatory bare imports of the vendored package.
- Before `just zip`, stage an explicit reviewed allowlist for new vendor files;
  inspect required/forbidden entries, smoke the extracted package, then run
  `just clean-zip`.

### 7. Wrong vs Correct

Wrong - the repository root silently owns the installed skill's runtime:

```js
import yaml from 'js-yaml'
```

Correct - the copied skill owns its exact runtime bytes:

```js
import yaml from '../vendor/js-yaml/js-yaml.mjs'
```

## Convention: eval evidence is per-assertion, never fabricated

**What**: `skills/*/evals/darwin-results.tsv` is the score log (9 tab-separated columns: `timestamp commit skill old_score new_score status dimension note eval_mode`). Score = 100 × passed / verifiable assertions; assertions the environment cannot exercise (e.g. Desktop-unavailable branch on a machine with Desktop installed) are excluded from both numerator and denominator and named in `note`. Run prompts through the offline CLI with outputs in repo-root `.drawio-tmp/…`, never inside `skills/`.

**Why**: Keeps the two skills' quality claims reproducible and comparable across rounds (baseline → keep/revert per change), and forbids invented verdicts.

**Related**: `skills/drawio/evals/README.md § Scoring method`; per-case detail pattern in the task archive (`research/eval-baseline-drawio.md`).
