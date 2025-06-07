# MCP Client Integration Guide

This guide explains how to integrate the Skills Radar MCP Server with various MCP clients and testing environments.

## 🔄 MCP Server Types

Our Skills Radar implements an **HTTP-based MCP Server** rather than a traditional stdio-based MCP server. This provides several advantages:

- **Web-based access** through standard HTTP APIs
- **Authentication** via API keys
- **RESTful endpoints** that work with any HTTP client
- **OpenAPI specification** for easy integration

However, some MCP clients expect stdio-based servers. This guide shows how to work with both approaches.

## 🧪 Testing with MCP Clients

### 1. Claude Desktop Integration

Claude Desktop typically expects stdio-based MCP servers. To use our HTTP-based server with Claude Desktop, you have a few options:

#### Option A: HTTP Proxy Wrapper (Recommended)

Create a simple wrapper script that converts stdio MCP calls to HTTP requests:

```typescript
// scripts/mcp-stdio-wrapper.ts
#!/usr/bin/env tsx

import { stdin, stdout } from 'process';
import readline from 'readline';

const API_BASE_URL = process.env.MCP_API_BASE_URL || 'http://localhost:3000/api/mcp';
const API_KEY = process.env.MCP_API_KEY;

if (!API_KEY) {
  console.error('MCP_API_KEY environment variable is required');
  process.exit(1);
}

interface MCPRequest {
  jsonrpc: string;
  id: string | number;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: string;
  id: string | number;
  result?: any;
  error?: any;
}

class MCPStdioWrapper {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: stdin,
      output: stdout,
      terminal: false
    });

    this.rl.on('line', this.handleLine.bind(this));
  }

  private async handleLine(line: string) {
    try {
      const request: MCPRequest = JSON.parse(line);
      const response = await this.handleRequest(request);
      console.log(JSON.stringify(response));
    } catch (error) {
      console.error('Error processing request:', error);
    }
  }

  private async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    const { id, method, params } = request;

    try {
      switch (method) {
        case 'initialize':
          return {
            jsonrpc: '2.0',
            id,
            result: {
              protocolVersion: '2024-11-05',
              capabilities: {
                tools: {
                  listChanged: false
                },
                resources: {
                  subscribe: false,
                  listChanged: false
                }
              },
              serverInfo: {
                name: 'skills-radar-mcp',
                version: '1.0.0'
              }
            }
          };

        case 'tools/list':
          return {
            jsonrpc: '2.0',
            id,
            result: {
              tools: [
                {
                  name: 'get_skills',
                  description: 'Get skills data with optional filtering',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      knowledge_area_id: { type: 'number' },
                      category_id: { type: 'number' },
                      include_members: { type: 'boolean' },
                      limit: { type: 'number', default: 100 }
                    }
                  }
                },
                {
                  name: 'get_members',
                  description: 'Get team members with optional filtering',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      knowledge_area_id: { type: 'number' },
                      skill_id: { type: 'number' },
                      current_client: { type: 'string' },
                      category: { type: 'string' },
                      include_skills: { type: 'boolean' },
                      limit: { type: 'number', default: 100 }
                    }
                  }
                },
                {
                  name: 'get_dashboard_summary',
                  description: 'Get aggregated insights and analytics',
                  inputSchema: {
                    type: 'object',
                    properties: {}
                  }
                }
              ]
            }
          };

        case 'tools/call':
          const toolResult = await this.callTool(params.name, params.arguments || {});
          return {
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(toolResult, null, 2)
                }
              ]
            }
          };

        default:
          return {
            jsonrpc: '2.0',
            id,
            error: {
              code: -32601,
              message: `Method not found: ${method}`
            }
          };
      }
    } catch (error) {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32603,
          message: `Internal error: ${error.message}`
        }
      };
    }
  }

  private async callTool(toolName: string, args: any): Promise<any> {
    const headers = {
      'x-api-key': API_KEY!,
      'Content-Type': 'application/json'
    };

    let endpoint: string;
    let queryParams = new URLSearchParams();

    switch (toolName) {
      case 'get_skills':
        endpoint = '/skills';
        if (args.knowledge_area_id) queryParams.set('knowledge_area_id', args.knowledge_area_id);
        if (args.category_id) queryParams.set('category_id', args.category_id);
        if (args.include_members) queryParams.set('include_members', 'true');
        if (args.limit) queryParams.set('limit', args.limit);
        break;

      case 'get_members':
        endpoint = '/members';
        if (args.knowledge_area_id) queryParams.set('knowledge_area_id', args.knowledge_area_id);
        if (args.skill_id) queryParams.set('skill_id', args.skill_id);
        if (args.current_client) queryParams.set('current_client', args.current_client);
        if (args.category) queryParams.set('category', args.category);
        if (args.include_skills) queryParams.set('include_skills', 'true');
        if (args.limit) queryParams.set('limit', args.limit);
        break;

      case 'get_dashboard_summary':
        endpoint = '/dashboards/summary';
        break;

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }

    const url = `${API_BASE_URL}${endpoint}?${queryParams}`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }
}

// Start the wrapper
new MCPStdioWrapper();
```

