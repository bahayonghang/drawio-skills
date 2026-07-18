# Saved Live Snapshots And Projection Drift

Use this route only for JSON snapshots the user explicitly selected. It parses
Terraform state/plan JSON, Docker inspect JSON, or Kubernetes live JSON in
memory; it does not run `terraform`, `docker`, or `kubectl`, contact a daemon,
cluster, or cloud, inherit provider credentials, or copy raw snapshots into a
work directory.

## Snapshot Adapters

```js
import {
  parseTerraformStateSnapshot,
  parseDockerInspectSnapshot,
  parseKubernetesLiveSnapshot
} from './scripts/adapters/index.js'
```

- Terraform keeps exact resource instance addresses. Declared unexpanded
  addresses and `count`/`for_each` instances remain different identities.
- Docker accepts only containers with explicit Compose project/service labels,
  aggregates replicas by project/service, and excludes standalone containers.
  Container ID/name, env, unrelated labels, credentials, and mount paths are
  never projected. Network/volume parity remains `missing evidence`.
- Kubernetes live JSON calls the same parser core, identity builder, kind-scope
  rules, and attribute allowlist as declared manifests. Secret payloads,
  annotations, managed fields, and literal env values are excluded.

Each adapter returns finalized `CanonicalGraphProjection v1` with `mode: live`.
Declared and live projections use the same identity factory and allowlist;
display label, capture time, input order, container instance name, and pod UID
do not identify an entity.

## Compare And Render

```js
import { compareGraphProjections, renderDriftGraph } from './scripts/adapters/index.js'

const report = compareGraphProjections(declared, live, {
  baselineContext: 'shop-production',
  observedContext: 'shop-production'
})
const { spec, xml } = await renderDriftGraph(report, declared, live)
```

Both logical contexts are mandatory and must match. Projection/report version,
domain, context, or identity ambiguity fails explicitly with
`DRIFT_INCOMPATIBLE` or `IDENTITY_COLLISION`; the comparator never falls back
to label matching.

The versioned report has node, edge, and allowlisted attribute
`added/removed/changed/unchanged` buckets in deterministic identity order.
Label changes are display changes on the same identity. Edge relation is part
of identity, so a relation change is removed plus added.

Drift canonical YAML carries status text and changed key names, includes a
legend, and renders removed edges as dashed. Color is not the only status
carrier. The runtime always uses the shared projector, `validateSpec`, vendored
JavaScript ELK, canonical renderer, and `validateXml`; adapters never lay out
nodes or write XML.

## Evidence Boundary

The recorded Compose case is under `references/examples/importers/live/`:

- `compose-drift-report.json` is the sanitized machine report;
- `compose-drift.spec.yaml` is the editable canonical source;
- `compose-drift-evidence.json` records stable renderer IDs and stopping rules.

The fixture proves deterministic parsing, comparison, JS ELK, rendering, and
XML validation. It does not prove provider CLI capture, a real environment,
Desktop preview, or visual-model review; those remain `missing evidence`.
