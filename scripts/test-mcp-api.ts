#!/usr/bin/env tsx

/**
 * Test script for MCP API endpoints
 * 
 * This script tests the MCP API endpoints to ensure they work correctly.
 * You'll need to create an API key first through the admin interface.
 */

const API_BASE_URL = 'http://localhost:3000/api/mcp';

// You'll need to replace this with an actual API key from the admin interface
const API_KEY = process.env.MCP_API_KEY || 'your-api-key-here';

async function testEndpoint(endpoint: string, description: string) {
  console.log(`\n🧪 Testing ${description}...`);
  console.log(`📍 Endpoint: ${endpoint}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Success! Data preview:`);
      
      if (data.data && Array.isArray(data.data)) {
        console.log(`   📦 Returned ${data.data.length} items`);
        if (data.data.length > 0) {
          console.log(`   🔍 First item keys: ${Object.keys(data.data[0]).join(', ')}`);
        }
      } else if (data.data && typeof data.data === 'object') {
        console.log(`   🔍 Data keys: ${Object.keys(data.data).join(', ')}`);
      }
      
      if (data.metadata) {
        console.log(`   📈 Metadata: ${JSON.stringify(data.metadata, null, 2)}`);
      }
    } else {
      const error = await response.json();
      console.log(`❌ Error: ${JSON.stringify(error, null, 2)}`);
    }
  } catch (error) {
    console.log(`💥 Request failed: ${error}`);
  }
}

async function main() {
  console.log('🚀 Starting MCP API Tests');
  console.log(`🔑 Using API Key: ${API_KEY.substring(0, 10)}...`);
  
  if (API_KEY === 'your-api-key-here') {
    console.log('\n⚠️  WARNING: Please set a real API key in the MCP_API_KEY environment variable');
    console.log('   You can create one through the admin interface at /admin/api-keys');
    console.log('   Then run: MCP_API_KEY=your-actual-key tsx scripts/test-mcp-api.ts');
    return;
  }

  // Test all endpoints
  await testEndpoint('/skills', 'Skills endpoint');
  await testEndpoint('/skills?limit=5', 'Skills endpoint with limit');
  await testEndpoint('/skills?include_members=true&limit=3', 'Skills endpoint with members');
  
  await testEndpoint('/members', 'Members endpoint');
  await testEndpoint('/members?limit=5', 'Members endpoint with limit');
  await testEndpoint('/members?include_skills=true&limit=3', 'Members endpoint with skills');
  
  await testEndpoint('/dashboards/summary', 'Dashboard summary endpoint');
  
  console.log('\n🎉 All tests completed!');
}

// Test OpenAPI spec endpoint (no auth required)
async function testOpenAPI() {
  console.log('\n🧪 Testing OpenAPI specification...');
  
  try {
    const response = await fetch('http://localhost:3000/api/openapi.json');
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const spec = await response.json();
      console.log(`✅ OpenAPI spec loaded successfully!`);
      console.log(`   📖 Title: ${spec.info?.title}`);
      console.log(`   📝 Version: ${spec.info?.version}`);
      console.log(`   🛣️  Paths: ${Object.keys(spec.paths || {}).join(', ')}`);
    } else {
      console.log(`❌ Failed to load OpenAPI spec`);
    }
  } catch (error) {
    console.log(`💥 Request failed: ${error}`);
  }
}

// Run tests
main().then(() => testOpenAPI()).catch(console.error);