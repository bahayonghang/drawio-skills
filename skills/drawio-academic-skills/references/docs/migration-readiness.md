# Migration Readiness

This note explains what is already backend-agnostic in the draw.io skill, what still depends on the current live provider, and how to approach a future official-provider migration without rewriting the whole skill.

## 1. What depends on offline bundle vs live backend?

### Offline bundle responsibilities

These should remain stable regardless of which live provider exists:

- YAML spec as the canonical editable representation
- CLI validation and regeneration
- `.drawio` + `.spec.yaml` + `.arch.json` sidecar workflow
- Mermaid and CSV normalization into YAML spec
- Academic, formula, theme, and edge-quality rules
- Replication color extraction and theme fallback rules

### Live backend responsibilities

These are optional enhancements only:

- Open a diagram in a browser or inline viewer
- Read current browser state back before further edits
- Apply incremental cell patches in a live editor
- Export from the live session
- Search an official shape index when exact stencils matter

## 2. Capability gaps across providers

| Provider | Good at | Missing |
|----------|---------|---------|
| Current next-ai live MCP | Real edit sessions, read-back, patching, export | Shape search, inline chat preview |
| Official Tool Server | Browser handoff from XML/CSV/Mermaid | Read-back, patching, export, inline preview, shape search |
| Official App Server | Inline preview and official shape search | Read-back, patching, export |

## 3. What does that mean today?

- Official references should be integrated now.
- Official Tool/App Server can be treated as **supplementary providers**, not as edit-session replacements.
- The current live provider must remain available for true live incremental editing until another provider offers equivalent `read_diagram_xml`, `patch_diagram_cells`, and `export_diagram_file` capabilities.

## 4. If we migrate later, what changes first?

Start at the provider-mapping layer, not the workflow layer.

1. Update the live-backend capability mapping in [mcp-tools.md](mcp-tools.md).
2. Update any install/setup surface that advertises optional live providers.
3. Keep `create`, `edit`, and `replicate` workflows unchanged unless the capability matrix changes.

## 5. What should not change during a future migration?

- YAML spec schema
- Sidecar trio (`.drawio`, `.spec.yaml`, `.arch.json`)
- CLI flags and local export behavior
- Academic / formula / replication validation rules
- Offline-first default routing

## 6. What would justify replacing the current live edit provider?

Only a provider with equivalent support for all of the following:

- `replace_diagram_xml`
- `read_diagram_xml`
- `patch_diagram_cells`
- `export_diagram_file`

`search_shape_catalog` and `render_inline_preview` are useful additions, but they do not by themselves replace a live edit backend.

## Related

- [Live Backend Reference](mcp-tools.md)
- [Official XML Reference Mirror](../official/xml-reference.md)
- [Official Style Reference Mirror](../official/style-reference.md)
