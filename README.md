# Techie Skills Radar

A full-stack web application for managing and visualizing the skills of team members ("Techies") in your organization. Built with Next.js, TypeScript, Tailwind CSS, and PostgreSQL.

## Features

### Core Entities Management (CRUD)
- **Knowledge Areas**: Define and organize knowledge domains
- **Skill Categories**: Organize skills into meaningful categories  
- **Skills**: Define individual skills and competencies
- **Scales**: Create rating scales for skill assessment (numeric, qualitative, boolean)
- **Members (Techies)**: Manage team member information and profiles
- **Member Profiles**: Detailed profiles with assignments, roles, feedback, etc.

### Import/Export
- Import team members from Excel/CSV files
- Template download for proper data formatting
- Bulk import with validation and error reporting

### Dashboard & Analytics
- Overview dashboard with key metrics
- Advanced talent search with multiple filters
- Filter by name, category, skills, location, client, hire date
- Availability tracking (assigned vs. available talent)

### 🤖 MCP Server & AI Integration
- **Internal MCP Server** with authenticated API endpoints
- **LLM-optimized data structures** for easy AI consumption
- **OpenAPI specification** for seamless integrations
- **Secure API key management** with scope-based permissions
- **Real-time insights** and aggregated analytics

### Use Cases Supported
- **Sales Team**: Find available talent by skill for client conversations
- **Solutions Team**: Identify skill gaps and experts for learning programs  
- **People Team**: Review member growth and suggest career opportunities
- **Production Team**: Explore peer profiles for collaboration
- **AI Applications**: Query talent data through natural language with LLMs
- **Custom Integrations**: Build AI-powered tools using the MCP API

## Tech Stack

- **Frontend**: Next.js 15 with App Router, React Server Components
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Language**: TypeScript
- **Containerization**: Docker for PostgreSQL

## Getting Started

### Prerequisites
- Node.js 18+ 
- Docker (for PostgreSQL)
- npm or yarn

### Installation

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd skills-radar-qodo
   npm install
   ```

2. **Start the database**:
   ```bash
   npm run db:start
   ```

3. **Generate Prisma client and run migrations**:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open the application**:
   Navigate to [http://localhost:3000](http://localhost:3000)

6. **Set up MCP Server (Optional)**:
   - Navigate to `/admin/api-keys` to create API keys
   - Test the MCP endpoints with `npm run test:mcp`

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:start` - Start PostgreSQL with Docker
- `npm run db:stop` - Stop PostgreSQL container
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:studio` - Open Prisma Studio
- `npm run test:mcp` - Test MCP API endpoints

## Application Structure

### Pages
- **Home** (`/`) - Main dashboard with navigation cards
- **Admin Pages**:
  - `/admin/knowledge-areas` - Manage knowledge areas
  - `/admin/skill-categories` - Manage skill categories  
  - `/admin/skills` - Manage skills
  - `/admin/scales` - Manage rating scales
  - `/admin/members` - Manage team members
  - `/admin/members/import` - Import members from Excel/CSV
  - `/admin/api-keys` - Manage MCP API keys
- **Dashboard Pages**:
  - `/dashboard` - Overview with filtering
  - `/dashboard/talent-search` - Advanced talent search

### API Endpoints

#### Standard CRUD APIs
All entities support full CRUD operations:
- `GET/POST /api/knowledge-areas`
- `GET/PUT/DELETE /api/knowledge-areas/[id]`
- `GET/POST /api/skill-categories`
- `GET/PUT/DELETE /api/skill-categories/[id]`
- `GET/POST /api/skills`
- `GET/PUT/DELETE /api/skills/[id]`
- `GET/POST /api/scales`
- `GET/PUT/DELETE /api/scales/[id]`
- `GET/POST /api/members`
- `GET/PUT/DELETE /api/members/[id]`
- `POST /api/members/import` - Import from CSV/Excel

#### MCP Server APIs (Authenticated)
LLM-optimized endpoints for AI integration:
- `GET /api/mcp/skills` - Skills with categories and knowledge areas
- `GET /api/mcp/members` - Members with comprehensive filtering
- `GET /api/mcp/dashboards/summary` - Aggregated insights and analytics
- `GET /api/openapi.json` - OpenAPI specification

#### Admin APIs
- `GET/POST /api/admin/api-keys` - Create and list API keys
- `DELETE /api/admin/api-keys/[keyId]` - Revoke API keys

### Database Schema

The application uses the following main entities:

- **KnowledgeArea**: `id`, `name`, `description`
- **SkillCategory**: `id`, `name`, `groupingCriteria`
- **Skill**: `id`, `name`, `purpose`, `knowledgeAreaId`, `categoryId`, `scaleId`
- **Scale**: `id`, `name`, `type`, `values`
- **Member**: `id`, `email`, `fullName`, `hireDate`, `currentClient`, `category`, `location`
- **MemberProfile**: `id`, `memberId`, `assignments`, `teamRoles`, `clientAppreciations`, `feedback`, `talentPoolPeriods`
- **ApiKey**: `id`, `label`, `keyHash`, `salt`, `ownerId`, `scopes`, `createdAt`, `lastUsedAt`, `revoked`

## 🤖 MCP Server & AI Integration

The Skills Radar includes a built-in **Model Context Protocol (MCP) Server** that provides authenticated API endpoints specifically designed for AI and LLM consumption. This enables seamless integration with various AI providers and custom applications.

### 🚀 Key Features

- **🔐 Secure Authentication**: API key-based authentication with scope-based permissions
- **🧠 LLM-Optimized**: Flat JSON structures with descriptive keys for easy AI parsing
- **📊 Rich Data Access**: Comprehensive filtering, pagination, and aggregated insights
- **📖 OpenAPI Spec**: Machine-readable API documentation for easy integration
- **⚡ Real-time**: Live data access with usage tracking and monitoring

### 🔑 API Key Management

#### Creating API Keys

1. **Admin Access Required**: Navigate to `/admin/api-keys` (admin permissions required)
2. **Create New Key**: Click "Create API Key" and provide:
   - **Label**: Descriptive name (e.g., "ChatGPT Integration", "LangChain App")
   - **Scopes**: Choose permissions:
     - `skills:read` - Access to skills data
     - `members:read` - Access to member data
     - `dashboards:read` - Access to analytics data
     - `*` - Full access to all endpoints

3. **Secure Storage**: Copy the API key immediately - it's only shown once!

#### Security Features

- **🔒 Secure Hashing**: Keys stored as SHA-256 hashes with salt
- **📊 Usage Tracking**: Monitor last used timestamps
- **🚫 Instant Revocation**: Disable keys immediately when needed
- **🎯 Scope-based Access**: Fine-grained permission control

### 📡 MCP API Endpoints

All MCP endpoints require the `x-api-key` header for authentication:

```bash
curl -H "x-api-key: sk_your_api_key_here" \
     "http://localhost:3000/api/mcp/skills"
