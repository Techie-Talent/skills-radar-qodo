import SidebarLayout from '@/components/layout/sidebar-layout';
import PermissionGuard from '@/components/auth/permission-guard';
import { getRoles, getPermissions } from '@/lib/data';
import RolesClient from './roles-client';

export default async function RolesPage() {
  const [roles, permissions] = await Promise.all([
    getRoles(),
    getPermissions(),
  ]);

  // Group permissions by category
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, typeof permissions>);

  const permissionsData = {
    permissions,
    groupedPermissions,
  };

  return (
    <PermissionGuard permission="roles.read">
      <SidebarLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Roles' }]}>
        <RolesClient initialRoles={roles} permissionsData={permissionsData} />
      </SidebarLayout>
    </PermissionGuard>
  );
}