# Draw.io Skill Spec

Engineering contracts for modifying `skills/drawio` (the YAML-first draw.io base skill).

| Doc                                                                 | Purpose                                                                                                                              | When to Use                                                         |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| [Canonical Adapter & Stable Identity Contract](./canonical-adapter-identity.md) | Versioned graph projection, shared identity factories, projector boundary, error/evidence rules, and JS ELK ownership | Adding code/config/live/drift adapters or identity metadata |
| [Config Importer Contract](./config-importers.md)                    | Structured config adapters, optional Python worker protocol, shared declared/live inputs, CLI routes, and error matrix | Adding Terraform/Kubernetes/Compose/SQL/OpenAPI/CI imports |
| [Semantic Type Extension Guide](./semantic-types.md)                | Touchpoint checklist for adding node/edge semantic types; silent theme-fallback pitfall; verification recipe                         | Adding or modifying node/edge types, themes, or connector semantics |
| [Skill Doc & Release Contract](./skill-doc-and-release-contract.md) | Test-pinned SKILL.md wording (assertion map, proximity windows, academic whitelist); zip == git ls-files; per-assertion eval records | Editing SKILL.md/references wording, packaging, or eval evidence    |
