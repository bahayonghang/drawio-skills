#!/bin/bash
# Installation script for Next AI Draw.io Skill

set -e

echo "Installing Next AI Draw.io Skill..."

# Check if npx is available
if ! command -v npx &> /dev/null; then
    echo "Error: npx is not installed. Please install Node.js first."
    exit 1
fi

# Test the MCP server (non-interactive; do not start the stdio server here)
echo "Testing MCP server availability..."
MCP_VER="$(npm view @next-ai-drawio/mcp-server version 2>/dev/null || true)"
if [ -n "$MCP_VER" ]; then
  echo "✓ @next-ai-drawio/mcp-server version: $MCP_VER"
else
  echo "Warning: Unable to query @next-ai-drawio/mcp-server version. It will be installed on first use."
fi

echo "✓ Next AI Draw.io Skill installed successfully!"
echo ""
echo "The MCP server will be automatically started when you use this skill."
echo "Default port: 6002 (will auto-increment if in use)"
echo ""
echo "Usage examples:"
echo "  - Create a flowchart showing user authentication flow"
echo "  - Generate an AWS architecture diagram with Lambda and DynamoDB"
echo "  - Draw a sequence diagram for OAuth 2.0 flow"
