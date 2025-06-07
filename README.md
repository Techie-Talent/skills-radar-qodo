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

### Use Cases Supported
- **Sales Team**: Find available talent by skill for client conversations
- **Solutions Team**: Identify skill gaps and experts for learning programs  
- **People Team**: Review member growth and suggest career opportunities
- **Production Team**: Explore peer profiles for collaboration

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
- **Dashboard Pages**:
  - `/dashboard` - Overview with filtering
  - `/dashboard/talent-search` - Advanced talent search

### API Endpoints
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

### Database Schema

The application uses the following main entities:

- **KnowledgeArea**: `id`, `name`, `description`
- **SkillCategory**: `id`, `name`, `groupingCriteria`
- **Skill**: `id`, `name`, `purpose`, `knowledgeAreaId`, `categoryId`, `scaleId`
- **Scale**: `id`, `name`, `type`, `values`
- **Member**: `id`, `email`, `fullName`, `hireDate`, `currentClient`, `category`, `location`
- **MemberProfile**: `id`, `memberId`, `assignments`, `teamRoles`, `clientAppreciations`, `feedback`, `talentPoolPeriods`

## Usage Guide

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
DATABASE_URL="postgresql://postgres:password@localhost:5432/skillsradar"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.