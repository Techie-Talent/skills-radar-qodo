import SidebarLayout from '@/components/layout/sidebar-layout';
import PermissionGuard from '@/components/auth/permission-guard';
import { AdminPageSkeleton } from '@/components/ui/skeletons';

export default function SkillsLoading() {
  return (
    <PermissionGuard permission="skills.read">
      <SidebarLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Skills' }]}>
        <AdminPageSkeleton />
      </SidebarLayout>
    </PermissionGuard>
  );
}