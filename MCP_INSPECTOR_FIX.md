# MCP Inspector Fix Guide

## 🚨 Problem
The MCP Inspector shows this error:
```
Error: spawn tsx ENOENT
```

This happens because `tsx` is installed locally in the project but not globally, so the inspector can't find it.

## ✅ Solutions

### Solution 1: Use npx (Recommended)

Stop the current inspector and restart with:

```bash
export MCP_API_KEY="sk_your_actual_api_key"
mcp-inspector npx tsx scripts/mcp-stdio-wrapper.ts
```

### Solution 2: Use Node.js wrapper

```bash
export MCP_API_KEY="sk_your_actual_api_key"
mcp-inspector node scripts/mcp-wrapper.js
```

### Solution 3: Use shell wrapper

```bash
export MCP_API_KEY="sk_your_actual_api_key"
mcp-inspector bash scripts/mcp-wrapper.sh
```

### Solution 4: Install tsx globally

```bash
npm install -g tsx
export MCP_API_KEY="sk_your_actual_api_key"
mcp-inspector tsx scripts/mcp-stdio-wrapper.ts
```

## 🎯 Quick Test

First, make sure you have a valid API key and the server is running:

```bash
# 1. Start the Skills Radar server (in another terminal)
npm run dev

# 2. Create an API key at http://localhost:3000/admin/api-keys

# 3. Set your API key
export MCP_API_KEY="sk_your_actual_api_key"

# 4. Test the wrapper directly
npx tsx scripts/mcp-stdio-wrapper.ts

# 5. If that works, run the inspector
mcp-inspector npx tsx scripts/mcp-stdio-wrapper.ts
```

## 🔧 Troubleshooting

### If you still get errors:

1. **Check your API key is set**:
   ```bash
   echo $MCP_API_KEY
   ```

2. **Verify the server is running**:
   ```bash
   curl http://localhost:3000/api/mcp/skills -H "x-api-key: $MCP_API_KEY"
   ```

3. **Test the wrapper manually**:
   ```bash
   echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' | npx tsx scripts/mcp-stdio-wrapper.ts
   ```

## 📋 Updated Configurations

### For Claude Desktop

Use one of these configurations in your Claude Desktop settings:

#### Option 1: npx (Recommended)
```json
{
  "mcpServers": {
    "skills-radar": {
      "command": "npx",
      "args": ["tsx", "scripts/mcp-stdio-wrapper.ts"],
      "env": {
        "MCP_API_KEY": "sk_your_api_key_here"
      }
    }
  }
}
```

#### Option 2: Node.js wrapper
```json
{
  "mcpServers": {
    "skills-radar": {
      "command": "node",
      "args": ["scripts/mcp-wrapper.js"],
      "env": {
        "MCP_API_KEY": "sk_your_api_key_here"
      }
    }
  }
}
```

### For Other MCP Clients

Replace `tsx` with `npx tsx` in any MCP client configuration.

## ✅ Success Indicators

You'll know it's working when:

1. **No "ENOENT" errors** in the inspector
2. **Server shows as connected** in the web interface
3. **4 tools are listed**: get_skills, get_members, get_dashboard_summary, find_experts
4. **Tools execute successfully** and return data

## 🎉 Next Steps

Once the inspector is working:

1. **Test all 4 tools** in the web interface
2. **Verify data quality** (realistic names, skills, etc.)
3. **Configure Claude Desktop** with the working command
4. **Test in Claude** with queries like "What skills do we have?"

## 📞 Still Having Issues?

If you continue to have problems:

1. **Check the project structure**:
   ```bash
   ls -la scripts/
   ```

2. **Verify tsx is installed**:
   ```bash
   npm list tsx
   ```

3. **Test direct API access**:
   ```bash
   npm run test:mcp
   ```

4. **Check for any missing dependencies**:
   ```bash
   npm install
   ```