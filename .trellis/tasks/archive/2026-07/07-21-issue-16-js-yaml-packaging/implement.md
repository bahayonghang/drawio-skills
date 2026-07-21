# Implement - Self-contained js-yaml runtime packaging

## Checklist

1. [x] Add `tests/skill-installation.test.js` before production changes.
   - Copy only `skills/drawio` into a temporary installation.
   - Add a nearer poison `node_modules/js-yaml`, delete `NODE_PATH`, and run the
     copied CLI from outside the repository.
   - Assert the current code fails for the dependency-boundary reason, then keep
     the test as the regression gate.
   - Command: `node --test tests/skill-installation.test.js`.

2. [x] Vendor exact `js-yaml@4.1.1` runtime bytes.
   - Add `js-yaml.mjs`, upstream MIT `LICENSE.md`, and provenance/regeneration
     `README.md` under `skills/drawio/scripts/vendor/js-yaml/`.
   - Compare the selected ESM file and license with the exact package source and
     confirm its default and named exports cover all current consumers.
   - Do not add a runtime download, install script, fallback lookup, or minified
     alternate copy.

3. [x] Move every mandatory parser consumer to the vendor boundary.
   - Update the four production imports and the direct parser import in
     `graph-drift.file.test.js`.
   - Add/retain a source assertion that forbids production bare `js-yaml`
     imports.
   - Run the isolated test; it must now pass despite the poison package.

4. [x] Remove the root direct runtime dependency.
   - Delete `dependencies.js-yaml` from `package.json` and refresh only the
     corresponding root lockfile metadata.
   - Confirm any remaining `js-yaml` lock entry is explained only by developer
     tooling, not by base-skill runtime resolution.
   - Commands: `npm install --package-lock-only --ignore-scripts` and
     `npm explain js-yaml`.

5. [x] Record the fix without claiming release publication.
   - Add concise Unreleased `Fixed` entries to `skills/drawio/CHANGELOG.md` and
     root `CHANGELOG.md`.
   - Do not change package/SKILL versions or academic changelog/runtime files.

6. [x] Run focused behavioral and security checks.
   - `node --test tests/skill-installation.test.js`
   - `node --test tests/integration.test.js tests/security.test.js`
   - `node --test skills/drawio/scripts/dsl/document-spec.test.js`
   - `node --test skills/drawio/scripts/adapters/config-common.test.js skills/drawio/scripts/adapters/graph-drift.file.test.js`
   - Run focused artifact serialization tests selected from the changed import
     graph.

7. [x] Run the full repository gate and inspect the final diff.
   - `just ci`
   - Confirm only the design allowlist, task artifacts, and normal Trellis
     lifecycle files changed.
   - Re-run the issue's minimal CLI command from a direct skill-only copy.

8. [x] Prove the tracked release boundary.
   - Stage an explicit reviewed allowlist so new vendor files participate in
     `git ls-files` packaging.
   - Run `just zip`, inspect `archive/drawio.zip` for all three vendor files and
     forbidden-path absence, and smoke the extracted base skill in isolation.
   - Record local package evidence without claiming a remote install or release.
   - Run `just clean-zip` and verify generated archives/temp copies are gone.

9. [x] Complete the Trellis quality and lifecycle gates only after implementation
       approval.
   - Run `trellis-check`, update specs only if a reusable contract changed, make
     the scoped production commit, and archive/journal the task per Phase 3.
   - Keep remote push, release, GitHub issue mutation, and version changes out of
     this task unless separately authorized.

## Review gates

- Gate A: the new isolated test fails before production changes for the expected
  dependency-boundary reason.
- Gate B: the same test passes after vendoring while the poison package remains.
- Gate C: existing YAML semantics and security tests pass unchanged.
- Gate D: full CI and staged package evidence pass with no forbidden content.

## Implementation evidence

- Gate A: the new test failed before production changes with both the isolated
  CLI failure and the four expected bare-import offenders.
- Gate B: `node --test tests/skill-installation.test.js` passed 2/2 with the
  poison ancestor package still present.
- Focused regression: 98 CLI/security/document/config/drift tests and 18 direct
  artifact/projection tests passed with no failures.
- Dependency boundary: `npm explain js-yaml` reports only the
  `markdownlint-cli@0.47.0` development path; the root package has no direct
  runtime declaration.
- Full gate: `just ci` passed with 633 tests passed, 2 optional-parser tests
  skipped, 0 failed, Markdown lint clean, versions synchronized at 2.7.0, and
  the VitePress production build complete.
- Package gate: `drawio.zip` contained 302 entries and 1,833,526 bytes with
  SHA-256 `DE9B4F43DC736B098A64CA3AC0386FABFC4756CE1DDBFE1F2DC86E8415D3EF05`;
  required vendor files missing 0 and forbidden paths 0.
- Extracted package smoke: Node 25.9.0, `NODE_PATH` cleared, no `D:\node_modules`,
  exit 0, output present, closed `mxGraphModel`, and XML validation passed.
- Cleanup: both generated zip files and the extracted smoke directory were
  removed after verification.

## Rollback points

- Before step 4, imports and vendor files can be reverted without lockfile work.
- Steps 2-5 form one production unit; revert them together if the vendor API or
  license provenance cannot be verified.
- Tests and task evidence must not be deleted to conceal a failed package gate;
  return to planning or implementation and record the missing evidence.
