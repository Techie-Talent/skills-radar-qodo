# Techie Skills Radar - Authentication & Authorization Guide

## 🔐 Authentication Features

The Techie Skills Radar now includes comprehensive authentication and authorization features:

### ✅ **Google Sign-In Integration**
- Secure OAuth 2.0 authentication with Google
- Automatic user creation on first sign-in
- Profile information sync (name, email, profile picture)

### ✅ **Dynamic Role Management**
- Create, edit, and delete custom roles
- Assign specific permissions to each role
- Set default roles for new users
- Role-based access control throughout the application

### ✅ **Granular Permissions System**
- **Admin**: Full system access including user and role management
- **Users**: View, create, edit, and delete users
- **Roles**: Manage roles and permissions
- **Members**: Team member management
- **Skills**: Skills, knowledge areas, categories, and scales management
- **Dashboard**: Access to analytics and reporting

### ✅ **Admin Panel**
- User management interface (accessible to admins only)
- Role assignment and management
- Permission configuration
- User activity tracking

## 🚀 **Setup Instructions**

### 1. **Google OAuth Setup**

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create OAuth 2.0 Client IDs
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

### 2. **Environment Variables**

Update your `.env` file with the Google OAuth credentials:

```env
# Database
DATABASE_URL="postgresql://techie:techie@localhost:5432/skillsradar"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. **Database Setup**

The authentication system requires additional database tables. Run the migration:

```bash
npx prisma migrate dev --name add-auth-and-roles
npx prisma generate
```

### 4. **Seed Default Roles and Permissions**

```bash
npx tsx scripts/seed.ts
```

This creates three default roles:
- **Admin**: Full system access
- **Manager**: Can manage team members and view all data
- **Member**: Basic access to view data (default for new users)

## 🔑 **Permission System**

### Permission Categories

- **admin**: Full administrative access
- **users**: User management
- **roles**: Role and permission management
- **members**: Team member management
- **skills**: Skills management
- **knowledge_areas**: Knowledge areas management
- **skill_categories**: Skill categories management
- **scales**: Rating scales management
- **dashboard**: Dashboard and analytics access

### Permission Actions

- **read**: View/list items
- **write**: Create and edit items
- **delete**: Delete items
- **manage**: Full control (admin-level)

### Example Permissions

- `admin.manage` - Full admin access
- `users.read` - View users
- `users.write` - Create/edit users
- `users.delete` - Delete users
- `members.read` - View team members
- `dashboard.read` - Access dashboard

## 🛡️ **Security Features**

### Protected Routes
All admin and management pages are protected by authentication and permission checks:

```typescript
<ProtectedRoute permission="users.read">
  <UserManagementPage />
</ProtectedRoute>
```

### API Security
All API endpoints check for proper authentication and permissions:

```typescript
const session = await getServerSession(authOptions);
if (!session || !hasPermission(session, 'users.read')) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Session Management
- JWT-based sessions with NextAuth.js
- Automatic session refresh
- Secure cookie handling
- Session includes user role and permissions

## 👥 **User Management**

### Admin Features
- View all users with their roles and last login
- Assign or change user roles
- Delete users (except yourself)
- Track user activity

### Role Management
- Create custom roles with specific permissions
- Edit existing roles and their permissions
- Delete roles (if no users assigned)
- Set default role for new users

### User Experience
- Seamless Google Sign-In
- Automatic role assignment for new users
- Clear permission-based UI (features hidden if no access)
- Informative access denied messages

## 🔧 **Development**

### Adding New Permissions

1. Add to `DEFAULT_PERMISSIONS` in `src/lib/permissions.ts`
2. Update role assignments in `DEFAULT_ROLES`
3. Run the seed script to update the database
4. Use `hasPermission()` in components and API routes

### Custom Permission Checks

```typescript
import { hasPermission, canWrite } from '@/lib/permissions';

// Check specific permission
if (hasPermission(session, 'members.write')) {
  // Allow editing
}

// Check category-based permission
if (canWrite(session, 'members')) {
  // Allow writing to members
}
```

### Protected Components

```typescript
import ProtectedRoute from '@/components/auth/protected-route';

<ProtectedRoute permission="admin.manage">
  <AdminOnlyComponent />
</ProtectedRoute>
```

## 📊 **Default Roles & Permissions**

### Admin Role
- Full system access
- User and role management
- All CRUD operations
- Dashboard access

### Manager Role
- Team member management
- Skills and knowledge management
- Dashboard access
- No user/role management

### Member Role (Default)
- Read-only access to most data
- Dashboard viewing
- No administrative functions

## 🚨 **Important Security Notes**

1. **Change the NEXTAUTH_SECRET** in production
2. **Use HTTPS** in production environments
3. **Restrict Google OAuth** to your domain if needed
4. **Regularly review** user permissions and roles
5. **Monitor** user activity through the admin panel

## 🔄 **Migration from Previous Version**

If you're upgrading from a version without authentication:

1. Run the new migration: `npx prisma migrate dev --name add-auth-and-roles`
2. Seed the roles and permissions: `npx tsx scripts/seed.ts`
3. Set up Google OAuth credentials
4. Update environment variables
5. First user to sign in should be manually assigned Admin role

The application will continue to work, but all features will require authentication after the upgrade.