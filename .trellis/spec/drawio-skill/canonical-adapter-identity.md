# Canonical Adapter And Stable Identity Contract

Executable contract for base-owned import adapters that need stable external
identity, declared/live matching, or drift comparison.

## 1. Scope / Trigger

- Trigger: adding or changing a code, config, declared-architecture, live
  snapshot, or drift adapter under `skills/drawio/scripts/adapters/`.
- The base `skills/drawio` package owns adapters, projection validation,
  canonical YAML, JavaScript ELK layout, rendering, and sidecars.
- `skills/drawio-academic-skills` may add publication checks only. It must not
  copy the adapter runtime, schemas, identity factory, or layout path.
- Simple Mermaid and CSV adapters may continue to emit a canonical spec
  directly when they do not need external identity or declared/live matching.

## 2. Signatures

```js
finalizeGraphProjection(candidate, { attributeAllowlist = {} })
projectGraphToSpec(finalizedProjection, { hash } = {})
normalizeIdentity(identity)
serializeIdentity(identity)
createRendererId(identity, { kind = 'node', hash } = {})
```

Domain factories are exported from `scripts/adapters/identity.js`:

```js
createTerraformIdentity(address)
createKubernetesIdentity({ scope, namespace, kind, name, namespaced })
createComposeIdentity({ project, service })
createComposeResourceIdentity({ project, kind, name })
createCodeIdentity({ language, modulePath })
createOpenApiIdentity({ method, path })
createOpenApiSchemaIdentity(name)
createCiIdentity({ provider, workflow, job })
createSqlIdentity({ dialect, schema, table })
createGroupIdentity({ domain, key })
createEdgeIdentity({ from, to, relation, discriminator })
```

Declared config adapter signatures, worker protocol, and error cases are
owned by [Config Importer Contract](./config-importers.md).

## 3. Contracts

The parser returns a `CanonicalGraphProjection v1` candidate with:

```text
version, source, nodes, edges, modules, diagnostics
```

- `source` contains only a safe relative locator plus adapter, domain, and
  `code|declared|live|drift` mode. Absolute checkout paths and capture time do
  not participate in identity.
- Nodes and modules carry `{ scheme, key }`; edges derive identity from
  endpoints, relation, and a source-derived discriminator.
- Attributes are shallow, domain-allowlisted comparison data. Raw source,
  style strings, environment values, credentials, and secret-bearing fields
  do not cross the projection boundary.
- Persisted edge keys are canonical JSON tuples. NUL is used only inside the
  renderer hash payload: `scheme + NUL + key`.
- Renderer IDs are `<n|e|m>-` plus the first 20 lowercase hex characters of
  SHA-256. Collision detection is mandatory; traversal-order suffixes are
  forbidden.
- Stable identity never defaults to display labels. Minimum keys are:
  Terraform resource address; Kubernetes scope/namespace/kind/name; Compose
  project/service; code language/project-relative POSIX module path; OpenAPI
  method/normalized path; CI provider/workflow/job; SQL dialect/schema/table.
- Declared and live adapters import the same factory export. Matching string
  logic must not be copied into either adapter.
- `projectGraphToSpec` performs semantic projection only. It does not lay out
  nodes, emit XML, invoke Desktop, or call Graphviz. Its output sets
  `meta.layout: hierarchical`; the existing vendored JavaScript ELK path owns
  layout.
- Canonical YAML and `.arch.json` retain sanitized identity and adapter
  provenance. Legacy specs without `meta.adapter` remain valid; when
  `meta.adapter` exists, every node, edge, and module requires identity.

## 4. Validation & Error Matrix

| Condition | Boundary | Error code / result |
| --- | --- | --- |
| Parser cannot read source | parser | `ADAPTER_PARSE` |
| Source construct has no supported projection | parser | `ADAPTER_UNSUPPORTED` |
| Unknown version, field, duplicate, dangling edge, unsafe attribute | finalizer | `PROJECTION_INVALID` |
| Ambiguous or unsafe identity input | identity factory | `IDENTITY_INVALID` |
| Distinct identities produce one renderer ID | projector | `IDENTITY_COLLISION` |
| Optional parser/provider is unavailable | optional wrapper | `OPTIONAL_DEPENDENCY_MISSING` |
| Declared/live schemes or versions cannot be compared | drift layer | `DRIFT_INCOMPATIBLE` |
| Provider, Desktop, Graphviz, or visual model not run | evidence | `missing evidence` |

Diagnostics are only for deterministic, non-fatal information. A condition
that changes identity, silently drops a node/edge, or makes matching
non-deterministic must fail instead of becoming a warning.

## 5. Good / Base / Bad Cases

- Good: Terraform declared and live adapters both call
  `createTerraformIdentity`, finalize their projections, compare full
  identities, then project the selected graph into canonical YAML.
- Base: a legacy Mermaid adapter emits a valid spec without `meta.adapter` or
  identity metadata and continues through the existing renderer unchanged.
- Bad: a live adapter matches containers to Compose services by label or
  container name, writes an absolute source path to `.arch.json`, or calls
  Graphviz to place nodes.

## 6. Tests Required

- Factory tests assert every domain key rule and rejection of wrong types,
  absolute/escaping paths, control characters, and ambiguous scope.
- Stability tests vary label, order, source locator, mode, and capture metadata
  while asserting identical renderer IDs for identical identities.
