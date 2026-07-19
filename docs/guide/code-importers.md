# Code Relationship Importers (`/drawio code-import`)

Code importers turn a bounded local project directory into a `CanonicalGraphProjection v1`, then reuse canonical YAML validation, JavaScript ELK, rendering, and XML validation. They do not execute source code, invoke Graphviz, or call Python package managers, `go`, `cargo`, or `rustc`.

Use this route to render module imports or class inheritance from a local Python, JavaScript/TypeScript, Go, or Rust project.

## Supported Inputs

| Language                  | `--input-format` | Extracts                                                         |
| ------------------------- | ---------------- | ---------------------------------------------------------------- |
| Python imports            | `python-imports` | intra-project imports                                            |
| Python classes            | `python-classes` | top-level class inheritance                                      |
| JavaScript/TypeScript ESM | `js-imports`     | static, side-effect, export-from, string-literal dynamic imports |
| Go packages               | `go-imports`     | `import_spec` package edges                                      |
| Rust modules              | `rust-imports`   | `crate`/`self`/`super` use trees                                 |

The input must be a **local directory**; stdin is not supported. Scanning is sorted, does not follow symlinks, skips hidden and cache/vendor/build directories, and is bounded to **500 files, 1 MiB per file, and 4 MiB of selected source**.

## CLI

```bash
node skills/drawio/scripts/cli.js src/python output.drawio --input-format python-imports --validate
node skills/drawio/scripts/cli.js src/python output.drawio --input-format python-classes --validate
node skills/drawio/scripts/cli.js src/web output.drawio --input-format js-imports --validate
node skills/drawio/scripts/cli.js src/go output.drawio --input-format go-imports --validate
node skills/drawio/scripts/cli.js src/rust output.drawio --input-format rust-imports --validate
```

## Parser Scope

- **Python 3.11+** uses an isolated stdlib `ast` worker for imports and top-level class inheritance, with a fixed script, bounded JSON stdin/stdout, a 10-second timeout, `shell: false`, a fixed cwd, and a minimal environment.
- **JavaScript/TypeScript** uses exact-pinned `es-module-lexer@2.3.1`.
- **Go** uses exact-pinned `tree-sitter@0.21.1` and `tree-sitter-go@0.23.4`; a minimal `go.mod` grammar supplies one module path — no Go toolchain is used.
- **Rust** uses exact-pinned `tree-sitter@0.21.1` and `tree-sitter-rust@0.23.0`; no Rust toolchain is used.

The Node parser packages are exact-pinned optional dependencies, loaded only by their routes. Missing bindings return `OPTIONAL_DEPENDENCY_MISSING`. They are MIT licensed; the Tree-sitter packages ship native bindings and need Node 20 install coverage.

## Stable Identity and Limitations

Module identity is language plus canonical project-relative POSIX path. Go package identity uses the package directory (`_root` for the root). Python class identity extends its module identity with the top-level qualified class name. Absolute checkout roots, labels, and traversal order never identify nodes.

Not resolved (fails or reports an explicit diagnostic — never silently claimed as supported):

- CommonJS, TypeScript path aliases, and monorepo/package resolution.
- Go workspace and `replace` semantics.
- Rust workspace, multiple crate roots, `cfg`, `#[path]`, inline modules, and edition-ambiguous bare paths.

Unsupported internal references fail instead of silently dropping an edge; ignored external/stdlib/non-relative dependencies produce aggregate diagnostics.

## Evidence Boundary

Per-language fixtures, worker/parser command paths, JavaScript ELK, and XML validation are command evidence. Large repository corpora, Desktop, visual model, Graphviz, and conditional-build coverage remain `missing evidence`.

## Related

- [Config and IaC importers](./config-importers.md)
- [Canonical graph projection](/api/upstream-capability-map.md)
- [CLI Reference](./cli.md)
