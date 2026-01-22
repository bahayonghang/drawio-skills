# Export & Save

Learn how to save your diagrams as `.drawio` files for use in draw.io desktop or web applications.

## Overview

Once you've created and refined your diagram, you can export it as a `.drawio` file. This file can be:

- Opened in [draw.io desktop application](https://github.com/jgraph/drawio-desktop)
- Opened in [diagrams.net](https://www.diagrams.net/) web application
- Shared with team members
- Version controlled in your repository

## Basic Export

To export your current diagram:

```
"Export this diagram as 'my-architecture.drawio'"
```

Claude will:
1. Call `export_diagram` with the filename
2. Save the file to your current directory
3. Confirm the save location

## Specifying Save Location

### Save to Current Directory

```
"Export as 'flowchart.drawio'"
```

Saves to: `./flowchart.drawio`

### Save to Specific Directory

```
"Export this diagram to './diagrams/architecture.drawio'"
```

Saves to: `./diagrams/architecture.drawio`

::: tip
The directory must exist before saving. Create it first if needed:
```
"Create a diagrams directory and save this as 'architecture.drawio'"
```
:::

## File Naming

### Automatic Extension

The `.drawio` extension is added automatically if not provided:

```
"Export as 'my-diagram'"
```

Saves as: `my-diagram.drawio`

### Custom Names

Use descriptive names for better organization:

```
"Export as 'aws-serverless-api-architecture.drawio'"
"Export as 'user-authentication-flow.drawio'"
"Export as 'microservices-deployment-diagram.drawio'"
```

## Version History

The draw.io skill maintains version history in the browser. You can restore previous versions before exporting.

### Viewing History

```
"Show me the version history"
```

### Restoring a Version

```
"Restore the previous version"
"Go back to version 3"
```

### Exporting Specific Versions

```
"Restore version 2 and export it as 'architecture-v2.drawio'"
```

## Opening Exported Files

### In draw.io Desktop

1. Download [draw.io desktop](https://github.com/jgraph/drawio-desktop/releases)
2. Open the application
3. File → Open → Select your `.drawio` file

### In diagrams.net

1. Go to [diagrams.net](https://www.diagrams.net/)
2. Click "Open Existing Diagram"
3. Select your `.drawio` file

### In VS Code

If you have the [Draw.io Integration extension](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio):

1. Open VS Code
2. Click on the `.drawio` file
3. The diagram opens in the editor

## Organizing Exported Files

### Recommended Structure

```
project/
├── docs/
│   └── diagrams/
│       ├── architecture/
│       │   ├── system-overview.drawio
│       │   ├── microservices.drawio
│       │   └── deployment.drawio
│       ├── flowcharts/
│       │   ├── user-registration.drawio
│       │   ├── payment-process.drawio
│       │   └── order-fulfillment.drawio
│       └── sequence/
│           ├── oauth-flow.drawio
│           └── api-calls.drawio
```

### Naming Conventions

Use clear, descriptive names:

- **Architecture**: `aws-serverless-api.drawio`, `gcp-microservices.drawio`
- **Flowcharts**: `user-login-flow.drawio`, `ci-cd-pipeline.drawio`
- **Sequence**: `oauth2-flow.drawio`, `payment-sequence.drawio`
- **Network**: `vpc-architecture.drawio`, `network-topology.drawio`

## Version Control

### Git Integration

Add your diagrams to version control:

```bash
git add docs/diagrams/*.drawio
git commit -m "Add architecture diagrams"
git push
```

### Versioning Strategy

1. **Semantic Versioning**: `architecture-v1.0.drawio`, `architecture-v1.1.drawio`
2. **Date-based**: `architecture-2024-01-15.drawio`
3. **Feature-based**: `architecture-with-cache.drawio`, `architecture-with-cdn.drawio`

### Git Diff

`.drawio` files are XML-based, so you can see changes in git diff:

```bash
git diff docs/diagrams/architecture.drawio
```

## Exporting Multiple Diagrams

### Batch Export

```
"Export all diagrams in this session:
- 'architecture.drawio'
- 'flowchart.drawio'
- 'sequence.drawio'"
```

### Organized Export

```
"Export the architecture diagram to './docs/diagrams/architecture.drawio'
and the flowchart to './docs/diagrams/flowchart.drawio'"
```

## File Format

The `.drawio` file format is:

- **XML-based**: Human-readable and version-control friendly
- **Compressed**: Optionally compressed for smaller file size
- **Portable**: Works across all draw.io applications
- **Editable**: Can be edited in any text editor

### Viewing Raw XML

```bash
cat my-diagram.drawio
```

You'll see the XML structure:

```xml
<mxfile>
  <diagram>
    <mxGraphModel>
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <!-- Your diagram elements -->
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

## Best Practices

### Regular Exports

Export your diagrams regularly during development:

```
1. Create initial diagram
2. Export as 'architecture-draft.drawio'
3. Make changes
4. Export as 'architecture-v1.drawio'
5. Final changes
6. Export as 'architecture-final.drawio'
```

### Backup Strategy

- Export to multiple locations
- Commit to version control
- Keep local backups

### Documentation

Include diagrams in your documentation:

```markdown
# System Architecture

![Architecture Diagram](./diagrams/architecture.drawio.png)

[View editable diagram](./diagrams/architecture.drawio)
```

## Troubleshooting

### Export Failed

**Problem**: Export operation fails.

**Solution**:
1. Check if the directory exists
2. Verify write permissions
3. Check disk space

### File Not Found

**Problem**: Exported file not found.

**Solution**:
1. Check the save location
2. Verify the filename
3. Look in the current working directory

### Cannot Open File

**Problem**: Exported file won't open in draw.io.

**Solution**:
1. Verify the file extension is `.drawio`
2. Check if the file is corrupted
3. Try exporting again

## Next Steps

- [Creating Diagrams](./creating-diagrams.md) - Create more diagrams
- [Editing Diagrams](./editing-diagrams.md) - Modify existing diagrams
- [XML Format](/api/xml-format.md) - Understand the file format
- [Examples](/examples/) - Browse example diagrams
