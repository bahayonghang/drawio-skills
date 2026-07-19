# Code Importer Contract

Executable contract for source dependency and inheritance adapters.

## 1. Scope / Trigger

- Trigger: changing Python imports/classes, JavaScript/TypeScript ESM, Go
  package import, Rust module-use adapters, code project scanning, or their CLI
  directory routes.
- Adapters live in `skills/drawio/scripts/adapters/`, return finalized
  `CanonicalGraphProjection v1`, and never own layout or XML.

## 2. Signatures

```js
parsePythonImportsProject(projectRoot, { locator, runParser })
parsePythonClassesProject(projectRoot, { locator, runParser })
parseJavaScriptImportsProject(projectRoot, { locator, parseModule })
parseGoImportsProject(projectRoot, { locator, parseFile })
parseRustImportsProject(projectRoot, { locator, parseFile })
runOptionalPythonCodeParser(request, options)
```

```text
<project-dir> --input-format python-imports|python-classes|js-imports|go-imports|rust-imports
```

## 3. Contracts

- Scan sorted project-relative POSIX paths, do not follow symlinks, skip hidden
  and cache/vendor/build directories, and enforce 500 files, 1 MiB per file,
  and 4 MiB aggregate selected source.
- Module identity is `createCodeIdentity({ language, modulePath })`; Python
  class identity is `createCodeClassIdentity({ moduleIdentity,
  qualifiedClassName })`. Root, label, and traversal order never enter keys.
- Python 3.11+ stdlib `ast` uses a separate fixed worker. The config worker
  remains restricted to `terraform/sql`. Both share bounded JSON, fixed cwd,
  minimal env, timeout/output limits, and `shell: false` process mechanics.
- JS/TS loads exact `es-module-lexer@2.3.1`; Go/Rust load exact peer-compatible
  `tree-sitter@0.21.1`, `tree-sitter-go@0.23.4`, and
  `tree-sitter-rust@0.23.0`. All are optional MIT dependencies loaded only by
  their routes. Tree-sitter native bindings require Node 20 install evidence.
- Go/Rust are source languages only. Never invoke or probe `go`, `cargo`,
  `rustc`, Graphviz, `dot`, or `tred`.
- Output flows through `projectGraphToSpec`, `validateSpec`, JavaScript ELK,
  renderer, and `validateXml`.

## 4. Validation & Error Matrix

| Condition | Result |
| --- | --- |
| Missing project, non-directory, invalid UTF-8, symlink root, or capacity overflow | `ADAPTER_PARSE` |
| Missing Python/Node parser binding | `OPTIONAL_DEPENDENCY_MISSING` for that route |
| Parser syntax error | `ADAPTER_PARSE` with safe relative path and line/column when available |
| Unresolved relative/internal reference or ambiguous module/class | `ADAPTER_UNSUPPORTED` |
| External, stdlib, or non-relative dependency | aggregate diagnostic, no target node |
| CJS, TS alias/monorepo, Go workspace/replace, Rust workspace/multiple roots/cfg/inline/path/ambiguous edition | unsupported or explicit diagnostic; never claimed as supported |
| Desktop, Graphviz, visual model, conditional build, or large corpus not run | `missing evidence` |

## 5. Good / Base / Bad Cases

- Good: a Go route extracts `import_spec` AST nodes in Node, resolves only the
  selected `go.mod` module, finalizes projection, then delegates layout.
- Base: importing adapter exports or using YAML works without loading any code
  parser package or Python worker.
- Bad: regex-scanning imports, resolving TS aliases by guesswork, running a
  language toolchain, expanding the config worker allowlist, or emitting XML.

## 6. Tests Required

- Per-language unit fixtures assert direct edges, identity, external ignores,
  syntax/unsupported errors, and deterministic finalization.
- Worker tests assert fixed script, `-I`, `shell: false`, timeout, stdout bound,
  cwd, env allowlist, missing Python, malformed JSON, and safe location context.
- Opt-in real-parser integration runs Python AST, es-module-lexer, and both
  Tree-sitter grammars; injected seams do not replace this evidence.
- CLI tests assert directory routing happens before file reads and rejects
  stdin. Pipeline tests assert projection -> spec -> validation -> JS ELK ->
  renderer -> valid XML.
- Run focused tests, `npm test`, `just ci`, and docs build after public docs changes.

## 7. Wrong vs Correct

Wrong:

```js
const imports = source.match(/import .+ from/g)
execFileSync('go', ['list', './...'])
```

Correct:

```js
const projection = await parseGoImportsProject(projectRoot)
const spec = projectGraphToSpec(projection)
// Existing validation, JavaScript ELK, renderer, and XML validation follow.
```
