# Live Snapshots and Architecture Drift (`/drawio live-drift`)

Use this route only for JSON snapshots the user explicitly selected. It parses Terraform state/plan JSON, Docker inspect JSON, or Kubernetes live JSON in memory, projects each into a `CanonicalGraphProjection v1` with `mode: live`, and can compare a live projection against a declared one to render drift. It does not run `terraform`, `docker`, or `kubectl`, contact a daemon, cluster, or cloud, inherit provider credentials, or copy raw snapshots into a work directory.

## Snapshot Adapters

| Source                    | Adapter                       | Identity                                      |
| ------------------------- | ----------------------------- | --------------------------------------------- |
| Terraform state/plan JSON | `parseTerraformStateSnapshot` | exact resource instance addresses             |
| Docker inspect JSON       | `parseDockerInspectSnapshot`  | Compose project/service (aggregated replicas) |
| Kubernetes live JSON      | `parseKubernetesLiveSnapshot` | scope/namespace/kind/name                     |

- **Terraform** keeps exact resource instance addresses. Declared unexpanded addresses and `count`/`for_each` instances remain different identities.
- **Docker** accepts only containers with explicit Compose project/service labels and aggregates replicas by project/service; standalone containers are excluded. Container ID/name, env, unrelated labels, credentials, and mount paths are never projected. Network/volume parity remains `missing evidence`.
- **Kubernetes** live JSON reuses the same parser core, identity builder, kind-scope rules, and attribute allowlist as declared manifests. Secret payloads, annotations, managed fields, and literal env values are excluded.

Declared and live projections use the same identity factory and allowlist, so display label, capture time, input order, container instance name, and pod UID do not identify an entity.

## Compare and Render Drift

```js
import {
  parseDockerInspectSnapshot,
  compareGraphProjections,
  renderDriftGraph
} from "./skills/drawio/scripts/adapters/index.js"

const report = compareGraphProjections(declared, live, {
  baselineContext: "shop-production",
  observedContext: "shop-production"
})
const { spec, xml } = await renderDriftGraph(report, declared, live)
```

Both logical contexts are mandatory and must match. Projection/report version, domain, context, or identity ambiguity fails explicitly with `DRIFT_INCOMPATIBLE` or `IDENTITY_COLLISION`; the comparator never falls back to label matching.

The versioned report has node, edge, and allowlisted-attribute `added`/`removed`/`changed`/`unchanged` buckets in deterministic identity order. A label change is a display change on the same identity. Edge relation is part of identity, so a relation change is a removal plus an addition. Drift canonical YAML carries status text and changed key names, includes a legend, and renders removed edges as dashed — color is not the only status carrier.

## Evidence Boundary

A recorded Compose drift case lives under `skills/drawio/references/examples/importers/live/` (`compose-drift-report.json`, `compose-drift.spec.yaml`, `compose-drift-evidence.json`). It proves deterministic parsing, comparison, JavaScript ELK, rendering, and XML validation. It does not prove provider CLI capture, a real environment, Desktop preview, or visual-model review; those remain `missing evidence`.

## Related

- [Config and IaC importers](./config-importers.md)
- [Canonical graph projection](/api/upstream-capability-map.md)
- [CLI Reference](./cli.md)