- Declared/live tests import and call the same factory export.
- Projection tests assert version, known fields, allowlists, sensitive keys,
  deterministic sorting, duplicate identity, referential integrity, parallel
  edge discriminator, and stable error codes.
- Collision tests inject a deterministic hash seam and assert
  `IDENTITY_COLLISION` without suffix fallback.
- Integration tests assert projection -> canonical spec -> `validateSpec` ->
  JavaScript ELK -> renderer -> `validateXml`, plus YAML and `.arch.json`
  identity/provenance round-trip.
- Run focused adapter tests first, then `npm test` and `just ci`. Deterministic
  structure/layout tests must never be reported as Desktop or visual-model
  execution.

## 7. Wrong vs Correct

Wrong:

```js
const id = `${resource.label}-${index}`
const placed = runDot(parsedGraph)
```

Correct:

```js
const identity = createTerraformIdentity(resource.address)
const projection = finalizeGraphProjection(candidate, { attributeAllowlist })
const spec = projectGraphToSpec(projection)
// The existing canonical pipeline applies JavaScript ELK after validateSpec.
```

## Scenario: Snapshot-Only Declared/Live Drift

### 1. Scope / Trigger

- Trigger: comparing a user-selected Terraform state/plan JSON, Docker inspect
  JSON, or Kubernetes live JSON projection against a declared projection.
- This scenario parses existing JSON only. Capture providers, provider CLI
  subprocesses, daemon/socket access, cluster/cloud access, and inherited
  credentials require separately approved children.

### 2. Signatures

```js
parseTerraformStateSnapshot(source, { locator })
parseDockerInspectSnapshot(source, { locator })
parseKubernetesLiveSnapshot(source, { scope, locator, kindScopes })
compareGraphProjections(baseline, observed, { baselineContext, observedContext })
createDriftProjection(report, baseline, observed, { locator })
projectDriftReportToSpec(report, baseline, observed, { locator, hash })
renderDriftGraph(report, baseline, observed, { locator, hash, elk })
```

### 3. Contracts

- Snapshot adapters return finalized `CanonicalGraphProjection v1` with
  `mode: live`; raw JSON is not copied into work artifacts.
- Declared/live adapters import the same identity input builder and attribute
  allowlist. Capture time, traversal order, display label, container ID/name,
  and Kubernetes pod UID never enter identity.
- Both comparison contexts are explicit safe logical strings and must match.
  They are checked but never persisted in reports or error messages.
- Report `version: 1` has `nodes`, `edges`, and per-owner/key `attributes`,
  each with deterministic `added/removed/changed/unchanged` buckets. Relation
  is part of edge identity, so a relation change is removed plus added.
- Drift projection labels carry `[ADDED]`, `[REMOVED]`, `[CHANGED: keys]`, or
  `[UNCHANGED]`. The canonical spec includes a text legend; removed edges are
  dashed. Color is secondary evidence only.
- Only allowlisted projected values reach the machine report. Canonical drift
  YAML contains status and changed key names, not raw snapshot payloads.
- The required path is finalized projection -> `projectGraphToSpec` ->
  `validateSpec` -> vendored JavaScript ELK -> renderer -> `validateXml`.

### 4. Validation & Error Matrix

| Condition | Result |
| --- | --- |
| Malformed/unsupported snapshot JSON | `ADAPTER_PARSE` / `ADAPTER_UNSUPPORTED` |
| Missing, unsafe, or unequal comparison context | `DRIFT_INCOMPATIBLE` without echoing values |
| Projection/report version or domain mismatch | `DRIFT_INCOMPATIBLE` |
| Duplicate node/edge identity | `IDENTITY_COLLISION` |
| JavaScript ELK does not apply or rendered XML is invalid | `PROJECTION_INVALID` |
| Provider CLI, Desktop, preview, or visual model not run | `missing evidence` |

### 5. Good / Base / Bad Cases

- Good: Compose declared services and saved Docker inspect JSON share
  project/service identities; replicas aggregate into one important attribute.
- Base: equal identity, label, edge relation, and attributes are all reported
  as unchanged in stable identity order.
- Bad: match by container name/label, persist raw env/Secret/state values, infer
  Terraform instance aggregation, or claim deterministic XML checks as a
  Desktop/model review.

### 6. Tests Required

- Valid/invalid/sensitive Terraform, Docker, and Kubernetes snapshot fixtures.
- Exact declared/live identity parity and ordering invariance.
- Node, edge, and attribute four-state tests; label and generic edge attribute
  changes; relation change as removed plus added.
- Context/version/domain/duplicate failures with sanitized diagnostics.
- File-backed report/spec/evidence equality plus sentinel scans across report,
  canonical spec, XML, and evidence manifest.
- Shared projector, `validateSpec`, actual vendored JS ELK, renderer, and
  `validateXml` execution; provider/Desktop/model remain separate evidence.

### 7. Wrong vs Correct

Wrong:

```js
const live = execSync(`docker inspect ${container}`)
const match = declared.nodes.find((node) => node.label === live.Name)
```

Correct:

```js
const observed = parseDockerInspectSnapshot(savedJson, { locator })
const report = compareGraphProjections(baseline, observed, {
  baselineContext: logicalContext,
  observedContext: logicalContext
})
const artifacts = await renderDriftGraph(report, baseline, observed)
```
