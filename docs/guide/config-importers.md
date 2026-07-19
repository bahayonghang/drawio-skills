# Config and IaC Importers (`/drawio config-import`)

Declared config importers normalize infrastructure and workflow sources into a `CanonicalGraphProjection v1`, then reuse the existing canonical YAML, JavaScript ELK layout, renderer, and XML validation path. They never execute provider CLIs, contact a cluster or database, call Graphviz, or write raw Draw.io style.

Use this route to turn declared Terraform, Kubernetes, Compose, SQL DDL, OpenAPI, GitHub Actions, or GitLab CI sources into an editable architecture diagram.

## Supported Inputs

| Source               | `--input-format` | Key options                               |
| -------------------- | ---------------- | ----------------------------------------- |
| Terraform (HCL)      | `terraform`      | `--module-address module.name`            |
| Kubernetes manifests | `kubernetes`     | `--scope <logical-scope>` (required)      |
| Docker Compose       | `compose`        | `--project <name>`                        |
| SQL DDL              | `sql`            | `--dialect postgres`                      |
| OpenAPI              | `openapi`        | —                                         |
| GitHub Actions       | `github-actions` | `--workflow <repo-relative-path>` (stdin) |
| GitLab CI            | `gitlab-ci`      | `--workflow <repo-relative-path>` (stdin) |

Kubernetes always requires a stable logical `--scope`. Compose accepts a top-level `name`; pass `--project` when a declared and a live source need an explicit shared override. For stdin CI input, pass `--workflow` with the repo-relative path.

## CLI

```bash
node skills/drawio/scripts/cli.js infra/main.tf output.drawio --input-format terraform --module-address module.app --validate
node skills/drawio/scripts/cli.js k8s/app.yaml output.drawio --input-format kubernetes --scope prod --validate
node skills/drawio/scripts/cli.js compose.yaml output.drawio --input-format compose --project shop --validate
node skills/drawio/scripts/cli.js db/schema.sql output.drawio --input-format sql --dialect postgres --validate
node skills/drawio/scripts/cli.js api/openapi.yaml output.drawio --input-format openapi --validate
node skills/drawio/scripts/cli.js .github/workflows/ci.yml output.drawio --input-format github-actions --validate
node skills/drawio/scripts/cli.js .gitlab-ci.yml output.drawio --input-format gitlab-ci --validate
```

Add `--export-spec` to write canonical YAML instead of rendering, and `--write-sidecars --sidecar-dir <dir>` to keep the `.spec.yaml` / `.arch.json` bundle in a work directory.

## Optional HCL and SQL Parser

Terraform and SQL need Python 3.9+ plus pinned parser packages:

```bash
python -m pip install -r skills/drawio/scripts/adapters/python/requirements.txt
```

| Package       | Version   | License | Use               |
| ------------- | --------- | ------- | ----------------- |
| `python-hcl2` | `8.1.2`   | MIT     | Terraform HCL AST |
| `sqlglot`     | `30.12.0` | MIT     | SQL DDL AST       |

The worker is optional and isolated: it reads bounded JSON from stdin, returns sanitized records on stdout, uses a fixed script with `shell: false`, and never returns raw HCL/SQL bodies. Missing Python or packages returns `OPTIONAL_DEPENDENCY_MISSING` for Terraform/SQL only — YAML, Mermaid, CSV, create, edit, and export keep working.

## Stable Identity

- **Terraform** — module-qualified managed-resource address; `references` and `depends-on` edges. Data/provider/local blocks are diagnostics.
- **Kubernetes** — scope/namespace/kind/name. Unknown CRD scope needs an explicit `kindScopes` override; Secret data never enters attributes.
- **Compose** — project/service plus separate named network/volume identities.
- **SQL** — dialect/schema/table; a foreign-key discriminator uses the constraint and column tuple.
- **OpenAPI** — uppercase method plus a case-preserving normalized path; summary and operationId are display attributes only.
- **CI** — provider/repo-relative workflow/job key; display names never identify a job.

Terraform, Kubernetes, and Compose export their identity builders and attribute allowlists so the [live snapshot and drift](./live-drift.md) route shares the same keys instead of reproducing string logic.

## Errors and Evidence Boundary

| Condition                                                          | Result                                |
| ------------------------------------------------------------------ | ------------------------------------- |
| Empty, oversized, malformed, recursive, or prototype-bearing input | `ADAPTER_PARSE`                       |
| Unknown Kubernetes kind scope or unsupported construct             | `ADAPTER_UNSUPPORTED`                 |
| Missing Python executable or pinned parser package                 | `OPTIONAL_DEPENDENCY_MISSING`         |
| Ambiguous Compose project                                          | `ADAPTER_PARSE`                       |
| SQL foreign-key target absent from the selected DDL                | `ADAPTER_UNSUPPORTED`                 |
| External K8s/Compose/OpenAPI/CI/Terraform reference                | explicit diagnostic, no dangling edge |

Deterministic fixtures, the worker command path, JavaScript ELK, and XML validation are command evidence. Provider CLI capture, Desktop preview, Graphviz comparison, large multi-module/multi-dialect corpora, and visual-model review remain `missing evidence` until run separately. Do not describe small fixtures as complete dialect support.

## Related

- [Canonical graph projection](/api/upstream-capability-map.md)
- [Live snapshots and drift](./live-drift.md)
- [Code relationship importers](./code-importers.md)
- [CLI Reference](./cli.md)
