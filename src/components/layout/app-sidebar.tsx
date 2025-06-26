'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Brain,
  Tags,
  Zap,
  BarChart3,
  LayoutDashboard,
  Settings,
  UserCog,
  Upload,
  Search,
  Home,
  Key,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { hasPermission } from '@/lib/permissions';
import PermissionGuard from '@/components/auth/permission-guard';
import SignInButton from '@/components/auth/sign-in-button';

const navigationItems = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Home',
        url: '/',
        icon: Home,
        permission: 'dashboard.read',
      },
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
        permission: 'dashboard.read',
      },
      {
        title: 'Team Members',
        url: '/members/talent-search',
        icon: Users,
        permission: 'members.read',
      },
    ],
  },
  {
    title: 'Data Management',
    items: [
      {
        title: 'Knowledge Areas',
        url: '/admin/knowledge-areas',
        icon: Brain,
        permission: 'knowledge_areas.read',
      },
      {
        title: 'Skill Categories',
        url: '/admin/skill-categories',
        icon: Tags,
        permission: 'skill_categories.read',
      },
      {
        title: 'Skills',
        url: '/admin/skills',
        icon: Zap,
        permission: 'skills.read',
      },
      {
        title: 'Scales',
        url: '/admin/scales',
        icon: BarChart3,
        permission: 'scales.read',
      },
    ],
  },
  {
    title: 'Administration',
    items: [
      {
        title: 'Data Imports',
        url: '/admin/imports',
        icon: Upload,
        permission: 'members.write',
      },
      {
        title: 'User Management',
        url: '/admin/users',
        icon: UserCog,
        permission: 'users.read',
      },
      {
        title: 'Role Management',
        url: '/admin/roles',
        icon: Settings,
        permission: 'roles.read',
      },
      {
        title: 'API Keys',
        url: '/admin/api-keys',
        icon: Key,
        permission: 'admin.manage',
      },
    ],
  },
];

export function AppSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Brain className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Skills Radar</span>
            <span className="truncate text-xs text-muted-foreground">
              Techie Talent
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navigationItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <PermissionGuard key={item.title} permission={item.permission}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.url}
                      >
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </PermissionGuard>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SignInButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}