#### Claude Desktop Configuration

With the wrapper script, you can configure Claude Desktop like this:

```json
{
  "mcpServers": {
    "skills-radar": {
      "command": "tsx",
      "args": ["scripts/mcp-stdio-wrapper.ts"],
      "env": {
        "MCP_API_KEY": "sk_your_api_key_here",
        "MCP_API_BASE_URL": "http://localhost:3000/api/mcp"
      }
    }
  }
}
```

#### Option B: Direct HTTP Integration

For clients that support HTTP-based MCP servers, you can configure direct access:

```json
{
  "mcpServers": {
    "skills-radar": {
      "type": "http",
      "baseUrl": "http://localhost:3000/api/mcp",
      "headers": {
        "x-api-key": "sk_your_api_key_here"
      }
    }
  }
}
```

### 2. Testing with MCP Inspector

The MCP Inspector is a great tool for testing MCP servers. Here's how to use it with our server:

#### Install MCP Inspector
```bash
npm install -g @modelcontextprotocol/inspector
```

#### Test with the Wrapper
```bash
# Set environment variables
export MCP_API_KEY="sk_your_api_key_here"
export MCP_API_BASE_URL="http://localhost:3000/api/mcp"

# Run the inspector with our wrapper
mcp-inspector tsx scripts/mcp-stdio-wrapper.ts
```

### 3. Custom MCP Client Testing

Create a simple test client to verify MCP functionality:

```typescript
// scripts/test-mcp-client.ts
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
  console.log('🧪 Testing MCP Server with stdio wrapper...');
  
  const client = new MCPClient('tsx', ['scripts/mcp-stdio-wrapper.ts'], {
    MCP_API_KEY: process.env.MCP_API_KEY || 'sk_test_key',
    MCP_API_BASE_URL: process.env.MCP_API_BASE_URL || 'http://localhost:3000/api/mcp'
  });

  try {
    // Initialize
    console.log('📡 Initializing...');
    const initResult = await client.send('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'test-client', version: '1.0.0' }
    });
    console.log('✅ Initialized:', initResult.serverInfo);

    // List tools
    console.log('\n🔧 Listing tools...');
    const toolsResult = await client.send('tools/list');
    console.log('✅ Available tools:', toolsResult.tools.map((t: any) => t.name));

    // Test get_skills tool
    console.log('\n📊 Testing get_skills tool...');
    const skillsResult = await client.send('tools/call', {
      name: 'get_skills',
      arguments: { limit: 3 }
    });
    console.log('✅ Skills result preview:', JSON.parse(skillsResult.content[0].text).data?.length, 'skills');

    // Test get_members tool
    console.log('\n👥 Testing get_members tool...');
    const membersResult = await client.send('tools/call', {
      name: 'get_members',
      arguments: { limit: 3, include_skills: true }
    });
    console.log('✅ Members result preview:', JSON.parse(membersResult.content[0].text).data?.length, 'members');

    // Test dashboard summary
    console.log('\n📈 Testing get_dashboard_summary tool...');
    const dashboardResult = await client.send('tools/call', {
      name: 'get_dashboard_summary',
      arguments: {}
    });
    const dashboardData = JSON.parse(dashboardResult.content[0].text);
    console.log('✅ Dashboard summary:', dashboardData.data?.overview);

    console.log('\n🎉 All MCP tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    client.close();
  }
}

// Run tests
testMCPServer().catch(console.error);
```