```

#### 1. Skills Endpoint
**GET** `/api/mcp/skills`

Returns all skills with categories and knowledge areas.

**Query Parameters:**
- `knowledge_area_id` - Filter by knowledge area
- `category_id` - Filter by skill category
- `include_members` - Include member information
- `limit` / `offset` - Pagination controls

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
        "name": "JavaScript Frameworks"
      }
    }
  ],
  "metadata": {
    "total_count": 150,
    "returned_count": 1,
    "has_more": true
  }
}
```

#### 2. Members Endpoint
**GET** `/api/mcp/members`

Returns team members with comprehensive filtering options.

**Query Parameters:**
- `knowledge_area_id` - Filter by knowledge area
- `skill_id` - Filter by specific skill
- `current_client` - Filter by client assignment
- `category` - Filter by member category
- `min_expertise_level` - Minimum skill level
- `include_skills` - Include skill details
- `include_profile` - Include profile information

**Example Response:**
```json
{
  "data": [
    {
      "member_id": 1,
      "email": "john.doe@example.com",
      "full_name": "John Doe",
      "current_client": "TechCorp",
      "category": "Senior Developer",
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
  ]
}
```

#### 3. Dashboard Summary Endpoint
**GET** `/api/mcp/dashboards/summary`

Returns aggregated insights and analytics.

**Example Response:**
```json
{
  "data": {
    "overview": {
      "total_members": 50,
      "total_skills": 150,
      "total_knowledge_areas": 8
    },
    "members_by_knowledge_area": [...],
    "top_skills_by_member_count": [...],
    "recent_skill_assessments": [...]
  }
}
```

### 🔗 AI Provider Integrations

The MCP Server is designed to work seamlessly with various AI providers and frameworks:

#### 🤖 ChatGPT / OpenAI GPTs

Create custom GPTs that can query your talent data:

