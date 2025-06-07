import { Session } from 'next-auth';

export interface Permission {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  action: string;
}

// Permission categories and actions
export const PERMISSION_CATEGORIES = {
  ADMIN: 'admin',
  USERS: 'users',
  ROLES: 'roles',
  MEMBERS: 'members',
  SKILLS: 'skills',
  KNOWLEDGE_AREAS: 'knowledge_areas',
  SKILL_CATEGORIES: 'skill_categories',
  SCALES: 'scales',
  DASHBOARD: 'dashboard',
} as const;

export const PERMISSION_ACTIONS = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  MANAGE: 'manage',
} as const;

// Default permissions for seeding
export const DEFAULT_PERMISSIONS = [
  // Admin permissions
  { name: 'admin.manage', category: PERMISSION_CATEGORIES.ADMIN, action: PERMISSION_ACTIONS.MANAGE, description: 'Full admin access' },
  
  // User management
  { name: 'users.read', category: PERMISSION_CATEGORIES.USERS, action: PERMISSION_ACTIONS.READ, description: 'View users' },
  { name: 'users.write', category: PERMISSION_CATEGORIES.USERS, action: PERMISSION_ACTIONS.WRITE, description: 'Create and edit users' },
  { name: 'users.delete', category: PERMISSION_CATEGORIES.USERS, action: PERMISSION_ACTIONS.DELETE, description: 'Delete users' },
  
  // Role management
  { name: 'roles.read', category: PERMISSION_CATEGORIES.ROLES, action: PERMISSION_ACTIONS.READ, description: 'View roles' },
  { name: 'roles.write', category: PERMISSION_CATEGORIES.ROLES, action: PERMISSION_ACTIONS.WRITE, description: 'Create and edit roles' },
  { name: 'roles.delete', category: PERMISSION_CATEGORIES.ROLES, action: PERMISSION_ACTIONS.DELETE, description: 'Delete roles' },
  
  // Members
  { name: 'members.read', category: PERMISSION_CATEGORIES.MEMBERS, action: PERMISSION_ACTIONS.READ, description: 'View team members' },
  { name: 'members.write', category: PERMISSION_CATEGORIES.MEMBERS, action: PERMISSION_ACTIONS.WRITE, description: 'Create and edit team members' },
  { name: 'members.delete', category: PERMISSION_CATEGORIES.MEMBERS, action: PERMISSION_ACTIONS.DELETE, description: 'Delete team members' },
  
  // Skills
  { name: 'skills.read', category: PERMISSION_CATEGORIES.SKILLS, action: PERMISSION_ACTIONS.READ, description: 'View skills' },
  { name: 'skills.write', category: PERMISSION_CATEGORIES.SKILLS, action: PERMISSION_ACTIONS.WRITE, description: 'Create and edit skills' },
  { name: 'skills.delete', category: PERMISSION_CATEGORIES.SKILLS, action: PERMISSION_ACTIONS.DELETE, description: 'Delete skills' },
  
  // Knowledge Areas
  { name: 'knowledge_areas.read', category: PERMISSION_CATEGORIES.KNOWLEDGE_AREAS, action: PERMISSION_ACTIONS.READ, description: 'View knowledge areas' },
  { name: 'knowledge_areas.write', category: PERMISSION_CATEGORIES.KNOWLEDGE_AREAS, action: PERMISSION_ACTIONS.WRITE, description: 'Create and edit knowledge areas' },
  { name: 'knowledge_areas.delete', category: PERMISSION_CATEGORIES.KNOWLEDGE_AREAS, action: PERMISSION_ACTIONS.DELETE, description: 'Delete knowledge areas' },
  
  // Skill Categories
  { name: 'skill_categories.read', category: PERMISSION_CATEGORIES.SKILL_CATEGORIES, action: PERMISSION_ACTIONS.READ, description: 'View skill categories' },
  { name: 'skill_categories.write', category: PERMISSION_CATEGORIES.SKILL_CATEGORIES, action: PERMISSION_ACTIONS.WRITE, description: 'Create and edit skill categories' },
  { name: 'skill_categories.delete', category: PERMISSION_CATEGORIES.SKILL_CATEGORIES, action: PERMISSION_ACTIONS.DELETE, description: 'Delete skill categories' },
  
  // Scales
  { name: 'scales.read', category: PERMISSION_CATEGORIES.SCALES, action: PERMISSION_ACTIONS.READ, description: 'View scales' },
  { name: 'scales.write', category: PERMISSION_CATEGORIES.SCALES, action: PERMISSION_ACTIONS.WRITE, description: 'Create and edit scales' },
  { name: 'scales.delete', category: PERMISSION_CATEGORIES.SCALES, action: PERMISSION_ACTIONS.DELETE, description: 'Delete scales' },
  
  // Dashboard
  { name: 'dashboard.read', category: PERMISSION_CATEGORIES.DASHBOARD, action: PERMISSION_ACTIONS.READ, description: 'View dashboard' },
];

// Default roles
export const DEFAULT_ROLES = [
  {
    name: 'Admin',
    description: 'Full system access',
    isDefault: false,
    permissions: [
      'admin.manage',
      'users.read', 'users.write', 'users.delete',
      'roles.read', 'roles.write', 'roles.delete',
      'members.read', 'members.write', 'members.delete',
      'skills.read', 'skills.write', 'skills.delete',
      'knowledge_areas.read', 'knowledge_areas.write', 'knowledge_areas.delete',
      'skill_categories.read', 'skill_categories.write', 'skill_categories.delete',
      'scales.read', 'scales.write', 'scales.delete',
      'dashboard.read',
    ],
  },
  {
    name: 'Manager',
    description: 'Can manage team members and view all data',
    isDefault: false,
    permissions: [
      'members.read', 'members.write',
      'skills.read', 'skills.write',
      'knowledge_areas.read', 'knowledge_areas.write',
      'skill_categories.read', 'skill_categories.write',
      'scales.read', 'scales.write',
      'dashboard.read',
    ],
  },
  {
    name: 'Member',
    description: 'Basic access to view data',
    isDefault: true,
    permissions: [
      'members.read',
      'skills.read',
      'knowledge_areas.read',
      'skill_categories.read',
      'scales.read',
      'dashboard.read',
    ],
  },
];

// Utility functions
export function hasPermission(session: Session | null, permissionName: string): boolean {
  if (!session?.user?.permissions) return false;
  return session.user.permissions.some(p => p.name === permissionName);
}

export function hasAnyPermission(session: Session | null, permissionNames: string[]): boolean {
  if (!session?.user?.permissions) return false;
  return permissionNames.some(name => hasPermission(session, name));
}

export function hasRole(session: Session | null, roleName: string): boolean {
  return session?.user?.role?.name === roleName;
}

export function isAdmin(session: Session | null): boolean {
  return hasPermission(session, 'admin.manage');
}

export function canRead(session: Session | null, category: string): boolean {
  return hasPermission(session, `${category}.read`);
}

export function canWrite(session: Session | null, category: string): boolean {
  return hasPermission(session, `${category}.write`);
}

export function canDelete(session: Session | null, category: string): boolean {
  return hasPermission(session, `${category}.delete`);
}