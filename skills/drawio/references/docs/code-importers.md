# Code Importers

Code importers turn a bounded local project directory into a finalized
`CanonicalGraphProjection v1`, then use canonical YAML validation, JavaScript
ELK, rendering, and XML validation. They do not execute source code, invoke
Graphviz, or call Python package managers, `go`, `cargo`, or `rustc`.

## CLI

```powershell
node scripts/cli.js src/python output.drawio --input-format python-imports --validate
node scripts/cli.js src/python output.drawio --input-format python-classes --validate
node scripts/cli.js src/web output.drawio --input-format js-imports --validate
node scripts/cli.js src/go output.drawio --input-format go-imports --validate
node scripts/cli.js src/rust output.drawio --input-format rust-imports --validate
```

The input must be a local directory. Stdin is not supported. Scanning is
sorted, does not follow symlinks, skips cache/vendor/build directories, and is
bounded to 500 files, 1 MiB per file, and 4 MiB of selected source.

## Parser Scope

- Python 3.11+ uses an isolated stdlib `ast` worker for imports and top-level
  class inheritance. It uses a fixed script, bounded JSON stdin/stdout, a
  10-second timeout, `shell: false`, fixed cwd, and a minimal environment.
- JavaScript/TypeScript uses exact-pinned `es-module-lexer@2.3.1` for ESM
  static, side-effect, export-from, and string-literal dynamic imports.
- Go uses exact-pinned `tree-sitter@0.21.1` and
  `tree-sitter-go@0.23.4` for `import_spec` nodes. A minimal `go.mod` grammar
  supplies one module path; no Go toolchain is used.
- Rust uses exact-pinned `tree-sitter@0.21.1` and
  `tree-sitter-rust@0.23.0` for `crate/self/super` use trees. No Rust
  toolchain is used.

The Node parser packages are exact-pinned optional dependencies and are loaded
only by their routes. Missing bindings return `OPTIONAL_DEPENDENCY_MISSING`.
They are MIT licensed; Tree-sitter packages include native bindings and need
Node 20 install coverage.

## Stable Identity And Limitations

Module identity is language plus canonical project-relative POSIX path. Go
package identity uses the package directory (`_root` for root). Python class
identity extends its module identity with the top-level qualified class name.
Absolute checkout roots, labels, and traversal order never identify nodes.

CJS, TypeScript path aliases and monorepo/package resolution, Go workspace and
replace semantics, and Rust workspace, multiple crate roots, cfg, `#[path]`,
inline modules, and edition-ambiguous bare paths are not resolved. Unsupported internal references
fail instead of silently dropping an edge; ignored non-relative dependencies
produce aggregate diagnostics. Large repository corpora, Desktop, visual
model, Graphviz, and conditional-build evidence remain `missing evidence`.
