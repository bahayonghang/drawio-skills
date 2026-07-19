# Upstream Port Release Evidence

Release line: `2.7.0`

Local promotion gate: **pass**

This report describes the release boundary for the functional-equivalence port. It does not claim upstream CLI compatibility, remote publication, or external-provider execution.

## Shipped Ownership

- Base owns canonical spec and page bundle, stable identity, adapters, JavaScript ELK, rendering, catalogs, postprocess, references, evals, and reports.
- Academic owns publication policy and eval prompts only; it consumes the sibling base and contains no JS, TS, or Python runtime.
- One vendored `shape-index.json.gz`, one `ai-icons.json.gz`, and one `specToDrawioXml` implementation remain authoritative.

## Runtime And Dependency Boundary

- Node 20+ is the standard offline runtime.
- Python parsers are isolated and optional for explicitly selected adapter routes.
- Graphviz, network, Desktop, browser, MCP, model, provider CLI, daemon, cluster, and PR automation are not required by ordinary offline authoring.
- No production or runtime dependency was added by integration/promotion.

## Package Gate

The release archives are built by `just zip` from `git ls-files`. The final gate must run after an explicit staged allowlist so new tracked entries are included. It verifies:

1. each archive contains its own `SKILL.md` and tracked interface/eval/reference/report files;
2. zip names equal the corresponding staged Git manifest;
3. no `.drawio-tmp`, preview, log, cache, `.DS_Store`, `.last_update`, or unrelated archive file is present;
4. generated zip files are removed after SHA-256 and manifest evidence is recorded in the Trellis task.

## Local Package Result

- `drawio.zip`: 299 staged entries; required promotion reference, eval, scorecard, release report, SKILL, and interface files present; 0 forbidden entries.
- `drawio-academic-skills.zip`: 25 staged entries; required SKILL, interface, and eval files present; 0 forbidden entries.
- `archive/.gitignore` remained byte-identical. Generated zips are removed after final hash capture and are not release-source inputs.

## Evidence Status

- Deterministic compatibility, eval, docs, tests, and staged package-manifest checks: pass.
- Previously recorded C0 Desktop previews and AI icon Desktop evidence retain their original executor metadata.
- Provider/daemon/cluster, Graphviz parity, raster OCR/model fidelity, Desktop multi-page/postprocess, browser/MCP, visual-model metadata, PR automation, remote install, and remote release: **missing evidence**.

Remote release is `missing evidence`; this task performs no push, tag, upload, or external publication.
