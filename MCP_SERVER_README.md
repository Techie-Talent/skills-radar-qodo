# Skills Radar MCP Server

This document describes the internal MCP (Model Context Protocol) Server implementation for the Skills Radar application. The MCP Server provides authenticated API endpoints for accessing skills and member data, designed specifically for LLM consumption.

## 🚀 Features

- **Authenticated API endpoints** with API key management
- **LLM-optimized data structures** with flat, well-named JSON keys
- **Comprehensive filtering and pagination** support
- **Admin-only API key management** with secure hashing
- **OpenAPI specification** for easy integration
- **Real-time dashboard insights** and aggregated data

## 📋 API Endpoints

### Base URL
```
/api/mcp
```

### Authentication
All MCP endpoints require authentication via the `x-api-key` header:

```bash
curl -H "x-api-key: sk_your_api_key_here" http://localhost:3000/api/mcp/skills
```

### Available Endpoints

#### 1. Skills Endpoint
**GET** `/api/mcp/skills`

Returns all skills with categories and knowledge areas.

**Query Parameters:**
- `knowledge_area_id` (integer): Filter by knowledge area ID
- `category_id` (integer): Filter by skill category ID  
- `include_members` (boolean): Include member information for each skill
- `limit` (integer, default: 100): Maximum number of results
- `offset` (integer, default: 0): Number of results to skip

