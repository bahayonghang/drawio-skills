# Getting Started

Welcome to Draw.io Skill for Claude Code! This guide will help you get started with creating diagrams using natural language.

## What is Draw.io Skill?

Draw.io Skill is a Claude Code skill that enables AI-powered diagram creation and editing with real-time browser preview. It allows you to:

- Create diagrams using natural language descriptions
- Edit existing diagrams with simple commands
- Export diagrams as `.drawio` files
- View diagrams in real-time in your browser

## Prerequisites

Before you begin, make sure you have:

- [Claude Code CLI](https://github.com/anthropics/claude-code) installed
- [Node.js](https://nodejs.org/) (for npx command)

## Installation

See the [Installation Guide](./installation.md) for detailed installation instructions.

## Your First Diagram

Once installed, creating a diagram is as simple as asking Claude:

```
"Create a flowchart for user login process"
```

Claude will:
1. Call `start_session` to open a browser window
2. Generate the diagram XML
3. Display the diagram in your browser
4. Allow you to make changes with natural language

## Basic Concepts

### MCP Tools

The skill uses the following MCP tools:

- **start_session**: Opens browser with real-time preview
- **create_new_diagram**: Creates a new diagram from XML
- **get_diagram**: Retrieves current diagram XML
- **edit_diagram**: Modifies diagram by cell ID
- **export_diagram**: Saves as .drawio file

### Diagram Types

You can create various types of diagrams:

- **Flowcharts**: Process flows, decision trees, workflows
- **Architecture Diagrams**: System architecture, microservices, deployment
- **Sequence Diagrams**: Interaction flows, API calls, message sequences
- **Network Diagrams**: Network topology, VPC architecture, security zones
- **Data Flow Diagrams**: Data pipelines, ETL processes, analytics workflows
- **UML Diagrams**: Class diagrams, state diagrams, component diagrams
- **Cloud Architecture**: AWS, GCP, Azure with official icons

## Example Prompts

### Simple Flowchart

```
"Create a flowchart showing a user registration process with email verification"
```

### AWS Architecture

```
"Generate an AWS architecture diagram with Lambda, API Gateway, DynamoDB,
and S3 for a serverless REST API. Use AWS icons."
```

### Sequence Diagram

```
"Create a sequence diagram showing OAuth 2.0 authorization code flow
between user, client app, auth server, and resource server"
```

## Next Steps

- [Installation Guide](./installation.md) - Detailed installation instructions
- [Creating Diagrams](./creating-diagrams.md) - Learn how to create different types of diagrams
- [Editing Diagrams](./editing-diagrams.md) - Learn how to modify existing diagrams
- [Export & Save](./export.md) - Learn how to save your diagrams

## Getting Help

If you encounter any issues:

1. Check the [Troubleshooting](./installation.md#troubleshooting) section
2. Review the [API Reference](/api/mcp-tools.md)
3. Check the [Examples](/examples/) for inspiration
4. Open an issue on [GitHub](https://github.com/bahayonghang/drawio-skills/issues)
