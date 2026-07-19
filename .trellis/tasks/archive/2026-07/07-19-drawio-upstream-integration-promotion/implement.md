# Implement - Upstream integration and promotion

## 1. Preflight and activation

- [x] Reconfirm working tree, active tree, archived child evidence, and protected artifacts.
- [x] Review PRD/design/implement for no TBD, exact allowlist, rollback, and missing evidence.
- [x] Run `task.py start 07-19-drawio-upstream-integration-promotion`.
- [x] Load `trellis-before-dev` and applicable drawio-skill specs before edits.

## 2. Red phase

- [x] Add `tests/upstream-integration-contract.test.js` first.
- [x] Assert the 37-row authoritative map, unique upstream filenames, allowed dispositions, at least five file-backed cases, valid fixture paths, shipped/deferred C3 boundaries, route pointers, interface parity, unchanged descriptions/versions, and zero academic runtime ownership.
- [x] Run `node --test tests/upstream-integration-contract.test.js` and record the expected failures before production promotion files exist.

## 3. Promotion edits

- [x] Create the 37-row packaged compatibility matrix and point the parent audit at it.
- [x] Add the cross-capability eval manifest and minimal base/academic manual eval cases.
- [x] Add concise base/academic SKILL routes without changing descriptions.
- [x] Synchronize all four interface YAML files.
- [x] Add mirrored English/Chinese CLI documentation.
- [x] Generalize the scorecard and add release/package evidence with honest classifications.
- [x] Confirm no feature runtime, dependency, version, or deferred operation was added.

## 4. Focused and broad validation

- [x] `node --test tests/upstream-integration-contract.test.js tests/skill-metadata.test.js tests/drawio-academic-skill.test.js tests/palette-skill-policy.test.js tests/visual-verification-policy.test.js tests/vision-preview-evidence.test.js tests/ai-icon-catalog-evidence.test.js skills/drawio/scripts/adapters/graph-drift.file.test.js skills/drawio/scripts/adapters/raster-extraction.test.js skills/drawio/scripts/dsl/document-spec.test.js skills/drawio/scripts/dsl/ai-icon-catalog.test.js skills/drawio/scripts/dsl/shape-catalog.test.js skills/drawio/scripts/postprocess/cli.test.js skills/drawio/scripts/postprocess/html.test.js`
- [x] Run `trellis-check` for spec, reuse, cross-layer consistency, and prohibited duplication.
- [x] `npm test`
- [x] `just ci`
- [x] `npm run docs:build`
- [x] `git diff --check`
- [x] Confirm description hashes/text are unchanged; skip trigger regression only on that evidence.

## 5. Package evidence and commit

- [x] Inspect the final diff and `git status --short --untracked-files=all`.
- [x] Stage only the design allowlist; verify `git diff --cached --name-only` and exclude `archive/.gitignore`, previews, `.drawio-tmp/`, generated docs, and unrelated files.
- [x] Run `just zip`; inspect both zip manifests and forbidden-path absence; record sizes and SHA-256 in this task evidence.
- [x] Run `just clean-zip`; confirm only protected/unrelated artifacts remain unstaged.
- [x] Commit the production promotion unit with Chinese Conventional Commit, emoji, `[AI]`, Why, and agent trailer.
- [ ] Commit task evidence separately, then archive and journal the child.

## 6. Rollback and missing evidence

- Rollback unit: revert the promotion commit; archived feature implementations and legacy CLI behavior remain intact.
- Any failed promotion assertion is resolved by correcting docs/routing/evidence to actual shipped behavior, not by adding runtime.
- Provider/daemon/cluster, Graphviz, raster OCR/model, Desktop multi-page/postprocess, browser/MCP, model metadata, PR automation, remote package installation, and remote release remain `missing evidence`.

## 7. Execution Evidence

- Red: `tests/upstream-integration-contract.test.js` produced 3 expected failures for missing compatibility, eval registry, and promotion routing.
- Green focused: 47 passed, 0 failed.
- Root: `npm test` and `just ci` each reported 633 total, 631 passed, 2 optional dependency skips, 0 failed; Markdown lint and VitePress build passed.
- Explicit docs: `npm run docs:build` passed after final report synchronization.
- Diff: working and staged `git diff --check` passed.
- Description/version: no diff; trigger regression correctly skipped.
- Duplication scan: one `shape-index.json.gz`, one `ai-icons.json.gz`, one `specToDrawioXml` owner, zero academic JS/TS/Python runtime files.
- Final base package: 299 entries, 1,804,856 bytes, SHA-256 `B61CBB7B82600060409B8085D9B93D93118DCA63C2A7C8973F9CE4C1E37F7892`, missing required 0, forbidden 0.
- Final academic package: 25 entries, 43,308 bytes, SHA-256 `058AF88BCEE90245870D48B034BBA136C6B44FD4E28B41C95F73756D9112DF4B`, missing required 0, forbidden 0.
- Generated zips removed; `archive/.gitignore` remained byte-identical and unstaged.
- Production promotion commit: `978bab1 feat(skill): [AI] ✨ 推广上游离线能力整合入口`.
- Spec update: not required; this child consumed existing release, adapter, multi-page, raster, SysML/BPMN, and postprocess contracts without introducing a new convention.
