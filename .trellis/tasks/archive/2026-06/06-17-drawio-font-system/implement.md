# drawio skills font system - implement

## Plan

1. Extend the spec schema for `meta.font`.
2. Add resolution helpers for font policy and script-aware routing.
3. Thread the resolver through node text, formula nodes, module titles, and edge labels.
4. Add tests for forced mode, fallback mode, and mixed-script allocation.
5. Update docs or spec notes only if the implementation exposes a new user-facing contract detail.

## Validation

- run targeted unit tests for `spec-to-drawio`
- run repo checks for the touched package
- inspect generated XML for node, module, and edge label family emission

## Risk points

- `spec.schema.json` validation for the new meta contract
- shared font resolution paths that currently assume node-only behavior
- edge-label emission, which currently omits `fontFamily`
- module-title rendering, which may need a shared resolver rather than a one-off override

## Rollback points

- schema update only
- resolver helper only
- renderer emission changes
- test updates

## Notes

Keep the change focused on font-family selection. Do not fold in unrelated typography refactors or theme redesigns.
