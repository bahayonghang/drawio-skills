#!/bin/bash
# Installation script for Next AI Draw.io Skill

set -e

echo "Installing Next AI Draw.io Skill..."

# Check if npx is available
if ! command -v npx &> /dev/null; then
    echo "Error: npx is not installed. Please install Node.js first."
    exit 1
fi

# Test the MCP server
echo "Testing MCP server installation..."
npx @next-ai-drawio/mcp-server@latest --version 2>/dev/null || echo "MCP server will be installed on first use"

echo "✓ Next AI Draw.io Skill installed successfully!"
echo ""
echo "The MCP server will be automatically started when you use this skill."
echo "Default port: 6002 (will auto-increment if in use)"
echo ""
echo "Usage examples:"
echo "  - Create a flowchart showing user authentication flow"
echo "  - Generate an AWS architecture diagram with Lambda and DynamoDB"
echo "  - Draw a sequence diagram for OAuth 2.0 flow"
