# Canonical Graph Projection

Use `CanonicalGraphProjection v1` for adapters that need stable external identity, important comparison attributes, or declared/live matching. Simple Mermaid and CSV adapters may continue returning the canonical YAML spec directly.

For Terraform, Kubernetes, Compose, SQL DDL, OpenAPI, and CI parser routes,
see [Declared Config Importers](./config-importers.md).

## Boundary

```text
untrusted source
  -> parser-owned raw projection candidate
  -> finalizeGraphProjection
  -> projectGraphToSpec
  -> validateSpec
  -> vendored JavaScript ELK
  -> canonical renderer and validateXml
```

Parsers only extract structure. They do not place nodes, emit Draw.io XML, invoke Desktop, or call Graphviz. `graph-projection.schema.json` describes the finalized projection written after validation and identity enrichment.

## Stable Identity

Each node and module carries `{ scheme, key }`. Edges receive an identity derived from their endpoint identities, relation, and stable discriminator. The shared factory owns normalization for Terraform, Kubernetes, Compose, code modules, OpenAPI operations, CI jobs, SQL tables, groups, and edges.

Canonical renderer IDs are deterministic SHA-256 projections of `scheme + NUL + key`. They match the existing YAML ID pattern but do not replace the full identity. Display labels, input order, absolute checkout paths, capture timestamps, styles, and mutable runtime instance names do not participate.

Parallel edges with the same endpoints and relation require a source-derived discriminator. Never add traversal-order suffixes and never use a label as the default match key.

## Projection Contract

A finalized projection contains:

- `version: 1`;
- relative, sanitized `source` provenance;
- identity-keyed `nodes`, `edges`, and `modules`;
- allowlisted shallow `attributes` without secrets, raw source blocks, environment values, or absolute paths;
- non-fatal `info` or `warning` diagnostics.

Unknown versions, duplicate identities, dangling edges, raw Draw.io styles, non-allowlisted attributes, sensitive fields, and ambiguous parallel edges fail explicitly. Reusable modules throw stable error codes rather than exiting the process.

## Canonical YAML And Sidecars

`projectGraphToSpec` keeps full identity metadata on canonical nodes, edges, and modules while assigning renderer-safe IDs. `meta.adapter` records the projection version and sanitized source provenance. The same fields survive `.spec.yaml` and `.arch.json` round-trips; raw projection attributes are deliberately excluded from `.arch.json`.

Legacy YAML without `meta.adapter` remains valid and does not require identity metadata. When `meta.adapter` is present, every canonical node, edge, and module must retain its identity.

## Layout And Evidence

Set `meta.layout: hierarchical` and use the vendored JavaScript ELK pre-pass. Graphviz `dot` and `tred` are not default dependencies. A future optional Graphviz path requires a separate evidence-backed design.

Deterministic schema, identity, ELK, and XML checks are command evidence. They do not count as Desktop or visual-model execution; unavailable provider/model runs remain `missing evidence`.
