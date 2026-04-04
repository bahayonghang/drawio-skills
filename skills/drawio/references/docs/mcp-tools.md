# Live Backend Reference

This document describes the optional live backends that can enhance the draw.io skill. The core skill is still offline-first: YAML spec -> CLI -> `.drawio` + sidecars.

The important rule is: **reason in capabilities first, provider names second**. Workflows should ask "which live capabilities exist?" before asking "which provider is installed?".

## Capability Vocabulary

| Capability | Meaning | Typical Use |
|-----------|---------|-------------|
| `replace_diagram_xml` | Open or replace a diagram using full XML | Browser preview, live session bootstrap, inline preview |
| `read_diagram_xml` | Read the latest XML back from the live editor | Preserve manual edits before further changes |
| `patch_diagram_cells` | Apply cell-level add/update/delete operations | Incremental live editing |
| `export_diagram_file` | Export `.drawio`, `.png`, or `.svg` from the live editor | Live-session file export |
| `search_shape_catalog` | Search an official shape/style index | Stencil-heavy cloud/network/P&ID diagrams |
| `render_inline_preview` | Render the diagram inline in chat | Visual review without opening a new tab |

## Provider Matrix

| Provider | `replace_diagram_xml` | `read_diagram_xml` | `patch_diagram_cells` | `export_diagram_file` | `search_shape_catalog` | `render_inline_preview` |
|----------|-----------------------|--------------------|-----------------------|-----------------------|------------------------|-------------------------|
| Current next-ai live MCP | Yes | Yes | Yes | Yes | No | No |
| Official Tool Server (`@drawio/mcp`) | Yes | No | No | No | No | No |
| Official App Server (`mcp.draw.io`) | Yes | No | No | No | Yes | Yes |

## Current Routing Rules

1. Default to offline-first, even when a live provider is available.
2. Use a live backend only when the user explicitly wants browser or inline refinement, or when a workflow requires a capability that is only available live.
3. **Incremental live edit requires both `read_diagram_xml` and `patch_diagram_cells`.**
   - If either capability is missing, do not attempt live edit.
   - Instead: import `.drawio` -> generate `.spec.yaml` / `.arch.json` -> edit the YAML spec -> regenerate outputs.
4. `search_shape_catalog` is optional guidance, not a hard dependency.
   - If present, use it for AWS/Azure/GCP/Cisco/Kubernetes/P&ID/electrical diagrams when exact shapes matter.
   - If absent, fall back to known design-system icons or semantic shapes instead of blocking the task.
5. `render_inline_preview` improves review loops but does not replace edit-session capabilities.

## Provider-Specific Tool Mapping

### Current next-ai live MCP

| Tool | Capability |
|------|------------|
| `start_session` | Session bootstrap only |
| `create_new_diagram` | `replace_diagram_xml` |
| `get_diagram` | `read_diagram_xml` |
| `edit_diagram` | `patch_diagram_cells` |
| `export_diagram` | `export_diagram_file` |

### Official Tool Server

| Tool | Capability |
|------|------------|
| `open_drawio_xml` | `replace_diagram_xml` |
| `open_drawio_csv` | Convenience import path, not a live-edit contract |
| `open_drawio_mermaid` | Convenience import path, not a live-edit contract |

### Official App Server

| Tool | Capability |
|------|------------|
| `create_diagram` | `replace_diagram_xml`, `render_inline_preview` |
| `search_shapes` | `search_shape_catalog` |

## Practical Guidance

- If the user says "open this in draw.io" or wants a quick browser handoff, `replace_diagram_xml` is enough.
- If the user wants "change the current live diagram without losing my manual edits", require `read_diagram_xml + patch_diagram_cells`.
- If the user wants cloud or network icons, check whether `search_shape_catalog` exists. If not, continue with documented icon mappings and semantic fallbacks.
- If the user wants review inside the chat instead of a new tab, `render_inline_preview` helps, but it is still only a preview path.

## Related

- [Migration Readiness](migration-readiness.md)
- [Stencil Library Guide](stencil-library-guide.md)
- [Official XML Reference Mirror](../official/xml-reference.md)
- [Official Style Reference Mirror](../official/style-reference.md)
