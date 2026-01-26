<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Draw.io Skill for Claude Code - AI-powered diagram creation with Design System 2.0 and real-time browser preview. The skill wraps the `@next-ai-drawio/mcp-server` MCP server with workflow guidance, YAML specification format, and design system.

## Commands

```bash
# Run tests (Node.js built-in test runner)
npm test
node --test                           # Same thing
node --test skills/drawio/src/dsl/    # Run tests in specific directory

# Documentation site (VitePress)
npm run docs:dev      # Development server
npm run docs:build    # Production build
npm run docs:preview  # Preview production build
```

## Architecture

```
Claude Code <--stdio--> MCP Server <--http--> Browser (draw.io)
```

### Core Components

**Skill Definition** (`skills/drawio/`)
- `SKILL.md` - Main skill entry point with workflows and MCP tool reference
- `.mcp.json` - MCP server configuration
- `workflows/` - Three workflows: create.md, replicate.md, edit.md
- `docs/` - Internal skill documentation

**DSL Converter** (`skills/drawio/src/dsl/`)
- `spec-to-drawio.js` - YAML specification → draw.io XML converter (Design System 2.0)
- `ah-to-drawio.js` - Legacy A-H format → draw.io XML converter
- Tests use `import { describe, it } from 'node:test'` and `import assert from 'node:assert'`

**Design System** (`skills/drawio/themes/`)
- 4 theme JSON files: `tech-blue.json`, `academic.json`, `nature.json`, `dark.json`
- `theme.schema.json` - JSON Schema for theme validation

**Documentation Site** (`docs/`)
- VitePress site with English (`docs/`) and Chinese (`docs/zh/`) versions
- Config at `docs/.vitepress/config.ts`

### Three Workflows

| Workflow | Command | Purpose |
|----------|---------|---------|
| Create | `/drawio-create` | Natural language → diagram |
| Replicate | `/drawio-replicate` | Image → structured extraction → diagram |
| Edit | `/drawio-edit` | Modify existing diagram |

### Design System 2.0

- **4 Themes**: tech-blue (default), academic (IEEE), nature, dark
- **8 Semantic Shapes**: service, database, decision, terminal, queue, user, document, formula
- **5 Connector Types**: primary, data, optional, dependency, bidirectional
- **8px Grid**: All positions snap to 8px increments

Type auto-detection in `detectSemanticType()`:
- Labels with `?` or `check/if/valid` → decision
- Labels with `$$`, `\(`, `\[` → formula
- Keywords like `database`, `redis`, `kafka` → appropriate type

### MCP Tools

| Tool | Purpose |
|------|---------|
| `start_session` | Opens browser with real-time preview |
| `create_new_diagram` | Create diagram from XML |
| `edit_diagram` | Edit by cell ID |
| `get_diagram` | Get current diagram XML |
| `export_diagram` | Save to .drawio file |

## Key Files

- `skills/drawio/src/dsl/spec-to-drawio.js:117` - `detectSemanticType()` - shape detection logic
- `skills/drawio/src/dsl/spec-to-drawio.js:180` - `calculateLayout()` - layout engine
- `skills/drawio/src/dsl/spec-to-drawio.js:422` - `buildXml()` - XML generation
- `skills/drawio/src/dsl/spec-to-drawio.js:548` - `specToDrawioXml()` - main entry point

## Testing Notes

- Project uses **Node.js built-in test runner**, NOT vitest/jest
- Test files use `node:test` and `node:assert` modules
- Run single test file: `node --test path/to/file.test.js`

## YAML Specification Format

```yaml
meta:
  theme: tech-blue       # Required: theme name
  layout: horizontal     # Optional: horizontal|vertical|hierarchical

modules:
  - id: backend
    label: Backend Services

nodes:
  - id: api
    label: API Gateway
    type: service        # Optional: auto-detected from label
    module: backend      # Optional: parent module

edges:
  - from: api
    to: db
    type: data           # Optional: primary|data|optional|dependency|bidirectional
    label: Query
```

## Complexity Guardrails

| Metric | Warning | Error |
|--------|---------|-------|
| Nodes | >20 | >30 |
| Edges | >30 | >50 |
| Modules | >5 | - |
| Label length | >14 chars | - |
