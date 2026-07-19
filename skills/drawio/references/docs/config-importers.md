# Declared Config Importers

Declared config importers normalize infrastructure and workflow sources into
`CanonicalGraphProjection v1`, then use the existing canonical YAML,
JavaScript ELK, renderer, and XML validation path. They do not execute provider
CLIs, contact a cluster or database, call Graphviz, or write raw Draw.io style.

## CLI

```powershell
node scripts/cli.js infra/main.tf output.drawio --input-format terraform --module-address module.app --validate
node scripts/cli.js k8s/app.yaml output.drawio --input-format kubernetes --scope prod --validate
node scripts/cli.js compose.yaml output.drawio --input-format compose --project shop --validate
node scripts/cli.js db/schema.sql output.drawio --input-format sql --dialect postgres --validate
node scripts/cli.js api/openapi.yaml output.drawio --input-format openapi --validate
node scripts/cli.js .github/workflows/ci.yml output.drawio --input-format github-actions --validate
node scripts/cli.js .gitlab-ci.yml output.drawio --input-format gitlab-ci --validate
```

For stdin CI input, pass `--workflow <repo-relative-path>`. Kubernetes always
requires a stable logical `--scope`. Compose accepts top-level `name`; use
`--project` when declared and live sources need an explicit shared override.

## Optional HCL And SQL Parser

Terraform and SQL need Python 3.9+ plus pinned parser packages:

```powershell
python -m pip install -r scripts/adapters/python/requirements.txt
```

The worker is optional and isolated. Missing Python or packages returns
`OPTIONAL_DEPENDENCY_MISSING` for Terraform/SQL without preventing other CLI
formats from loading. The worker reads bounded JSON from stdin, returns
sanitized records on stdout, and never returns raw HCL/SQL bodies.

Current pins and licenses:

| Package | Version | License | Use |
| --- | --- | --- | --- |
| `python-hcl2` | `8.1.2` | MIT | Terraform HCL AST |
| `sqlglot` | `30.12.0` | MIT | SQL DDL AST |

Large multi-module HCL and multi-dialect SQL corpora remain `missing evidence`
until executed. Do not describe small fixtures as complete dialect support.

## Stable Identity And Relations

- Terraform: module-qualified managed-resource address; `references` and
  `depends-on` edges. Data/provider/local blocks are diagnostics.
- Kubernetes: scope/namespace/kind/name. Unknown CRD scope needs an explicit
  `kindScopes` API override; Secret data never enters attributes.
- Compose: project/service plus separate named network/volume identities.
- SQL: dialect/schema/table; FK discriminator uses constraint and column tuple.
- OpenAPI: uppercase method plus case-preserving normalized path; summary and
  operationId are display/comparison attributes only.
- CI: provider/repo-relative workflow/job key; display names never identify a
  job.

Terraform, Kubernetes, and Compose export shared identity input builders and
important attribute allowlists. Live adapters must import these exports rather
than reproduce their string logic.

## Evidence Boundary

Deterministic fixtures, worker commands, JavaScript ELK, and XML validation are
command evidence. Provider CLI, Desktop, Graphviz comparison, large corpora,
and visual-model execution remain independent evidence states.
