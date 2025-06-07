import SidebarLayout from '@/components/layout/sidebar-layout';
import PermissionGuard from '@/components/auth/permission-guard';
import { DashboardSkeleton } from '@/components/ui/skeletons';

export default function TalentSearchLoading() {
  return (
    <PermissionGuard permission="dashboard.read">
      <SidebarLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Dashboard', href: '/dashboard' }, { label: 'Talent Search' }]}>
        <DashboardSkeleton />
      </SidebarLayout>
    </PermissionGuard>
  );
}