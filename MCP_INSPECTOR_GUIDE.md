# MCP Inspector Testing Guide

The MCP Inspector is now running! Here's how to test your Skills Radar MCP Server.

## 🎯 Current Status

✅ **MCP Inspector**: Running at http://127.0.0.1:6274  
✅ **Proxy Server**: Listening on port 6277  
✅ **Skills Radar MCP Server**: Connected via stdio wrapper  

## 🧪 Testing Steps

### 1. Open the Inspector Interface

Navigate to: **http://127.0.0.1:6274**

You should see the MCP Inspector web interface with your Skills Radar server connected.

### 2. Initialize the Connection

In the inspector interface, you should see:
- **Server Info**: `skills-radar-mcp v1.0.0`
- **Protocol Version**: `2024-11-05`
- **Available Tools**: 4 tools should be listed

### 3. Test Each Tool

#### 🎯 Tool 1: `get_skills`
**Purpose**: Retrieve skills data with filtering options

**Test Parameters**:
```json
{
  "limit": 5,
  "include_members": true
}
```

**Expected Result**: List of skills with knowledge areas and categories

#### 👥 Tool 2: `get_members`
**Purpose**: Retrieve team members with comprehensive filtering

**Test Parameters**:
```json
{
  "limit": 5,
  "include_skills": true,
  "category": "Builder"
}
```

**Expected Result**: List of team members with their skills

#### 📊 Tool 3: `get_dashboard_summary`
**Purpose**: Get aggregated insights and analytics

**Test Parameters**:
```json
{}
```

**Expected Result**: Comprehensive dashboard data with team statistics

#### 🔍 Tool 4: `find_experts`
**Purpose**: Find experts in specific technologies (Custom tool)

**Test Parameters**:
```json
{
  "skill_name": "React",
  "min_expertise_level": 3
}
```

**Expected Result**: List of React experts with level 3+ expertise

## 🎮 Interactive Testing Scenarios

### Scenario 1: Talent Discovery
1. **Use `get_skills`** to see available skills
2. **Pick a skill** from the results
3. **Use `find_experts`** with that skill name
4. **Verify results** show relevant team members

### Scenario 2: Team Analysis
1. **Use `get_dashboard_summary`** to get overview
2. **Use `get_members`** with `include_skills: true`
3. **Compare results** with dashboard statistics

### Scenario 3: Client Staffing
1. **Use `get_members`** with no `current_client` filter
2. **Use `find_experts`** for required skills
3. **Cross-reference** available talent

## 🔧 Troubleshooting

### Common Issues and Solutions

#### ❌ "MCP_API_KEY environment variable is required"
**Solution**: Set your API key before running the inspector
```bash
export MCP_API_KEY="sk_your_actual_api_key"
mcp-inspector tsx scripts/mcp-stdio-wrapper.ts
```

#### ❌ "Connection refused" or HTTP errors
**Solutions**:
1. **Check Skills Radar server is running**:
   ```bash
   npm run dev  # In another terminal
   ```
2. **Verify the base URL**:
   ```bash
   export MCP_API_BASE_URL="http://localhost:3000/api/mcp"
   ```
3. **Test direct API access**:
   ```bash
   curl -H "x-api-key: $MCP_API_KEY" http://localhost:3000/api/mcp/skills
   ```

#### ❌ "Invalid API key" errors
**Solutions**:
1. **Create a new API key** at `/admin/api-keys`
2. **Verify key has correct scopes**: `skills:read`, `members:read`, `dashboards:read`
3. **Check key is not revoked**

#### ❌ Empty results or "No data found"
**Solutions**:
1. **Seed the database**:
   ```bash
   npm run seed:expanded
   ```
2. **Check database connection**:
   ```bash
   npm run prisma:studio
   ```

### Debug Mode

Enable detailed logging:
```bash
export DEBUG=mcp:*
export MCP_API_KEY="sk_your_key"
mcp-inspector tsx scripts/mcp-stdio-wrapper.ts
```

## 📋 Test Checklist

Use this checklist to verify everything is working:

### ✅ Basic Connectivity
- [ ] Inspector loads at http://127.0.0.1:6274
- [ ] Server shows as connected
- [ ] 4 tools are listed
- [ ] No connection errors in console

### ✅ Tool Functionality
- [ ] `get_skills` returns skill data
- [ ] `get_members` returns member data
- [ ] `get_dashboard_summary` returns analytics
- [ ] `find_experts` finds relevant experts

### ✅ Data Quality
- [ ] Skills have knowledge areas and categories
- [ ] Members have realistic data (names, emails, etc.)
- [ ] Dashboard shows non-zero counts
- [ ] Expert search returns appropriate results

### ✅ Error Handling
- [ ] Invalid skill names handled gracefully
- [ ] Empty results return helpful messages
- [ ] API errors are properly formatted

## 🚀 Next Steps

### 1. Claude Desktop Integration
Once testing is successful, configure Claude Desktop:

```json
{
  "mcpServers": {
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

### 2. Custom Tool Development
Extend the wrapper with additional tools:
- `get_skill_gaps` - Identify missing skills
- `recommend_training` - Suggest learning paths
- `project_staffing` - Recommend team composition

### 3. Production Deployment
For production use:
- Set up proper environment variables
- Configure rate limiting
- Add monitoring and logging
- Set up SSL/TLS for secure connections

## 📊 Sample Test Data

If you need sample data for testing, here are some realistic test scenarios:

### Frontend Development Team Query
```json
{
  "skill_name": "React",
  "min_expertise_level": 2
}
```

### Backend Expertise Search
```json
{
  "skill_name": "Node.js",
  "min_expertise_level": 3
}
```

### Available Talent Check
```json
{
  "current_client": "",
  "include_skills": true,
  "limit": 10
}
```

## 🎯 Success Indicators

You'll know everything is working when:

1. **Inspector shows green status** for server connection
2. **All 4 tools execute successfully** without errors
3. **Data returned matches expectations** (realistic names, skills, etc.)
4. **Custom `find_experts` tool** returns relevant results
5. **Dashboard summary** shows comprehensive team statistics

## 📞 Support

If you encounter issues:

1. **Check the console logs** in the inspector interface
2. **Review the terminal output** where you started the inspector
3. **Test direct HTTP API** with `npm run test:mcp`
4. **Verify database has data** with `npm run prisma:studio`

Happy testing! 🎉