1. **Create a Custom GPT** in ChatGPT
2. **Add Actions** using the OpenAPI spec from `/api/openapi.json`
3. **Configure Authentication** with your API key
4. **Example Prompts**:
   - "Find all React developers available for a new project"
   - "Show me the skill distribution across our frontend team"
   - "Who are our most experienced Python developers?"

#### 🦜 LangChain Integration

Build sophisticated AI applications with LangChain:

```python
import requests
from langchain.tools import Tool

def query_skills(query: str) -> str:
    """Query the Skills Radar MCP API"""
    headers = {"x-api-key": "sk_your_api_key_here"}
    response = requests.get(
        "http://localhost:3000/api/mcp/skills",
        headers=headers,
        params={"include_members": True}
    )
    return response.json()

skills_tool = Tool(
    name="Skills Radar",
    description="Query team skills and member data",
    func=query_skills
)
```

#### 🔮 Claude / Anthropic

Use with Claude's function calling capabilities:

```json
{
  "name": "query_talent_data",
  "description": "Query team member skills and availability",
  "input_schema": {
    "type": "object",
    "properties": {
      "endpoint": {"type": "string"},
      "filters": {"type": "object"}
    }
  }
}
```

#### 🧠 Custom AI Applications

Build your own AI-powered tools:

- **Talent Matching**: AI-powered project staffing recommendations
- **Skill Gap Analysis**: Identify training needs and opportunities
- **Career Guidance**: Personalized development suggestions
- **Resource Planning**: Optimize team allocation across projects

### 📖 OpenAPI Specification

Access the complete API documentation at:
```
GET /api/openapi.json
```

This provides a machine-readable specification that can be imported into:
- **Swagger UI** for interactive documentation
- **Postman** for API testing
- **GPT Actions** for ChatGPT integration
- **LangChain** for tool creation
- **Custom applications** for automated integration

### 🧪 Testing the MCP Server

#### HTTP API Testing

```bash
# Set your API key
export MCP_API_KEY="sk_your_actual_api_key_here"

# Test HTTP endpoints directly
npm run test:mcp
```

#### MCP Client Testing (Claude Desktop, etc.)

For testing with standard MCP clients that expect stdio-based servers:

```bash
# Test the MCP stdio wrapper
npm run test:mcp-client

# Or test with MCP Inspector
npm install -g @modelcontextprotocol/inspector
mcp-inspector tsx scripts/mcp-stdio-wrapper.ts
```

#### Claude Desktop Integration

