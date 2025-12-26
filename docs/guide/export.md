# Export & Save

Learn how to save your diagrams for future use.

## Export Formats

### Drawio Format (.drawio)

The native format that preserves all editing capabilities:

> "Export the diagram as user-login-flow.drawio"

This saves the complete diagram in XML format, allowing you to:
- Reopen in Draw.io desktop
- Edit with Claude Code later
- Share with others

## Exporting with Claude

### Basic Export

> "Save this diagram as my-diagram.drawio"

### Specify Location

> "Export the diagram to ~/Documents/diagrams/architecture.drawio"

### Export Multiple Diagrams

> "Save all open diagrams with the prefix 'project-'"

## Managing Exported Files

### Organizing Diagrams

Create a structured directory for your diagrams:

\`\`\`bash
mkdir -p ~/Documents/diagrams/{flowcharts,architecture,ui}
\`\`\`

### Naming Conventions

Use descriptive names with dates:

- `user-auth-flow-2024-01-15.drawio`
- `microservices-architecture-v2.drawio`
- `order-processing-flow.drawio`

## Version Control

### Git Integration

Track your diagrams in Git:

\`\`\`bash
# Add diagrams to your repository
git add diagrams/*.drawio
git commit -m "Add system architecture diagram"
\`\`\`

### Diffing Changes

Drawio files are XML-based, making them diffable:

\`\`\`bash
git diff diagrams/architecture.drawio
\`\`\`

## Sharing Diagrams

### Export to PNG

While the skill primarily exports to .drawio format, you can use Draw.io desktop to convert:

1. Open the .drawio file in Draw.io desktop
2. File → Export as → PNG
3. Adjust quality and scale as needed

### Export to PDF

For documents and presentations:

1. Open in Draw.io desktop
2. File → Export as → PDF
3. Select page size and orientation

## Backup Strategies

### Local Backup

\`\`\`bash
# Create regular backups
cp -r ~/Documents/diagrams ~/Backups/diagrams-$(date +%Y%m%d)
\`\`\`

### Cloud Storage

Sync your diagrams directory with:
- Google Drive
- Dropbox
- OneDrive

## Next Steps

- Explore [Examples](../examples/) for inspiration
- Learn about [XML Format](../api/xml-format)
