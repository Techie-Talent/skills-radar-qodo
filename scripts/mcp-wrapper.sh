#!/bin/bash

# Shell wrapper for MCP stdio wrapper
# This ensures tsx is found via npx

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project directory to ensure npx finds local tsx
cd "$PROJECT_ROOT"

# Run the wrapper using npx to find local tsx
exec npx tsx scripts/mcp-stdio-wrapper.ts