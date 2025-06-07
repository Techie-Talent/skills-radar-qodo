import SidebarLayout from '@/components/layout/sidebar-layout';
import PermissionGuard from '@/components/auth/permission-guard';
import { TableSkeleton } from '@/components/ui/skeletons';

export default function RolesLoading() {
  return (
    <PermissionGuard permission="roles.read">
      <SidebarLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Role Management' }]}>
        <TableSkeleton />
      </SidebarLayout>
    </PermissionGuard>
  );
}