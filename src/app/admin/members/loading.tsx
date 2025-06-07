import SidebarLayout from '@/components/layout/sidebar-layout';
import PermissionGuard from '@/components/auth/permission-guard';
import { AdminPageSkeleton } from '@/components/ui/skeletons';

export default function MembersLoading() {
  return (
    <PermissionGuard permission="members.read">
      <SidebarLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Team Members' }]}>
        <AdminPageSkeleton />
      </SidebarLayout>
    </PermissionGuard>
  );
}