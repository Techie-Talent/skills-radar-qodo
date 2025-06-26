#!/usr/bin/env tsx

import { spawn } from 'child_process';
import { EventEmitter } from 'events';

class MCPClient extends EventEmitter {
  private process: any;
  private requestId = 1;

  constructor(command: string, args: string[], env: Record<string, string> = {}) {
    super();
    
    this.process = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, ...env }
    });

    this.process.stdout.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        try {
          const response = JSON.parse(line);
          this.emit('response', response);
        } catch (error) {
          console.error('Failed to parse response:', line);
        }
      });
    });

    this.process.stderr.on('data', (data: Buffer) => {
      console.error('MCP Server Error:', data.toString());
    });

    this.process.on('error', (error: Error) => {
      console.error('Process error:', error);
    });
  }

  send(method: string, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = this.requestId++;
      const request = {
        jsonrpc: '2.0',
        id,
        method,
        ...(params && { params })
      };

      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 10000);

      const responseHandler = (response: any) => {
        if (response.id === id) {
          clearTimeout(timeout);
          this.off('response', responseHandler);
          
          if (response.error) {
            reject(new Error(response.error.message));
          } else {
            resolve(response.result);
          }
        }
      };

      this.on('response', responseHandler);
      this.process.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  close() {
    this.process.kill();
  }
}

async function testMCPServer() {
  console.log('🧪 Testing Skills Radar MCP Server with stdio wrapper...');
  console.log('📍 Make sure the Skills Radar server is running on http://localhost:3000');
  
  const apiKey = process.env.MCP_API_KEY;
  if (!apiKey || apiKey === 'sk_test_key') {
    console.log('⚠️  Warning: Using default test key. Set MCP_API_KEY environment variable for real testing.');
  }
  
  const client = new MCPClient('tsx', ['scripts/mcp-stdio-wrapper.ts'], {
    MCP_API_KEY: apiKey || 'sk_test_key',
    MCP_API_BASE_URL: process.env.MCP_API_BASE_URL || 'http://localhost:3000/api/mcp'
  });

  try {
    // Initialize
    console.log('\n📡 Initializing MCP connection...');
    const initResult = await client.send('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'skills-radar-test-client', version: '1.0.0' }
    });
    console.log('✅ Initialized successfully');
    console.log('   Server:', initResult.serverInfo.name, 'v' + initResult.serverInfo.version);

    // List tools
    console.log('\n🔧 Listing available tools...');
    const toolsResult = await client.send('tools/list');
    console.log('✅ Available tools:');
    toolsResult.tools.forEach((tool: any) => {
      console.log(`   📋 ${tool.name}: ${tool.description}`);
    });

    // Test get_skills tool
    console.log('\n📊 Testing get_skills tool...');
    const skillsResult = await client.send('tools/call', {
      name: 'get_skills',
      arguments: { limit: 5 }
    });
    const skillsData = JSON.parse(skillsResult.content[0].text);
    console.log('✅ Skills result:');
    console.log(`   📦 Found ${skillsData.data?.length || 0} skills`);
    if (skillsData.data && skillsData.data.length > 0) {
      console.log(`   🔍 Sample skill: ${skillsData.data[0].skill_name} (${skillsData.data[0].knowledge_area?.name})`);
    }

    // Test get_members tool
    console.log('\n👥 Testing get_members tool...');
    const membersResult = await client.send('tools/call', {
      name: 'get_members',
      arguments: { limit: 5, include_skills: true }
    });
    const membersData = JSON.parse(membersResult.content[0].text);
    console.log('✅ Members result:');
    console.log(`   📦 Found ${membersData.data?.length || 0} members`);
    if (membersData.data && membersData.data.length > 0) {
      const member = membersData.data[0];
      console.log(`   🔍 Sample member: ${member.full_name} (${member.category})`);
      if (member.skills_count) {
        console.log(`   🎯 Skills: ${member.skills_count} skills`);
      }
    }

    // Test dashboard summary
    console.log('\n📈 Testing get_dashboard_summary tool...');
    const dashboardResult = await client.send('tools/call', {
      name: 'get_dashboard_summary',
      arguments: {}
    });
    const dashboardData = JSON.parse(dashboardResult.content[0].text);
    console.log('✅ Dashboard summary:');
    if (dashboardData.data?.overview) {
      const overview = dashboardData.data.overview;
      console.log(`   👥 Total members: ${overview.total_members}`);
      console.log(`   🎯 Total skills: ${overview.total_skills}`);
      console.log(`   🧠 Knowledge areas: ${overview.total_knowledge_areas}`);
    }

    // Test find_experts tool (custom tool)
    console.log('\n🔍 Testing find_experts tool...');
    const expertsResult = await client.send('tools/call', {
      name: 'find_experts',
      arguments: { 
        skill_name: 'React',
        min_expertise_level: 2
      }
    });
    const expertsData = JSON.parse(expertsResult.content[0].text);
    console.log('✅ Find experts result:');
    if (expertsData.data && expertsData.data.length > 0) {
      console.log(`   🎯 Found ${expertsData.data.length} React experts`);
      console.log(`   👨‍💻 Top expert: ${expertsData.data[0].member_name} (Level ${expertsData.data[0].expertise_level})`);
    } else {
      console.log('   ℹ️  No React experts found or skill not available');
      if (expertsData.message) {
        console.log(`   💡 ${expertsData.message}`);
      }
    }

    console.log('\n🎉 All MCP tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ MCP protocol initialization');
    console.log('   ✅ Tool discovery');
    console.log('   ✅ Skills data retrieval');
    console.log('   ✅ Members data retrieval');
    console.log('   ✅ Dashboard analytics');
    console.log('   ✅ Expert finding');

  } catch (error) {
    console.error('\n❌ Test failed:', error instanceof Error ? error.message : String(error));
    console.log('\n🔧 Troubleshooting tips:');
    console.log('   1. Make sure the Skills Radar server is running: npm run dev');
    console.log('   2. Check your API key: export MCP_API_KEY="sk_your_actual_key"');
    console.log('   3. Verify the server URL: export MCP_API_BASE_URL="http://localhost:3000/api/mcp"');
    console.log('   4. Ensure you have data in the database: npm run seed:expanded');
  } finally {
    client.close();
  }
}

// Show usage information
function showUsage() {
  console.log('🚀 Skills Radar MCP Client Test');
  console.log('');
  console.log('This script tests the MCP Server integration by connecting through the stdio wrapper.');
  console.log('');
  console.log('Prerequisites:');
  console.log('  1. Skills Radar server running: npm run dev');
  console.log('  2. API key created in /admin/api-keys');
  console.log('  3. Environment variables set:');
  console.log('     export MCP_API_KEY="sk_your_actual_api_key"');
  console.log('     export MCP_API_BASE_URL="http://localhost:3000/api/mcp"');
  console.log('');
  console.log('Usage:');
  console.log('  tsx scripts/test-mcp-client.ts');
  console.log('  # or');
  console.log('  npm run test:mcp-client');
  console.log('');
}

// Check if help is requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showUsage();
  process.exit(0);
}

// Run tests
testMCPServer().catch(console.error);