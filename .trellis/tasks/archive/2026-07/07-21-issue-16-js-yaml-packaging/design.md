# Design - Self-contained js-yaml runtime packaging

## 1. Selected approach

Vendor the exact `js-yaml@4.1.1` ESM distribution inside the base skill. This is
the smallest mechanism that satisfies the existing copy-only, offline install
contract and follows the established `scripts/vendor/elkjs` pattern.

Adding a dependency to `skills/drawio/scripts/package.json` is insufficient:
neither `npx skills add` nor the documented manual copy is guaranteed to execute
an install hook. Requiring such a hook would change every supported installer,
introduce runtime network/provisioning requirements, and leave manual copies
broken.

## 2. Vendored artifact contract

Add these tracked files:

- `skills/drawio/scripts/vendor/js-yaml/js-yaml.mjs`: upstream
  `js-yaml@4.1.1` `dist/js-yaml.mjs`.
- `skills/drawio/scripts/vendor/js-yaml/LICENSE.md`: upstream MIT license.
- `skills/drawio/scripts/vendor/js-yaml/README.md`: exact package/version,
  upstream source, selected file, license, loading contract, and regeneration
  commands.

The ESM distribution is self-contained and exports the same default object and
named `loadAll` / `JSON_SCHEMA` APIs used today. It does not need the package's
CLI-only `argparse` dependency.

Source review and refresh are explicit maintenance events. The runtime never
downloads, discovers, or upgrades the vendor file.

## 3. Import boundary

Change the four production imports to the relative module:

```text
scripts/{dsl,adapters,runtime}/*.js
  -> ../vendor/js-yaml/js-yaml.mjs
```

The file-backed drift test that directly parses an expected YAML fixture also
uses the same relative vendor path. All parser consumers therefore exercise the
shipped bytes rather than a hoisted repository package.

After imports are migrated, remove root `dependencies.js-yaml` and refresh the
lockfile. `markdownlint-cli` currently has a transitive `js-yaml` dependency, so
the lockfile may still contain `node_modules/js-yaml`; acceptance checks the root
dependency declaration and the isolated runtime, not a misleading global string
absence.

## 4. Deterministic installation test

Create `tests/skill-installation.test.js` with this boundary:

1. Create an OS temporary root and copy only `skills/drawio` to
   `<temp>/installed/drawio`.
2. Create a deliberately incompatible poison package at
   `<temp>/node_modules/js-yaml`. Node will resolve this nearer package before any
   user-home ancestor if production regresses to a bare import.
3. Write the issue's minimal YAML input outside the installed skill.
4. Spawn `process.execPath` against the copied `scripts/cli.js`, with cwd set to
   the temporary root and an environment copied from the process after deleting
   `NODE_PATH`.
5. Require exit status 0, an output file, and valid Draw.io XML containing a
   closed `mxGraphModel`.
6. Clean the temporary root in `finally`.

The poison dependency makes the test deterministic on Windows, where `%TEMP%`
often sits under a user profile that may contain `node_modules`. It also proves
relative ownership more strongly than clearing `NODE_PATH` alone.

The test runner should additionally assert that production source files do not
contain a mandatory bare `js-yaml` import. This prevents a future lazy route from
escaping coverage of the minimal CLI smoke.

## 5. Compatibility and safety

- Parser version remains 4.1.1; no YAML schema or formatting migration occurs.
- Existing tests for rejected `!!python/object` and `!!js/function` tags remain
  authoritative security gates.
- `loadAll(..., { schema: JSON_SCHEMA })` behavior in config adapters remains
  unchanged.
- Optional code/config parser dependencies remain lazy and may still return
  `OPTIONAL_DEPENDENCY_MISSING`; this task changes only the mandatory base parser.
- No SKILL.md, academic overlay, interface, schema, CLI option, or user-authored
  diagram format changes.

## 6. Packaging and evidence

The zip recipe consumes `git ls-files`, including staged new files. Before the
package gate, stage only the reviewed task allowlist so the new vendor artifacts
are present in `drawio.zip`. Verify the zip manifest contains the three
`vendor/js-yaml` files and no forbidden scratch, then execute the isolated smoke
from shipped skill bytes. Run `just clean-zip` afterward.

Deterministic local copy/zip evidence is sufficient for this task. Remote
`npx skills add`, release publication, tag creation, and issue closure remain
unexecuted rather than being reported as passes.

## 7. File allowlist

Expected production and test changes:

- `skills/drawio/scripts/vendor/js-yaml/{js-yaml.mjs,LICENSE.md,README.md}`
- `skills/drawio/scripts/dsl/spec-to-drawio.js`
- `skills/drawio/scripts/dsl/document-spec.js`
- `skills/drawio/scripts/adapters/config-common.js`
- `skills/drawio/scripts/runtime/artifacts.js`
- `skills/drawio/scripts/adapters/graph-drift.file.test.js`
- `tests/skill-installation.test.js`
- `tests/skill-metadata.test.js`
- `package.json`
- `package-lock.json`
- `skills/drawio/CHANGELOG.md`
- `CHANGELOG.md`
- `.trellis/spec/drawio-skill/index.md`
- `.trellis/spec/drawio-skill/skill-doc-and-release-contract.md`

Task artifacts and normal Trellis lifecycle files are also allowed. Any other
production path requires a documented return to planning.

## 8. Rollback

The fix is one coherent packaging unit. Rollback restores bare imports and the
root direct dependency, removes the vendor directory and isolated test, and
reverts changelog entries. There is no persisted data or format migration.