**Example Response:**
```json
{
  "data": [
    {
      "skill_id": 1,
      "skill_name": "React",
      "skill_purpose": "Frontend development framework",
      "knowledge_area": {
        "id": 1,
        "name": "Frontend Development",
        "description": "Client-side web development"
      },
      "category": {
        "id": 1,
        "name": "JavaScript Frameworks",
        "grouping_criteria": "Frontend frameworks"
      },
      "scale": {
        "id": 1,
        "name": "Expertise Level",
        "type": "numeric",
        "values": ["1", "2", "3", "4"]
      }
    }
  ],
  "metadata": {
    "total_count": 150,
    "returned_count": 1,
    "limit": 100,
    "offset": 0,
    "has_more": true
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### 2. Members Endpoint
**GET** `/api/mcp/members`

Returns all members with filters by knowledge area, skill, and client.

**Query Parameters:**
- `knowledge_area_id` (integer): Filter by knowledge area ID
- `skill_id` (integer): Filter by skill ID
- `current_client` (string): Filter by current client
- `category` (string): Filter by member category
- `min_expertise_level` (integer): Filter by minimum expertise level
- `include_skills` (boolean): Include skill information for each member
- `include_profile` (boolean): Include profile information for each member
- `limit` (integer, default: 100): Maximum number of results
- `offset` (integer, default: 0): Number of results to skip

**Example Response:**
```json
{
  "data": [
    {
      "member_id": 1,
      "email": "john.doe@example.com",
      "full_name": "John Doe",
      "hire_date": "2023-01-15T00:00:00Z",
      "current_client": "TechCorp",
      "category": "Senior Developer",
      "location": "New York",
      "skills_count": 15,
      "skills_by_knowledge_area": {
        "Frontend Development": [
          {
            "skill_name": "React",
            "expertise_level": 4,
            "expertise_description": "Expert level"
          }
        ]
      }
    }
  ],
  "metadata": {
    "total_count": 50,
    "returned_count": 1,
    "limit": 100,
    "offset": 0,
    "has_more": false
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### 3. Dashboard Summary Endpoint
**GET** `/api/mcp/dashboards/summary`

Returns aggregated insights and statistics.

**Example Response:**
```json
{
  "data": {
    "overview": {
      "total_members": 50,
      "total_skills": 150,
      "total_knowledge_areas": 8,
      "total_skill_categories": 12,
      "total_skill_assessments": 750
    },
    "members_by_knowledge_area": [
      {
        "knowledge_area_id": 1,
        "knowledge_area_name": "Frontend Development",
        "unique_members_count": 25,
        "skills_count": 30
      }
    ],
    "top_skills_by_member_count": [
      {
        "skill_id": 1,
        "skill_name": "JavaScript",
        "knowledge_area": "Frontend Development",
        "members_count": 45
      }
    ]
  },
  "metadata": {
    "generated_at": "2024-01-15T10:30:00Z",
    "data_freshness": "real-time"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🔐 API Key Management

### Creating API Keys

1. Navigate to `/admin/api-keys` in the admin interface
2. Click "Create API Key"
3. Provide a descriptive label
4. Select the required scopes:
   - `skills:read` - Read access to skills data
   - `members:read` - Read access to members data  
   - `dashboards:read` - Read access to dashboard data
   - `*` - Full access to all endpoints
4. Click "Create API Key"
5. **Important**: Copy the API key immediately - it will only be shown once!

### Security Features

- **Secure hashing**: API keys are hashed using SHA-256 with salt
- **Scope-based permissions**: Fine-grained access control
- **Usage tracking**: Last used timestamps for monitoring
- **Revocation**: Instant key revocation capability
- **Admin-only access**: Only users with admin permissions can manage keys

### API Key Format
```
sk_[64-character-hex-string]
```

## 📖 OpenAPI Specification

The complete OpenAPI specification is available at:
```
GET /api/openapi.json
```

This endpoint provides a machine-readable API specification that can be used with:
- **GPT Actions** in ChatGPT
- **LangChain** API integrations
- **Swagger UI** for documentation
- **Postman** for testing

## 🧪 Testing the API

### Using the Test Script

A test script is provided to verify all endpoints:

```bash
# Set your API key
export MCP_API_KEY="sk_your_actual_api_key_here"

# Run the test script
tsx scripts/test-mcp-api.ts
```

### Manual Testing with curl

```bash
# Test skills endpoint
curl -H "x-api-key: sk_your_key" \
     "http://localhost:3000/api/mcp/skills?limit=5"

# Test members endpoint with filters
curl -H "x-api-key: sk_your_key" \
     "http://localhost:3000/api/mcp/members?include_skills=true&limit=3"

# Test dashboard summary
curl -H "x-api-key: sk_your_key" \
     "http://localhost:3000/api/mcp/dashboards/summary"
```

## 🔧 Implementation Details

### Database Schema

The MCP Server uses a new `ApiKey` model:

```prisma
model ApiKey {
  id         String    @id @default(cuid())
  label      String
  keyHash    String    @unique
  salt       String
  owner      User      @relation(fields: [ownerId], references: [id])
  ownerId    String
  scopes     String[]
  createdAt  DateTime  @default(now())
  lastUsedAt DateTime?
  revoked    Boolean   @default(false)
  revokedAt  DateTime?
}
```

### File Structure

```
src/
├── app/api/mcp/                    # MCP API endpoints
│   ├── skills/route.ts             # Skills endpoint
│   ├── members/route.ts            # Members endpoint
│   └── dashboards/summary/route.ts # Dashboard endpoint
├── app/api/admin/api-keys/         # API key management
│   ├── route.ts                    # Create/list keys
│   └── [keyId]/route.ts           # Revoke keys
├── app/admin/api-keys/             # Admin UI
│   ├── page.tsx                    # Main page
│   ├── api-keys-client.tsx        # Client component
│   └── loading.tsx                 # Loading state
├─�� lib/
│   ├── api-keys.ts                 # API key utilities
│   └── mcp-auth.ts                 # Authentication middleware
└── scripts/
    └── test-mcp-api.ts            # Test script
```

### LLM Optimization

The API responses are specifically designed for LLM consumption:

1. **Flat structure**: Minimal nesting for easier parsing
2. **Descriptive keys**: `skill_name` instead of `name`
3. **Consistent naming**: Snake_case for all keys
4. **Rich metadata**: Pagination, counts, and filtering info
5. **Grouped data**: Skills grouped by knowledge area for context

## 🚀 Next Steps

### Potential Enhancements

1. **LangChain Integration**: Add embedding support for semantic search
2. **Rate Limiting**: Implement request rate limiting per API key
3. **Caching**: Add Redis caching for frequently accessed data
4. **Webhooks**: Real-time notifications for data changes
5. **GraphQL**: Alternative query interface for complex data needs
6. **Playground**: Internal testing interface for prompt development

### Usage Examples

The MCP Server is designed to be easily consumed by:

- **ChatGPT Custom GPTs** with API actions
- **LangChain applications** for RAG implementations  
- **Internal tools** for data analysis and reporting
- **Third-party integrations** via the OpenAPI spec

## 📞 Support

For questions or issues with the MCP Server:

1. Check the OpenAPI specification at `/api/openapi.json`
2. Run the test script to verify functionality
3. Review the admin interface for API key management
4. Check server logs for detailed error information