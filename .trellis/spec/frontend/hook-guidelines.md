# Hook Guidelines

There are no React hooks in this repository. Do not add React-style `use*`
hooks or browser state libraries unless the project gains an actual React
surface. The local equivalent of a "hook" is an explicit extension point:
CLI flags, input adapters, validator functions, Desktop provider detection,
workflow routing docs, and test-injected dependencies.

## Extension-Point Patterns

- CLI options are parsed in `skills/drawio/scripts/cli.js` and then passed to
  focused helpers. Add a flag only when there is a clear runtime behavior and a
  test for the flag.
- Input adapters live in `skills/drawio/scripts/adapters/index.js` and must
  return the canonical spec shape: `meta`, `nodes`, `edges`, and `modules`.
- Validators live near the behavior they protect. Examples:
  `validateSpec`, `validateXml`, `validateAcademicProfile`,
  `validateEdgeQuality`, and `validateConnectionPointPolicy`.
- Provider detection uses dependency injection for tests. Follow
  `detectDrawioDesktop({ platform, env, exists, probeCommand })` instead of
  hard-coding the local machine.

## Data Fetching

The runtime is offline-first. Normal CLI, DSL, SVG, and docs behavior should
not fetch remote data.

- Read local files with Node filesystem APIs.
- Treat draw.io Desktop as an optional local executable, not a service.
- Treat MCP/live browser tooling as an optional refinement path documented in
  skill references, not as a required data source.
- Do not add network access to the renderer, validators, or tests unless the
  user explicitly asks for a network-backed feature and it is isolated.

## Naming Conventions

Use verb prefixes that describe module behavior:

- `parse*` for input normalization, such as `parseSpecYaml`.
- `validate*` for checks that throw or return warnings.
- `derive*` and `build*` for deterministic derived data.
- `generate*` for XML/style output from validated data.
- `detect*` and `list*` for optional provider discovery.
- `export*` for writing through an external provider such as draw.io Desktop.

Avoid `use*` naming unless the file is actually a React hook module.

## Stateful Logic

- Keep state local to the function call whenever possible.
- Small module caches are acceptable when they are deterministic and bounded by
  local files, such as the theme cache in `spec-to-drawio.js`.
- Temporary files should be created by the CLI/runtime path and cleaned up by
  that same flow.
- Do not introduce long-lived background services, global stores, or hidden
  process state for normal diagram generation.

## Common Mistakes

- Do not turn optional live refinement into the default runtime.
- Do not add implicit remote fetches to "improve" docs, icons, or themes.
- Do not swallow Desktop detection failures. Existing runtime helpers report
  that draw.io Desktop is unavailable and keep the offline bundle usable.
- Do not add extension points without tests that cover supported and rejected
  inputs.
