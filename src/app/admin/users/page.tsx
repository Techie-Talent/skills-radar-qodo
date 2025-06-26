'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Edit, Trash2, Settings } from 'lucide-react';
import ProtectedRoute from '@/components/auth/protected-route';
import SidebarLayout from '@/components/layout/sidebar-layout';

interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: {
    id: string;
    name: string;
    description: string | null;
  } | null;
  createdAt: string;
  lastLoginAt: string | null;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/roles'),
      ]);

      if (!usersRes.ok || !rolesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [usersData, rolesData] = await Promise.all([
        usersRes.json(),
        rolesRes.json(),
      ]);

      setUsers(usersData);
      setRoles(rolesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditDialog(true);
  };

  const handleUpdateUser = async (roleId: string) => {
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roleId }),
      });

      if (!response.ok) throw new Error('Failed to update user');

      await fetchData();
      setShowEditDialog(false);
      setEditingUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete user');

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleColor = (roleName: string) => {
    const colors = {
      Admin: 'destructive',
      Manager: 'default',
      Member: 'secondary',
    };
    return colors[roleName as keyof typeof colors] || 'outline';
  };

  if (loading) {
    return (
      <ProtectedRoute permission="users.read">
        <SidebarLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'User Management' }]}>
          <div className="flex items-center justify-center h-32">
            <div className="text-lg text-muted-foreground">Loading...</div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute permission="users.read">
      <SidebarLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'User Management' }]}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
              <p className="text-muted-foreground">
                Manage users and their roles
              </p>
            </div>
            <Button asChild>
              <a href="/admin/roles">
                <Settings className="mr-2 h-4 w-4" />
                Manage Roles
              </a>
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
                        <AvatarFallback>
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{user.name || 'No name'}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.role && (
                        <Badge variant={getRoleColor(user.role.name) as "destructive" | "default" | "secondary" | "outline"}>
                          {user.role.name}
                        </Badge>
                      )}
                      {user.id === session?.user.id && (
                        <Badge variant="outline">You</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Joined:</span>
                      <div className="text-sm font-medium">{formatDate(user.createdAt)}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Last Login:</span>
                      <div className="text-sm font-medium">{formatDate(user.lastLoginAt)}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Role:</span>
                      <div className="text-sm font-medium">{user.role?.name || 'No role assigned'}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <div className="text-sm font-medium">
                        {user.lastLoginAt ? 'Active' : 'Never logged in'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Edit Role
                    </Button>
                    {user.id !== session?.user.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Delete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {users.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="text-4xl">👥</div>
                  <div>
                    <h3 className="text-lg font-semibold">No users found</h3>
                    <p className="text-muted-foreground">
                      Users will appear here after they sign in
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Edit User Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User Role</DialogTitle>
              <DialogDescription>
                Change the role for {editingUser?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">User</label>
                <div className="text-sm text-muted-foreground">
                  {editingUser?.name} ({editingUser?.email})
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <Select
                  defaultValue={editingUser?.role?.id || ''}
                  onValueChange={handleUpdateUser}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No role</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </SidebarLayout>
    </ProtectedRoute>
  );
}