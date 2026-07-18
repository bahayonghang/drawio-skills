# Config Importer Contract

Executable contract for Terraform, Kubernetes, Compose, SQL DDL, OpenAPI,
GitHub Actions, and GitLab CI declared-architecture adapters.

## 1. Scope / Trigger

- Trigger: adding or changing a declared config adapter, CLI input format,
  shared identity input builder, important attribute allowlist, or optional
  parser worker.
- All adapters live under `skills/drawio/scripts/adapters/` and emit finalized
  `CanonicalGraphProjection v1`. They never perform layout or emit XML.
- The base skill owns this runtime. The academic overlay must not copy it.

## 2. Signatures

```js
parseTerraformConfig(source, { locator, moduleAddress, runParser })
parseKubernetesManifests(source, { scope, locator, kindScopes })
parseComposeConfig(source, { project, locator })
parseSqlDdl(source, { dialect, defaultSchema, locator, runParser })
parseOpenApiDocument(source, { locator })
parseCiWorkflow(source, { provider, workflow })
runOptionalPythonParser(request, { pythonCommand, timeoutMs, maxOutputBytes, spawn })
```

CLI signatures:

```text
--input-format terraform [--module-address module.name]
--input-format kubernetes --scope <logical-scope>
--input-format compose [--project <name>]
--input-format sql [--dialect postgres]
--input-format openapi
--input-format github-actions|gitlab-ci [--workflow <repo-relative-path>]
```

## 3. Contracts

- YAML/JSON adapters use the shared structured decoder with `js-yaml`
  `JSON_SCHEMA`, forbidden prototype keys, bounded depth/entries, and a 1 MiB
  source limit.
- Terraform and SQL use the fixed Python worker protocol. Request fields are
  `adapter`, `source`, and only adapter-specific scalar options. Responses are
  `{ ok: true, result }` or `{ ok: false, code, message }`; stderr and raw
  source never enter projection diagnostics.
- The worker pins `python-hcl2==8.1.2` and `sqlglot==30.12.0`, requires Python
  3.9+, reads stdin only, and writes stdout only. Node invokes a fixed script
  with an argument array, `shell: false`, a bounded timeout/output, fixed cwd,
  and a minimal environment allowlist.
- Missing Python packages affect Terraform/SQL only. Importing
  `adapters/index.js` and using YAML, Mermaid, CSV, create, edit, or export must
  continue to work.
- Terraform, Kubernetes, and Compose export their identity input builders and
  attribute allowlists for the live/drift child. Consumers import these
  exports instead of rebuilding keys.
- Adapter output always flows through `projectGraphToSpec`, `validateSpec`,
  JavaScript ELK, the canonical renderer, and `validateXml`.

## 4. Validation & Error Matrix

| Condition | Result |
| --- | --- |
| Empty, oversized, malformed, recursive, or prototype-bearing input | `ADAPTER_PARSE` |
| Unknown Kubernetes kind scope or unsupported source construct | `ADAPTER_UNSUPPORTED` |
| Missing Python executable or pinned parser package | `OPTIONAL_DEPENDENCY_MISSING` |
| Worker timeout, non-zero protocol failure, malformed/oversized output | `ADAPTER_PARSE` |
| Ambiguous Compose project | `ADAPTER_PARSE` |
| External K8s/Compose/OpenAPI/CI/Terraform reference | explicit diagnostic, no dangling edge |
| SQL foreign key target absent from selected DDL | `ADAPTER_UNSUPPORTED` |
| Provider CLI, Desktop, Graphviz, corpus, or visual model not run | `missing evidence` |

## 5. Good / Base / Bad Cases

- Good: declared Kubernetes and future live Kubernetes both call
  `buildKubernetesIdentityInput`, then the shared foundation factory.
- Base: Compose with top-level `name` and two services produces service
  identities and a `depends-on` edge without loading Python.
- Bad: matching CI jobs by display `name`, deriving Compose project from a
  mutable cwd without a diagnostic, emitting Secret data, or passing HCL/SQL
  source through projection attributes.

## 6. Tests Required

- Per-domain tests cover identity stability, important attributes, relations,
  external references, duplicates, and unsafe input.
- Worker unit tests inject process results for missing, timeout, non-zero,
  malformed JSON, and output overflow.
- Worker integration tests use the pinned real packages and assert HCL module
  qualification plus SQL named foreign keys.
- Pipeline tests assert each projection passes canonical validation,
  JavaScript ELK, renderer, and XML validation without Graphviz.
- CLI tests assert structured routes work and parser absence stays isolated.

## 7. Wrong vs Correct

Wrong:

```js
const id = `${workflow.name}/${job.name}`
const parsed = exec(`python parser.py ${userPath}`)
```

Correct:

```js
const identity = createCiIdentity({ provider, workflow, job: jobKey })
const records = runOptionalPythonParser({ adapter: 'sql', source, dialect })
```
