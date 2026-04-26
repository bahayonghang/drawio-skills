# Workflow: /drawio edit

Edit existing diagrams with natural-language modifications while preserving design-system consistency and explicit live-backend fallback rules.

## Trigger

- **Command**: `/drawio edit ...`
- **Keywords**: `edit`, `modify`, `update`, `change`, `编辑`, `修改`

## Live Capability Gate

Incremental live edit is allowed only when the active provider supports **both**:

- `read_diagram_xml`
- `patch_diagram_cells`

If either capability is missing, do **not** attempt to edit the browser state directly. Import the `.drawio` file into a YAML bundle first, then regenerate offline.

## Procedure

```text
Step 1: Identify Target
├── Option A: Existing offline bundle (.drawio + .spec.yaml)
│   └── Preferred path when the skill created the original diagram
├── Option B: Existing .drawio file without sidecar
│   └── Import to YAML spec first, then regenerate
├── Option C: Current live session
│   └── Only when the active provider has `read_diagram_xml + patch_diagram_cells`
└── Option D: Raw XML provided inline
    └── Treat as expert-mode patch input, usually normalize to offline bundle after the first edit

Step 2: Choose Edit Mode
├── Sidecar exists -> edit YAML spec, regenerate .drawio, keep sidecars in sync
├── No sidecar -> import .drawio to YAML spec bundle, then edit spec and regenerate
├── Live session + required capabilities -> read current XML, patch incrementally, export if needed
└── Live provider lacks required capabilities -> treat it as preview only and return to offline import/regenerate

Step 3: Understand Current State
├── Offline sidecar path -> read .spec.yaml and .arch.json first
├── Import path -> run CLI import, then read .spec.yaml and .arch.json
├── Live path -> read current browser XML before planning edits
└── Detect current theme/profile/layout before applying changes

Step 4: Parse Edit Instructions
├── Add operations (new nodes/edges)
├── Modify operations (change labels/styles)
├── Delete operations (remove elements)
├── Layout operations (rearrange / regenerate)
└── Theme operations (switch theme)

Step 5: Draft Modification & Confirm (For restructure)
├── If the edit involves major structural reorganization:
│   ├── Present the modified logical flow as an ASCII text-art graph
│   └── Pause for user's confirmation before applying
└── For minor edits (labels/colors/themes), proceed directly

Step 6: Apply Changes
├── Offline sidecar path -> update YAML, rerun CLI with --write-sidecars
├── Import path -> write a fresh YAML spec bundle, then regenerate outputs
├── Live path -> batch cell patches only after reading the latest XML
└── Keep .drawio, .spec.yaml, and .arch.json aligned after each accepted edit

Step 7: Verify and Iterate
├── Export preview if needed (desktop PNG/SVG or standalone SVG)
├── User reviews changes
└── Additional modifications as needed
```

## Design-System Preservation

### Theme Consistency

When editing, preserve the current theme unless the user asks to switch it:

| Edit Type | Theme Behavior |
|-----------|----------------|
| Add node | Uses current theme's node style |
| Add edge | Uses current theme's connector style |
| Modify style | Suggest theme-compatible colors |
| Switch theme | Re-applies all styles from the new theme |

### Semantic Type Changes

Change a node's semantic type to update its shape:

```text
/drawio edit
Change "User Service" from service to database type
```

### Batch Operations

For efficiency, batch multiple changes in one planning pass. If the active live provider has the required capabilities, those changes may be turned into one patch batch. Otherwise regenerate from the YAML bundle once.

## Preferred Operation Mapping

| Operation | Preferred Path | Notes |
|-----------|----------------|-------|
| Update label | YAML sidecar (or import to sidecar) | Preserves style |
| Update style | YAML sidecar (or import to sidecar) | Use theme tokens |
| Change type | YAML sidecar (or import to sidecar) | Updates shape |
| Add node | YAML sidecar | Apply semantic type |
| Add edge | YAML sidecar | Apply connector type |
| Delete | YAML sidecar (or import to sidecar) | Keeps bundle coherent |
| Move | YAML sidecar (or import to sidecar) | Snap to 8px grid |
| Switch theme | Regenerate from YAML | Re-apply all tokens |
| Live incremental patch | Live provider with required capabilities | Requires current XML read-back first |

## Examples

### Quick Label Update

```text
/drawio edit
Rename "User Auth" to "Authentication Service"
```

### Import Then Edit

```text
/drawio edit
Import this existing .drawio file, rename API to Auth, then regenerate the SVG
```

### Theme-Aware Style Update

```text
/drawio edit
Apply these changes:
- All service nodes: use primary color
- All database nodes: use secondary color
- All data flows: use dashed connector style
```

### Complex Restructure

```text
/drawio edit with restructure
Reorganize into 3 modules with academic theme and horizontal layout
```

## Troubleshooting

### No live incremental edit capability

- Import the current `.drawio` into `.spec.yaml` + `.arch.json`
- Apply the change offline
- Regenerate outputs instead of trying to patch the browser state

### Existing `.drawio` has no sidecar

- Run CLI import first
- Treat the imported YAML bundle as the new canonical source

### Style looks wrong after edit

- Verify theme is consistent
- Check whether the node type changed accidentally
- Re-apply the theme if mixed styles appeared after a manual patch

## Related

- [Live Backend Reference](../docs/mcp-tools.md)
- [Migration Readiness](../docs/migration-readiness.md)
- [Design System Overview](../docs/design-system/README.md)
- [Themes Reference](../docs/design-system/themes.md)
- [Specification Format](../docs/design-system/specification.md)