### 4. Integration with Other MCP Clients

#### Cline (VS Code Extension)

For Cline or similar VS Code extensions:

```json
{
  "cline.mcpServers": {
    "skills-radar": {
      "command": "tsx",
      "args": ["scripts/mcp-stdio-wrapper.ts"],
      "env": {
        "MCP_API_KEY": "sk_your_api_key_here"
      }
    }
  }
}
```

#### Continue (VS Code Extension)

For Continue.dev:

```json
{
  "models": [...],
  "mcpServers": [
    {
      "name": "skills-radar",
      "command": "tsx",
      "args": ["scripts/mcp-stdio-wrapper.ts"],
      "env": {
        "MCP_API_KEY": "sk_your_api_key_here"
      }
    }
  ]
}
```

## 🚀 Quick Setup Guide

### 1. Create the Wrapper Script

```bash
# Create the stdio wrapper
cat > scripts/mcp-stdio-wrapper.ts << 'EOF'
[Copy the wrapper script from above]
EOF

chmod +x scripts/mcp-stdio-wrapper.ts
```

### 2. Set Environment Variables

```bash
export MCP_API_KEY="sk_your_actual_api_key"
export MCP_API_BASE_URL="http://localhost:3000/api/mcp"
```

### 3. Test the Wrapper

```bash
# Test with our custom client
tsx scripts/test-mcp-client.ts

# Or test with MCP Inspector
mcp-inspector tsx scripts/mcp-stdio-wrapper.ts
```

### 4. Configure Your MCP Client

Use the configuration examples above for your specific MCP client.

## 🔧 Advanced Configuration

### Environment Variables

The wrapper script supports these environment variables:

- `MCP_API_KEY` - Your Skills Radar API key (required)
- `MCP_API_BASE_URL` - Base URL for the MCP API (default: http://localhost:3000/api/mcp)
- `MCP_TIMEOUT` - Request timeout in milliseconds (default: 10000)

### Custom Tool Configuration

You can extend the wrapper to add custom tools or modify existing ones:

```typescript
// Add to the tools/list response
{
  name: 'find_experts',
  description: 'Find experts in a specific technology',
  inputSchema: {
    type: 'object',
    properties: {
      technology: { type: 'string', description: 'Technology to search for' },
      min_level: { type: 'number', description: 'Minimum expertise level' }
    },
    required: ['technology']
  }
}
```

## 🧪 Testing Scenarios

### 1. Basic Functionality Test

```bash
# Test all core functions
tsx scripts/test-mcp-client.ts
```

### 2. Claude Desktop Integration Test

1. Add the configuration to Claude Desktop
2. Restart Claude Desktop
3. Ask Claude: "What skills do we have in our team?"
4. Ask Claude: "Find all React developers"
5. Ask Claude: "Show me a summary of our team capabilities"

### 3. Performance Test

```bash
# Test with larger datasets
export MCP_API_KEY="sk_your_key"
tsx -e "
const client = new MCPClient('tsx', ['scripts/mcp-stdio-wrapper.ts']);
// Run multiple concurrent requests
"
```

## 🐛 Troubleshooting

### Common Issues

1. **"MCP_API_KEY environment variable is required"**
   - Ensure you've set the API key: `export MCP_API_KEY="sk_your_key"`

2. **"Connection refused"**
   - Make sure the Skills Radar server is running: `npm run dev`
   - Check the base URL: `export MCP_API_BASE_URL="http://localhost:3000/api/mcp"`

3. **"Invalid API key"**
   - Verify the API key is correct and not revoked
   - Check the key has the required scopes

4. **"Tool not found"**
   - Ensure the wrapper script is up to date
   - Check the tool name matches exactly

### Debug Mode

Enable debug logging:

```bash
export DEBUG=mcp:*
tsx scripts/mcp-stdio-wrapper.ts
```

## 📚 Additional Resources

- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
- [Claude Desktop MCP Guide](https://docs.anthropic.com/claude/docs/mcp)
- [Skills Radar MCP API Documentation](./MCP_SERVER_README.md)