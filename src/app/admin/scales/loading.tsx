import SidebarLayout from '@/components/layout/sidebar-layout';
import PermissionGuard from '@/components/auth/permission-guard';
import { AdminPageSkeleton } from '@/components/ui/skeletons';

export default function ScalesLoading() {
  return (
    <PermissionGuard permission="scales.read">
      <SidebarLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Scales' }]}>
        <AdminPageSkeleton />
      </SidebarLayout>
    </PermissionGuard>
  );
}