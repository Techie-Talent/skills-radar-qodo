#!/usr/bin/env tsx

// Simple test to verify the wrapper sends proper JSON-RPC responses

import { spawn } from 'child_process';

async function testWrapper() {
  console.log('🧪 Testing MCP stdio wrapper JSON-RPC compliance...');
  
  const wrapper = spawn('npx', ['tsx', 'scripts/mcp-stdio-wrapper.ts'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
      ...process.env,
      MCP_API_KEY: 'test_key_for_protocol_test'
    }
  });

  let output = '';
  let errorOutput = '';

  wrapper.stdout.on('data', (data) => {
    output += data.toString();
  });

  wrapper.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  // Test initialize request
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'test', version: '1.0.0' }
    }
  };

  wrapper.stdin.write(JSON.stringify(initRequest) + '\n');

  // Wait for response
  await new Promise(resolve => setTimeout(resolve, 1000));

  wrapper.kill();

  console.log('📤 Sent request:', JSON.stringify(initRequest, null, 2));
  console.log('📥 Received output:', output);
  
  if (errorOutput) {
    console.log('⚠️  Error output:', errorOutput);
  }

  // Try to parse the response
  try {
    const lines = output.trim().split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      const response = JSON.parse(lines[0]);
      console.log('✅ Valid JSON-RPC response:', JSON.stringify(response, null, 2));
      
      if (response.jsonrpc === '2.0' && response.id === 1 && response.result) {
        console.log('🎉 Protocol compliance test PASSED!');
      } else {
        console.log('❌ Protocol compliance test FAILED - invalid response structure');
      }
    } else {
      console.log('❌ No output received');
    }
  } catch (error) {
    console.log('❌ Failed to parse JSON response:', error.message);
  }
}

testWrapper().catch(console.error);