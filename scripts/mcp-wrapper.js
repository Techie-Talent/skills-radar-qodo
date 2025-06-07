#!/usr/bin/env node

// Node.js wrapper for the MCP stdio wrapper to avoid tsx dependency issues
const { spawn } = require('child_process');
const path = require('path');

// Get the project root directory
const projectRoot = path.dirname(__dirname);

// Use npx to run tsx from the local node_modules
const tsxPath = path.join(projectRoot, 'node_modules', '.bin', 'tsx');
const wrapperScript = path.join(projectRoot, 'scripts', 'mcp-stdio-wrapper.ts');

// Spawn the tsx process with the wrapper script
const child = spawn(tsxPath, [wrapperScript], {
  stdio: 'inherit',
  env: process.env
});

// Handle process events
child.on('error', (error) => {
  console.error('Error starting MCP wrapper:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code);
});