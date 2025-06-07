import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProtectedRoute from '@/components/auth/protected-route';
import PermissionGuard from '@/components/auth/permission-guard';
import SidebarLayout from '@/components/layout/sidebar-layout';

export default function Home() {
  return (
    <ProtectedRoute permission="dashboard.read">
      <SidebarLayout breadcrumbs={[{ label: 'Home' }]}>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome to Skills Radar</h1>
            <p className="text-muted-foreground">
              Manage and visualize the skills of team members in your organization
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                <span className="text-2xl">👥</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">
                  Active team members
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Knowledge Areas</CardTitle>
                <span className="text-2xl">🧠</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">
                  Defined domains
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Skills</CardTitle>
                <span className="text-2xl">⚡</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">
                  Total skills tracked
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <span className="text-2xl">📊</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">
                  Ongoing assignments
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Manage your organization's skill data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <PermissionGuard permission="members.read">
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link href="/admin/members">
                      <span className="mr-2">👥</span>
                      Manage Team Members
                    </Link>
                  </Button>
                </PermissionGuard>
                
                <PermissionGuard permission="skills.read">
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link href="/admin/skills">
                      <span className="mr-2">⚡</span>
                      Manage Skills
                    </Link>
                  </Button>
                </PermissionGuard>
                
                <PermissionGuard permission="knowledge_areas.read">
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link href="/admin/knowledge-areas">
                      <span className="mr-2">🧠</span>
                      Knowledge Areas
                    </Link>
                  </Button>
                </PermissionGuard>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analytics & Search</CardTitle>
                <CardDescription>
                  Explore and analyze your talent data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/dashboard">
                    <span className="mr-2">📈</span>
                    View Dashboard
                  </Link>
                </Button>
                
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/dashboard/talent-search">
                    <span className="mr-2">🔍</span>
                    Talent Search
                  </Link>
                </Button>
                
                <PermissionGuard permission="members.write">
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link href="/admin/members/import">
                      <span className="mr-2">📥</span>
                      Import Members
                    </Link>
                  </Button>
                </PermissionGuard>
              </CardContent>
            </Card>
          </div>

          {/* Admin Section */}
          <PermissionGuard permission="users.read">
            <Card>
              <CardHeader>
                <CardTitle>Administration</CardTitle>
                <CardDescription>
                  System administration and user management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Button asChild className="justify-start" variant="outline">
                    <Link href="/admin/users">
                      <span className="mr-2">👤</span>
                      User Management
                    </Link>
                  </Button>
                  
                  <PermissionGuard permission="roles.read">
                    <Button asChild className="justify-start" variant="outline">
                      <Link href="/admin/roles">
                        <span className="mr-2">⚙️</span>
                        Role Management
                      </Link>
                    </Button>
                  </PermissionGuard>
                </div>
              </CardContent>
            </Card>
          </PermissionGuard>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}