1. **Copy the configuration** from `claude-desktop-config.json`
2. **Update your API key** in the configuration
3. **Add to Claude Desktop settings** (usually `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS)
4. **Restart Claude Desktop**
5. **Test with prompts** like:
   - "What skills do we have in our team?"
   - "Find all React developers"
   - "Show me experts in Python with level 3+ expertise"

#### Manual Testing

```bash
# Test skills endpoint
curl -H "x-api-key: sk_your_key" \
     "http://localhost:3000/api/mcp/skills?limit=5"

# Test members with skills
curl -H "x-api-key: sk_your_key" \
     "http://localhost:3000/api/mcp/members?include_skills=true&limit=3"

# Test dashboard summary
curl -H "x-api-key: sk_your_key" \
     "http://localhost:3000/api/mcp/dashboards/summary"
```

### 🎯 Use Cases for AI Integration

#### Sales & Business Development
- **"Find available React developers for a 6-month project"**
- **"Show me our team's expertise in cloud technologies"**
- **"Which team members have worked with fintech clients?"**

#### Learning & Development
- **"Identify skill gaps in our data science team"**
- **"Who could mentor junior developers in Python?"**
- **"What are the most in-demand skills we're missing?"**

#### Project Management
- **"Recommend team composition for a mobile app project"**
- **"Find experts in microservices architecture"**
- **"Show availability of senior developers next quarter"**

#### HR & People Operations
- **"Generate career development suggestions for John"**
- **"Analyze skill distribution across different locations"**
- **"Track skill growth over time for performance reviews"**

### 🔧 Advanced Configuration

#### Rate Limiting (Future Enhancement)
```typescript
// Example configuration for rate limiting
const rateLimits = {
  "skills:read": { requests: 100, window: "1h" },
  "members:read": { requests: 50, window: "1h" },
  "*": { requests: 200, window: "1h" }
};
```

#### Caching (Future Enhancement)
```typescript
// Example Redis caching configuration
const cacheConfig = {
  skills: { ttl: 300 }, // 5 minutes
  members: { ttl: 600 }, // 10 minutes
  dashboard: { ttl: 900 } // 15 minutes
};
```

### 📚 Additional Resources

- **[MCP Server Documentation](./MCP_SERVER_README.md)** - Detailed technical documentation
- **[MCP Client Integration Guide](./MCP_CLIENT_INTEGRATION.md)** - How to integrate with Claude Desktop and other MCP clients
- **[OpenAPI Spec](http://localhost:3000/api/openapi.json)** - Complete API reference
- **[Test Scripts](./scripts/)** - Automated testing examples
- **[Claude Desktop Config](./claude-desktop-config.json)** - Ready-to-use configuration template

## Usage Guide

### Quick Start with MCP Server

To quickly get started with AI integration:

1. **Complete the basic setup** (database, migrations, seeding)
2. **Create an admin user** and log in
3. **Navigate to `/admin/api-keys`** to create your first API key
4. **Test the MCP endpoints**:
   ```bash
   export MCP_API_KEY="sk_your_new_api_key"
   npm run test:mcp
   ```
5. **Use the OpenAPI spec** at `/api/openapi.json` for integration

### Getting Started
1. **Set up basic data**:
   - Create Knowledge Areas (e.g., "Frontend Development", "Data Science")
   - Create Skill Categories (e.g., "Programming Languages", "Frameworks")
   - Create Scales (e.g., "1,2,3,4,5" for numeric rating)
   - Create Skills and associate them with areas, categories, and scales

2. **Add team members**:
   - Use the Members admin page to add individual members
   - Or use the Import feature to bulk import from Excel/CSV
   - Categories: Starter, Builder, Solver, Wizard

3. **Use the dashboard**:
   - View overview statistics
   - Filter members by various criteria
   - Use advanced search for talent discovery

### Import Format
When importing members, use this CSV format:
```csv
fullName,email,hireDate,currentClient,category,location
John Doe,john.doe@example.com,2023-01-15,Acme Corp,Builder,New York
Jane Smith,jane.smith@example.com,2023-02-20,Tech Solutions,Solver,San Francisco
```

Required fields: `fullName`, `email`, `hireDate`, `category`
Valid categories: `Starter`, `Builder`, `Solver`, `Wizard`

## Development

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin CRUD pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/
│   └── ui/                # Reusable UI components
├── lib/
│   └── prisma.ts          # Prisma client setup
└── generated/
    └── prisma/            # Generated Prisma client
```

### Adding New Features
1. **New Entity**: Add to Prisma schema, create migration, generate client
2. **New API Route**: Create route handlers in `src/app/api/`
3. **New Admin Page**: Create CRUD interface in `src/app/admin/`
4. **New Dashboard View**: Add to `src/app/dashboard/`

## Environment Variables

Create a `.env` file with:
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/skillsradar"

# Authentication (if using NextAuth)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth (if using Google authentication)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# MCP API Testing (optional)
MCP_API_KEY="sk_your_api_key_for_testing"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Data Seeding

The application supports two types of data seeding:

### Standard Seeding
```bash
npm run seed
```
Uses the original `skills.csv` format with basic member and skill data.

### Expanded Data Seeding
```bash
npm run seed:expanded
```
Uses the `skills_expanded_data.csv` format which includes:
- Detailed member information with full names
- Techie categories (Starter, Builder, Solver, Wizard)
- Client assignments
- Comprehensive skill assessments with expertise levels
- Automatic email generation from member names

The expanded seeding automatically:
- Creates members with generated emails (e.g., "John Doe" → "john.doe@techietalent.net")
- Maps techie categories to member categories
- Associates members with their assigned clients
- Creates skill-member relationships with expertise levels

### Expanded Data Format
The expanded CSV format expects data in this structure:
```
Skill Category,Skill Name,Member Name,Techie Category,Assigned Client,Expertise,Expertise Ranking
Tools,Jenkins,Lucas Emiliano Luna,Techie Solver,Lunavi,Don't know / Heard of it / I have an idea,1
```

The parser handles malformed CSV data and extracts:
- **Skill Category**: Tools, Technologies, Testing, Cloud services, Databases, Servers and runtimes
- **Skill Name**: Individual skill (e.g., Jenkins, Kubernetes, React)
- **Member Name**: Full name of the team member
- **Techie Category**: Techie Starter/Builder/Solver/Wizard (mapped to Starter/Builder/Solver/Wizard)
- **Assigned Client**: Current client assignment
- **Expertise**: Descriptive expertise level
- **Expertise Ranking**: Numeric level (1-4)

