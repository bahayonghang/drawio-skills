# Fix issue 16 js-yaml skill packaging

## Goal

Make the documented `skills/drawio` installation boundary executable without the
repository root, an ambient ancestor `node_modules`, a post-copy package install,
or runtime network access. Preserve the current YAML behavior while fixing GitHub
issue #16.

## Background

- GitHub issue #16 reports that `npx skills add bahayonghang/drawio-skills` and
  the documented manual copy fail because the installed base skill cannot resolve
  `js-yaml`.
- The public installation contract copies `skills/drawio`, while the only direct
  `js-yaml` declaration is in the repository-root `package.json`.
- Four production modules use a bare `js-yaml` import:
  `scripts/dsl/spec-to-drawio.js`, `scripts/dsl/document-spec.js`,
  `scripts/adapters/config-common.js`, and `scripts/runtime/artifacts.js`.
- The main CLI statically loads those modules before command dispatch, so the
  defect can prevent the whole `scripts/cli.js` entrypoint from starting rather
  than affecting only one YAML subcommand.
- Current repository tests execute the in-repository CLI with root
  `node_modules`, and the zip gate checks tracked content but does not execute an
  isolated installed copy.
- The defect was reproduced on Windows with Node 25.9.0: the full checkout
  succeeded, while a skill-only copy with no ancestor `node_modules` exited 1
  with `ERR_MODULE_NOT_FOUND` and produced no output. A second probe resolved an
  incompatible user-home `js-yaml`, proving that ambient dependency lookup can
  also fail with the wrong package API.

## Requirements

### R1. Self-contained base runtime

- Every mandatory YAML parser import used by the base skill must resolve from
  tracked files inside `skills/drawio`.
- The installed base skill must not require `npm install`, installer hooks,
  `NODE_PATH`, a repository checkout, a user-home package, or runtime network
  access.
- The bundled parser must carry an exact upstream version, license text, source
  provenance, and reproducible refresh instructions.

### R2. Behavioral and dependency compatibility

- Preserve the `js-yaml` 4.1.1 APIs and current semantics used by production:
  default `load`/`dump`, named `loadAll`, and `JSON_SCHEMA`.
- Existing unsafe-tag rejection, document parsing, config adapters, sidecar
  serialization, and YAML formatting contracts must continue to pass.
- Remove the repository root's direct production declaration of `js-yaml` once
  production and tests no longer rely on it. A transitive copy used by developer
  tooling may remain in the lockfile and is not runtime evidence.
- Do not change optional parser loading or vendor unrelated dependencies.

### R3. Release-boundary regression coverage

- Add a deterministic test that copies only `skills/drawio` to an isolated
  temporary installation, removes `NODE_PATH`, runs outside the repository root,
  converts the issue's minimal YAML shape through `scripts/cli.js --validate`,
  and verifies valid Draw.io XML is written.
- The test must prevent ancestor `node_modules` from making the test pass. It
  must remain reliable on Windows installations whose temp directory is below a
  user home containing `node_modules`.
- The regression must fail against the current pre-fix code and pass only when
  the installed skill uses its own tracked runtime.

### R4. Package and repository gates

- `just ci` must pass after the dependency boundary changes.
- The tracked-content zip must include the parser runtime, license, and
  provenance files, contain no forbidden scratch, and support the same isolated
  YAML smoke path.
- Generated archives and temporary installation copies must be cleaned after
  verification.

### R5. Change reporting

- Record the user-visible packaging fix in the base-skill and repository
  Unreleased changelogs without claiming a remote release.
- Keep existing installation documentation unchanged unless implementation
  discovers a factual statement that remains false after the fix.

## Acceptance Criteria

- [x] AC1: A copy containing only `skills/drawio` converts a minimal YAML input
      to a valid `.drawio` file with `--validate`, with `NODE_PATH` absent and a
      deliberately incompatible nearer ancestor `js-yaml` unable to affect it.
- [x] AC2: The vendored parser is exact-versioned, licensed, provenance-documented,
      loaded only by relative paths, and performs no runtime network or install step.
- [x] AC3: No production module under `skills/drawio/scripts` has a mandatory bare
      `js-yaml` import; the root package no longer declares it as a direct runtime
      dependency.
- [x] AC4: Existing YAML security, document, adapter, artifact, CLI, and drift
      tests retain their behavior, including rejection of unsafe YAML tags.
- [x] AC5: `just ci` passes and `just zip` proves the tracked base archive contains
      all required vendored files and no forbidden artifacts.
- [x] AC6: The base and repository Unreleased changelogs describe the fix without
      a version, tag, publication, or remote-install success claim.

## Out of Scope

- Publishing a release, changing versions, creating tags, pushing commits,
  closing issue #16, or changing GitHub labels/comments.
- Redesigning `npx skills add`, adding package-install hooks, or requiring users
  to run a package manager inside an installed skill.
- Vendoring the optional Node/Python parser routes or changing their documented
  `OPTIONAL_DEPENDENCY_MISSING` behavior.
- Changing YAML schemas, accepted syntax, serializer formatting, CLI options, or
  the academic overlay runtime.

## Notes

- Source: [GitHub issue #16](https://github.com/bahayonghang/drawio-skills/issues/16)
- This task closes the `js-yaml` installation-strategy exclusion recorded by the
  archived `07-11-pr7-icon-resolver-hardening` task.
- No blocking product-intent question remains for planning. Remote release work
  requires separate explicit authorization.
