#!/bin/bash
# Installation script for Draw.io Skill (desktop-first, MCP optional)

set -e

echo "Installing Draw.io Skill..."

# Check if npx is available
if ! command -v npx &> /dev/null; then
    echo "Error: npx is not installed. Please install Node.js first."
    exit 1
fi

echo "Checking optional live-edit MCP availability..."
MCP_VER="$(npm view @next-ai-drawio/mcp-server version 2>/dev/null || true)"
if [ -n "$MCP_VER" ]; then
  echo "✓ Optional next-ai MCP available: $MCP_VER"
else
  echo "Info: Optional next-ai MCP not detected. The skill still works in offline/desktop mode."
fi

echo "Checking draw.io Desktop..."
DRAWIO_CMD="${DRAWIO_CMD:-}"
if [ -n "$DRAWIO_CMD" ] && [ -x "$DRAWIO_CMD" ]; then
  echo "✓ draw.io Desktop configured via DRAWIO_CMD: $DRAWIO_CMD"
elif command -v drawio >/dev/null 2>&1; then
  echo "✓ draw.io Desktop found on PATH: $(command -v drawio)"
elif command -v draw.io >/dev/null 2>&1; then
  echo "✓ draw.io Desktop found on PATH: $(command -v draw.io)"
elif [ -x "/Applications/draw.io.app/Contents/MacOS/draw.io" ]; then
  echo "✓ draw.io Desktop found at /Applications/draw.io.app/Contents/MacOS/draw.io"
else
  echo "Info: draw.io Desktop was not found. You can still generate .drawio and standalone SVG files."
fi

echo "✓ Draw.io Skill installed successfully!"
echo ""
echo "Default mode: offline-first (YAML/CLI -> .drawio + optional sidecars)"
echo "Optional enhancer: next-ai MCP for live browser editing"
echo ""
echo "Usage examples:"
echo "  - Create a flowchart showing user authentication flow"
echo "  - Generate an AWS architecture diagram with Lambda and DynamoDB"
echo "  - Draw a sequence diagram for OAuth 2.0 flow"
